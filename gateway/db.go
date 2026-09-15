package main

import (
	"database/sql"
	"fmt"
	"log"
	"sync"
	"time"

	"github.com/lib/pq"
)

var db *sql.DB

type cacheItem struct {
	value     interface{}
	expiresAt time.Time
}

var (
	cacheMutex sync.RWMutex
	cacheMap   = make(map[string]cacheItem)
)

const cacheTTL = 60 * time.Second

func getFromCache(key string) (interface{}, bool) {
	cacheMutex.RLock()
	defer cacheMutex.RUnlock()
	item, found := cacheMap[key]
	if !found {
		return nil, false
	}
	if time.Now().After(item.expiresAt) {
		return nil, false // Expired
	}
	return item.value, true
}

func setToCache(key string, value interface{}) {
	cacheMutex.Lock()
	defer cacheMutex.Unlock()
	cacheMap[key] = cacheItem{
		value:     value,
		expiresAt: time.Now().Add(cacheTTL),
	}
}

func startCacheSweeper() {
	ticker := time.NewTicker(5 * time.Minute)
	go func() {
		for range ticker.C {
			cacheMutex.Lock()
			now := time.Now()
			for k, v := range cacheMap {
				if now.After(v.expiresAt) {
					delete(cacheMap, k)
				}
			}
			cacheMutex.Unlock()
		}
	}()
}

func init() {
	startCacheSweeper()
}

func initDB(connStr string) error {
	var err error
	db, err = sql.Open("postgres", connStr)
	if err != nil {
		return err
	}

	if err = db.Ping(); err != nil {
		return err
	}

	log.Println("Connected to PostgreSQL successfully")
	return nil
}

func getApiBySlug(slug string) (*ApiConfig, error) {
	cacheKey := "api:" + slug
	if val, ok := getFromCache(cacheKey); ok {
		return val.(*ApiConfig), nil
	}

	api := &ApiConfig{}
	query := `
		SELECT id, workspace_id, name, slug, description, upstream_url, shared_secret, status, environment, 
		       rate_limit_enabled, rate_limit_max, rate_limit_window, created_at, updated_at
		FROM apis
		WHERE slug = $1 AND status = 'ACTIVE'
	`
	err := db.QueryRow(query, slug).Scan(
		&api.ID, &api.WorkspaceID, &api.Name, &api.Slug, &api.Description,
		&api.UpstreamURL, &api.SharedSecret, &api.Status, &api.Environment, 
		&api.RateLimitEnabled, &api.RateLimitMax, &api.RateLimitWindow, 
		&api.CreatedAt, &api.UpdatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			setToCache(cacheKey, (*ApiConfig)(nil)) // Cache negative result
			return nil, nil // API not found
		}
		return nil, err
	}
	
	setToCache(cacheKey, api)
	return api, nil
}

func getApiKeyByHash(keyHash string, apiId int) (*ApiKey, error) {
	cacheKey := fmt.Sprintf("apikey:%d:%s", apiId, keyHash)
	if val, ok := getFromCache(cacheKey); ok {
		return val.(*ApiKey), nil
	}

	apiKey := &ApiKey{}
	query := `
		SELECT id, workspace_id, api_id, name, key_hash, key_prefix, environment, expires_at, last_used_at, created_at, revoked_at
		FROM api_keys
		WHERE key_hash = $1 AND api_id = $2
	`
	err := db.QueryRow(query, keyHash, apiId).Scan(
		&apiKey.ID, &apiKey.WorkspaceID, &apiKey.ApiID, &apiKey.Name,
		&apiKey.KeyHash, &apiKey.KeyPrefix, &apiKey.Environment,
		&apiKey.ExpiresAt, &apiKey.LastUsedAt, &apiKey.CreatedAt, &apiKey.RevokedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			setToCache(cacheKey, (*ApiKey)(nil))
			return nil, nil // API key not found
		}
		return nil, err
	}
	
	setToCache(cacheKey, apiKey)
	return apiKey, nil
}

type RequestLog struct {
	ApiID       int
	ApiKeyID    int
	Method      string
	Path        string
	StatusCode      int
	LatencyMs       int64
	WorkspaceID     int
	IpAddress       string
	UserAgent       string
	RequestHeaders  string
	ResponseHeaders string
}

var (
	logChan = make(chan RequestLog, 10000)
	keyChan = make(chan int, 10000)
	doneChan = make(chan struct{})
	wg sync.WaitGroup
)

func init() {
	wg.Add(1)
	go processBatches()
}

func processBatches() {
	defer wg.Done()
	ticker := time.NewTicker(1 * time.Second)
	var logBatch []RequestLog
	var keyBatch []int

	for {
		select {
		case l := <-logChan:
			logBatch = append(logBatch, l)
			if len(logBatch) >= 1000 {
				flushLogs(logBatch)
				logBatch = nil
			}
		case k := <-keyChan:
			keyBatch = append(keyBatch, k)
			if len(keyBatch) >= 1000 {
				flushKeys(keyBatch)
				keyBatch = nil
			}
		case <-ticker.C:
			if len(logBatch) > 0 {
				flushLogs(logBatch)
				logBatch = nil
			}
			if len(keyBatch) > 0 {
				flushKeys(keyBatch)
				keyBatch = nil
			}
		case <-doneChan:
			ticker.Stop()
			// Drain remaining in channels
			close(logChan)
			for l := range logChan {
				logBatch = append(logBatch, l)
			}
			close(keyChan)
			for k := range keyChan {
				keyBatch = append(keyBatch, k)
			}
			if len(logBatch) > 0 {
				flushLogs(logBatch)
			}
			if len(keyBatch) > 0 {
				flushKeys(keyBatch)
			}
			return
		}
	}
}

