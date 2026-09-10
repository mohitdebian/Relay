package main

import (
	"database/sql"
	"time"
)

type ApiConfig struct {
	ID               int
	WorkspaceID      int
	Name             string
	Slug             string
	Description      sql.NullString
	UpstreamURL      string
	Status           string
	Environment      string
	RateLimitEnabled bool
	RateLimitMax     int
	RateLimitWindow  int
	CreatedAt        time.Time
	UpdatedAt        time.Time
}

type ApiKey struct {
	ID          int
	WorkspaceID int
	ApiID       int
	Name        string
	KeyHash     string
	KeyPrefix   string
	Environment string
	ExpiresAt   sql.NullTime
	LastUsedAt  sql.NullTime
	CreatedAt   time.Time
	RevokedAt   sql.NullTime
}
