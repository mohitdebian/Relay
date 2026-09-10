package main

import (
	"database/sql"
	"log"

	_ "github.com/lib/pq"
)

var db *sql.DB

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
	api := &ApiConfig{}
	query := `
		SELECT id, workspace_id, name, slug, description, upstream_url, status, environment, 
		       rate_limit_enabled, rate_limit_max, rate_limit_window, created_at, updated_at
		FROM apis
		WHERE slug = $1 AND status = 'ACTIVE'
	`
	err := db.QueryRow(query, slug).Scan(
		&api.ID, &api.WorkspaceID, &api.Name, &api.Slug, &api.Description,
		&api.UpstreamURL, &api.Status, &api.Environment, 
		&api.RateLimitEnabled, &api.RateLimitMax, &api.RateLimitWindow, 
		&api.CreatedAt, &api.UpdatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil // API not found
		}
		return nil, err
	}
	return api, nil
}

func getApiKeyByHash(keyHash string, apiId int) (*ApiKey, error) {
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
			return nil, nil // API key not found
		}
		return nil, err
	}
	return apiKey, nil
}

func updateApiKeyLastUsed(id int) {
	query := `UPDATE api_keys SET last_used_at = CURRENT_TIMESTAMP WHERE id = $1`
	_, err := db.Exec(query, id)
	if err != nil {
		log.Printf("Failed to update last_used_at for key %d: %v", id, err)
	}
}

func logRequest(apiId int, apiKeyId int, statusCode int, latencyMs int64) {
	query := `
		INSERT INTO api_request_logs (api_id, api_key_id, status_code, latency_ms)
		VALUES ($1, $2, $3, $4)
	`
	_, err := db.Exec(query, apiId, apiKeyId, statusCode, latencyMs)
	if err != nil {
		log.Printf("Failed to log request for API %d: %v", apiId, err)
	}
}
