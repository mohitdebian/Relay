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
	// r.URL.Path should look like /:slug/some/path
	pathParts := strings.SplitN(strings.TrimPrefix(r.URL.Path, "/"), "/", 2)
	if len(pathParts) == 0 || pathParts[0] == "" {
		sendError(w, http.StatusNotFound, "api_not_found")
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
		sendError(w, http.StatusInternalServerError, "internal_error")
		return
	}
	if api == nil {
		sendError(w, http.StatusNotFound, "api_not_found")
		return
	}

	// 2. Extract and Verify API Key
	rawKey := r.Header.Get("X-API-Key")
	if rawKey == "" {
		sendError(w, http.StatusUnauthorized, "missing_api_key")
		return
	}

	keyHash := hashApiKey(rawKey)
	apiKeyInfo, err := getApiKeyByHash(keyHash, api.ID)
	if err != nil {
		log.Printf("DB error fetching API key: %v", err)
		sendError(w, http.StatusInternalServerError, "internal_error")
		return
	}
	if apiKeyInfo == nil {
		sendError(w, http.StatusUnauthorized, "invalid_api_key")
		return
	}

	// Check if key is revoked
	if apiKeyInfo.RevokedAt.Valid {
		sendError(w, http.StatusUnauthorized, "invalid_api_key")
		return
	}

	// Check if key is expired
	if apiKeyInfo.ExpiresAt.Valid && apiKeyInfo.ExpiresAt.Time.Before(time.Now()) {
		sendError(w, http.StatusUnauthorized, "invalid_api_key")
		return
	}

	// 2.5 Rate Limiting
	if api.RateLimitEnabled {
		allowed, remaining, resetTime, err := CheckRateLimit(r.Context(), api.ID, apiKeyInfo.ID, api.RateLimitMax, api.RateLimitWindow)
		if err != nil {
			log.Printf("Redis error checking rate limit: %v", err)
			sendError(w, http.StatusInternalServerError, "internal_error")
			return
		}

		w.Header().Set("X-RateLimit-Limit", fmt.Sprintf("%d", api.RateLimitMax))
		w.Header().Set("X-RateLimit-Remaining", fmt.Sprintf("%d", remaining))
		w.Header().Set("X-RateLimit-Reset", fmt.Sprintf("%d", resetTime))

		if !allowed {
			w.Header().Set("Retry-After", fmt.Sprintf("%d", resetTime-time.Now().Unix()))
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusTooManyRequests)
			json.NewEncoder(w).Encode(map[string]string{
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
		sendError(w, http.StatusInternalServerError, "upstream_invalid")
		return
	}

	// 4. Create Reverse Proxy
	proxy := httputil.NewSingleHostReverseProxy(targetUrl)

	// Set up a custom Transport with Timeouts and a simple Retry
	baseTransport := &http.Transport{
		Proxy:                 http.ProxyFromEnvironment,
		ForceAttemptHTTP2:     true,
		MaxIdleConns:          100,
		IdleConnTimeout:       90 * time.Second,
		TLSHandshakeTimeout:   10 * time.Second,
		ExpectContinueTimeout: 1 * time.Second,
		ResponseHeaderTimeout: 10 * time.Second,
	}

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
		sendError(w, http.StatusBadGateway, "upstream_unavailable")
	}

	// 5. Execute Proxy
	start := time.Now()
	trackingWriter := &statusTrackingResponseWriter{
		ResponseWriter: w,
		statusCode:     http.StatusOK, // Default if not explicitly set
	}
	
	proxy.ServeHTTP(trackingWriter, r)

	// Fire and forget logging the request
	latencyMs := time.Since(start).Milliseconds()
	loggedPath := restOfPath
	if loggedPath == "" {
		loggedPath = "/"
	}
	go logRequest(api.ID, apiKeyInfo.ID, r.Method, loggedPath, trackingWriter.statusCode, latencyMs)
}
