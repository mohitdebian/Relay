package main

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"strings"
	"time"
)

var baseTransport = &http.Transport{
	Proxy:                 http.ProxyFromEnvironment,
	ForceAttemptHTTP2:     true,
	MaxIdleConns:          100,
	IdleConnTimeout:       90 * time.Second,
	TLSHandshakeTimeout:   10 * time.Second,
	ExpectContinueTimeout: 1 * time.Second,
	ResponseHeaderTimeout: 10 * time.Second,
}

func sendError(w http.ResponseWriter, statusCode int, errorCode string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(map[string]string{"error": errorCode})
}

func hashApiKey(apiKey string) string {
	hash := sha256.Sum256([]byte(apiKey))
	return hex.EncodeToString(hash[:])
}

type retryTransport struct {
	transport  http.RoundTripper
	maxRetries int
}

func (t *retryTransport) RoundTrip(req *http.Request) (*http.Response, error) {
	var resp *http.Response
	var err error

	for i := 0; i <= t.maxRetries; i++ {
		// We must not modify the original request, but we might need to clone it if we had a body
		// For simplicity in this basic proxy, we just re-execute the request.
		// Note: A real robust retry needs to handle body rewinding.
		resp, err = t.transport.RoundTrip(req)
		
		if err != nil {
			log.Printf("Retry %d: Transport error: %v", i, err)
			continue
		}
		
		if resp.StatusCode == http.StatusBadGateway || resp.StatusCode == http.StatusServiceUnavailable || resp.StatusCode == http.StatusGatewayTimeout {
			log.Printf("Retry %d: Upstream returned %d", i, resp.StatusCode)
			if i < t.maxRetries {
				// Close the body before retrying to prevent connection leaks
				resp.Body.Close()
				time.Sleep(50 * time.Millisecond) // small backoff
				continue
			}
		}
		
		// If success or a non-retryable error, break and return
		break
	}

	return resp, err
}

// statusTrackingResponseWriter wraps http.ResponseWriter to capture the status code
type statusTrackingResponseWriter struct {
	http.ResponseWriter
	statusCode int
}

func (w *statusTrackingResponseWriter) WriteHeader(code int) {
	w.statusCode = code
	w.ResponseWriter.WriteHeader(code)
}

