package main

import (
	"database/sql"
	"fmt"
	"os"

	_ "github.com/lib/pq"
)

type ApiConfig struct {
	ID               int
	WorkspaceID      string
	Name             string
	Slug             string
	Description      sql.NullString
	UpstreamURL      string
	SharedSecret     sql.NullString
	Status           string
	Environment      string
	RateLimitEnabled bool
	RateLimitMax     int
	RateLimitWindow  string
	CreatedAt        string
	UpdatedAt        string
}

func main() {
	dbUrl := os.Getenv("DATABASE_URL")
	db, err := sql.Open("postgres", dbUrl)
	if err != nil {
		fmt.Printf("Error opening DB: %v\n", err)
		return
	}

	slug := "jsonplaceholder-test"
	var api ApiConfig

	query := `
		SELECT id, workspace_id, name, slug, description, upstream_url, shared_secret,
		       status, environment, rate_limit_enabled, rate_limit_max, rate_limit_window,
		       created_at, updated_at
		FROM apis
		WHERE slug = $1 AND status = 'ACTIVE'
	`

	err = db.QueryRow(query, slug).Scan(
		&api.ID, &api.WorkspaceID, &api.Name, &api.Slug, &api.Description,
		&api.UpstreamURL, &api.SharedSecret, &api.Status, &api.Environment,
		&api.RateLimitEnabled, &api.RateLimitMax, &api.RateLimitWindow,
		&api.CreatedAt, &api.UpdatedAt,
	)

	if err != nil {
		fmt.Printf("DB error fetching API config: %v\n", err)
		return
	}
	fmt.Printf("Success! API: %+v\n", api)
}