func ShutdownLogger() {
	close(doneChan)
	wg.Wait()
}

func flushLogs(logs []RequestLog) {
	if len(logs) == 0 {
		return
	}
	
	// Fast bulk insert using unnest
	query := `
		INSERT INTO api_request_logs (api_id, api_key_id, method, path, status_code, latency_ms, workspace_id, ip_address, user_agent, request_headers, response_headers)
		SELECT * FROM unnest($1::int[], $2::int[], $3::varchar[], $4::varchar[], $5::int[], $6::int[], $7::int[], $8::varchar[], $9::text[], $10::jsonb[], $11::jsonb[])
	`
	
	apiIds := make([]int, len(logs))
	keyIds := make([]sql.NullInt64, len(logs))
	methods := make([]string, len(logs))
	paths := make([]string, len(logs))
	statuses := make([]int, len(logs))
	latencies := make([]int64, len(logs))
	workspaceIds := make([]int, len(logs))
	ips := make([]sql.NullString, len(logs))
	userAgents := make([]sql.NullString, len(logs))
	reqHeaders := make([]sql.NullString, len(logs))
	resHeaders := make([]sql.NullString, len(logs))
	
	for i, l := range logs {
		apiIds[i] = l.ApiID
		
		if l.ApiKeyID > 0 {
			keyIds[i] = sql.NullInt64{Int64: int64(l.ApiKeyID), Valid: true}
		} else {
			keyIds[i] = sql.NullInt64{Valid: false}
		}
		
		methods[i] = l.Method
		if l.Path == "" {
			l.Path = "/"
		}
		paths[i] = l.Path
		statuses[i] = l.StatusCode
		latencies[i] = l.LatencyMs
		workspaceIds[i] = l.WorkspaceID
		
		if l.IpAddress != "" {
			ips[i] = sql.NullString{String: l.IpAddress, Valid: true}
		} else {
			ips[i] = sql.NullString{Valid: false}
		}
		
		if l.UserAgent != "" {
			userAgents[i] = sql.NullString{String: l.UserAgent, Valid: true}
		} else {
			userAgents[i] = sql.NullString{Valid: false}
		}
		
		if l.RequestHeaders != "" {
			reqHeaders[i] = sql.NullString{String: l.RequestHeaders, Valid: true}
		} else {
			reqHeaders[i] = sql.NullString{Valid: false}
		}
		
		if l.ResponseHeaders != "" {
			resHeaders[i] = sql.NullString{String: l.ResponseHeaders, Valid: true}
		} else {
			resHeaders[i] = sql.NullString{Valid: false}
		}
	}
	
	_, err := db.Exec(query, 
		pq.Array(apiIds), pq.Array(keyIds), pq.Array(methods), 
		pq.Array(paths), pq.Array(statuses), pq.Array(latencies),
		pq.Array(workspaceIds), pq.Array(ips), pq.Array(userAgents),
		pq.Array(reqHeaders), pq.Array(resHeaders),
	)
	if err != nil {
		log.Printf("Failed to bulk insert logs: %v", err)
	}
}

func flushKeys(keys []int) {
	if len(keys) == 0 {
		return
	}
	// Deduplicate keys
	keyMap := make(map[int]bool)
	var uniqueKeys []int
	for _, k := range keys {
		if !keyMap[k] {
			keyMap[k] = true
			uniqueKeys = append(uniqueKeys, k)
		}
	}
	
	query := `
		UPDATE api_keys SET last_used_at = CURRENT_TIMESTAMP 
		WHERE id = ANY($1)
	`
	
	_, err := db.Exec(query, pq.Array(uniqueKeys))
	if err != nil {
		log.Printf("Failed to bulk update last_used_at: %v", err)
	}
}

func updateApiKeyLastUsed(id int) {
	select {
	case keyChan <- id:
	default:
		log.Printf("WARN: Key channel full, dropping last_used update for key ID %d", id)
	}
}

func logRequest(apiId int, apiKeyId int, method string, path string, statusCode int, latencyMs int64, workspaceId int, ipAddress string, userAgent string, reqHeaders string, resHeaders string) {
	select {
	case logChan <- RequestLog{
		ApiID:           apiId,
		ApiKeyID:        apiKeyId,
		Method:          method,
		Path:            path,
		StatusCode:      statusCode,
		LatencyMs:       latencyMs,
		WorkspaceID:     workspaceId,
		IpAddress:       ipAddress,
		UserAgent:       userAgent,
		RequestHeaders:  reqHeaders,
		ResponseHeaders: resHeaders,
	}:
	default:
		log.Printf("WARN: Log channel full, dropping request log for API ID %d", apiId)
	}
}
