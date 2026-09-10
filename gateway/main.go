package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
)

type HealthResponse struct {
	Status string `json:"status"`
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(HealthResponse{Status: "ok"})
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	dbUrl := os.Getenv("DATABASE_URL")
	if dbUrl == "" {
		log.Fatal("DATABASE_URL is not set")
	}

	err := initDB(dbUrl)
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	redisUrl := os.Getenv("REDIS_URL")
	if redisUrl == "" {
		log.Fatal("REDIS_URL is not set")
	}

	err = initRedis(redisUrl)
	if err != nil {
		log.Fatalf("Failed to initialize redis: %v", err)
	}

	// Internal health check route
	http.HandleFunc("/health", healthHandler)

	// All other routes go to the proxy handler
	http.HandleFunc("/", proxyHandler)

	fmt.Printf("Starting gateway on port %s\n", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