func proxyHandler(w http.ResponseWriter, r *http.Request) {
	start := time.Now()
	trackingWriter := &statusTrackingResponseWriter{
		ResponseWriter: w,
		statusCode:     http.StatusOK, // Default if not explicitly set
	}

	var apiId, apiKeyId, workspaceId int
	
	var reqHeadersStr, resHeadersStr string
	reqHeadersBytes, _ := json.Marshal(r.Header)
	reqHeadersStr = string(reqHeadersBytes)
	
	userAgent := r.UserAgent()
	ipAddress := r.RemoteAddr
	if forwarded := r.Header.Get("X-Forwarded-For"); forwarded != "" {
		ipAddress = strings.Split(forwarded, ",")[0]
	}

	defer func() {
		if apiId != 0 {
			latencyMs := time.Since(start).Milliseconds()
			loggedPath := "/"
			pathParts := strings.SplitN(strings.TrimPrefix(r.URL.Path, "/"), "/", 2)
			if len(pathParts) > 1 && pathParts[1] != "" {
				loggedPath = "/" + pathParts[1]
			}
			
			resHeadersBytes, _ := json.Marshal(trackingWriter.Header())
			resHeadersStr = string(resHeadersBytes)
			
			// Fire and forget logging the request
			go logRequest(apiId, apiKeyId, r.Method, loggedPath, trackingWriter.statusCode, latencyMs, workspaceId, ipAddress, userAgent, reqHeadersStr, resHeadersStr)
		}
	}()

	// r.URL.Path should look like /:slug/some/path
	pathParts := strings.SplitN(strings.TrimPrefix(r.URL.Path, "/"), "/", 2)
	if len(pathParts) == 0 || pathParts[0] == "" {
		sendError(trackingWriter, http.StatusNotFound, "api_not_found")
		return
	}

	slug := pathParts[0]
	restOfPath := ""
	if len(pathParts) > 1 {
		restOfPath = "/" + pathParts[1]
	}

	// 1. Fetch API configuration from DB
	api, err := getApiBySlug(slug)
	if err != nil {
		log.Printf("DB error fetching API config: %v", err)
		sendError(trackingWriter, http.StatusInternalServerError, "internal_error")
		return
	}
	if api == nil {
		sendError(trackingWriter, http.StatusNotFound, "api_not_found")
		return
	}

	// Now we know the API, capture for logging
	apiId = api.ID
	workspaceId = api.WorkspaceID

	// 2. Extract and Verify API Key
	rawKey := r.Header.Get("X-API-Key")
	if rawKey == "" {
		sendError(trackingWriter, http.StatusUnauthorized, "missing_api_key")
		return
	}

	keyHash := hashApiKey(rawKey)
	apiKeyInfo, err := getApiKeyByHash(keyHash, api.ID)
	if err != nil {
		log.Printf("DB error fetching API key: %v", err)
		sendError(trackingWriter, http.StatusInternalServerError, "internal_error")
		return
	}
	if apiKeyInfo == nil {
		sendError(trackingWriter, http.StatusUnauthorized, "invalid_api_key")
		return
	}

	// Now we know the key, capture for logging
	apiKeyId = apiKeyInfo.ID

	// Check if key is revoked
	if apiKeyInfo.RevokedAt.Valid {
		sendError(trackingWriter, http.StatusUnauthorized, "invalid_api_key")
		return
	}

	// Check if key is expired
	if apiKeyInfo.ExpiresAt.Valid && apiKeyInfo.ExpiresAt.Time.Before(time.Now()) {
		sendError(trackingWriter, http.StatusUnauthorized, "invalid_api_key")
		return
	}

	// 2.5 Rate Limiting
	if api.RateLimitEnabled {
		allowed, remaining, resetTime, err := CheckRateLimit(r.Context(), api.ID, apiKeyInfo.ID, api.RateLimitMax, api.RateLimitWindow)
		if err != nil {
			log.Printf("Redis error checking rate limit: %v", err)
			sendError(trackingWriter, http.StatusInternalServerError, "internal_error")
			return
		}

		trackingWriter.Header().Set("X-RateLimit-Limit", fmt.Sprintf("%d", api.RateLimitMax))
		trackingWriter.Header().Set("X-RateLimit-Remaining", fmt.Sprintf("%d", remaining))
		trackingWriter.Header().Set("X-RateLimit-Reset", fmt.Sprintf("%d", resetTime))

		if !allowed {
			trackingWriter.Header().Set("Retry-After", fmt.Sprintf("%d", resetTime-time.Now().Unix()))
			trackingWriter.Header().Set("Content-Type", "application/json")
			trackingWriter.WriteHeader(http.StatusTooManyRequests)
			json.NewEncoder(trackingWriter).Encode(map[string]string{
				"error":   "rate_limit_exceeded",
				"message": "Too many requests",
			})
			return
		}
	}

	// Fire and forget updating last used at
	go updateApiKeyLastUsed(apiKeyInfo.ID)

	// 3. Parse Upstream URL
	targetUrl, err := url.Parse(api.UpstreamURL)
	if err != nil {
		log.Printf("Invalid upstream URL %s: %v", api.UpstreamURL, err)
		sendError(trackingWriter, http.StatusInternalServerError, "upstream_invalid")
		return
	}

	// 4. Create Reverse Proxy
	proxy := httputil.NewSingleHostReverseProxy(targetUrl)

	// Use global baseTransport for connection pooling
	proxy.Transport = &retryTransport{
		transport:  baseTransport,
		maxRetries: 1, // Simple 1-attempt retry
	}

	// Customize the director to append the remaining path
	originalDirector := proxy.Director
	proxy.Director = func(req *http.Request) {
		originalDirector(req)
		
		targetPath := strings.TrimSuffix(targetUrl.Path, "/")
		req.URL.Path = targetPath + restOfPath
		req.Host = targetUrl.Host
		
		req.Header.Del("X-API-Key")
		req.Header.Set("X-Relay-Api-Id", fmt.Sprintf("%d", api.ID))
		if api.SharedSecret.Valid && api.SharedSecret.String != "" {
			req.Header.Set("X-Relay-Signature", api.SharedSecret.String)
		}
	}

	// Customize ErrorHandler to handle upstream unavailable
	proxy.ErrorHandler = func(w http.ResponseWriter, req *http.Request, proxyErr error) {
		log.Printf("Upstream error for API %s: %v", api.Slug, proxyErr)
		sendError(trackingWriter, http.StatusBadGateway, "upstream_unavailable")
	}

	// 5. Execute Proxy
	proxy.ServeHTTP(trackingWriter, r)
}
