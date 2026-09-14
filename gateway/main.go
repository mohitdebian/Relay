package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"
)

type HealthResponse struct {
	Status string `json:"status"`
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	// Ping the backend API to keep it awake on Render Free Tier
	backendUrl := os.Getenv("BACKEND_URL")
	if backendUrl != "" {
		// We ignore errors here since this is just a keep-alive ping
		go http.Get(backendUrl + "/health")
	}

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

	server := &http.Server{
		Addr:    ":" + port,
		Handler: nil, // uses DefaultServeMux
	}

	// Channel to listen for errors coming from the listener.
	serverErrors := make(chan error, 1)

	go func() {
		fmt.Printf("Starting gateway on port %s\n", port)
		serverErrors <- server.ListenAndServe()
	}()

	// Channel to listen for an interrupt or terminate signal from the OS.
	osSignals := make(chan os.Signal, 1)
	signal.Notify(osSignals, os.Interrupt, syscall.SIGTERM)

	select {
	case err := <-serverErrors:
		log.Fatalf("Error starting server: %v", err)
	case <-osSignals:
		fmt.Println("\nStarting graceful shutdown...")
		
		// Create context with timeout for shutdown
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		// Attempt graceful shutdown
		if err := server.Shutdown(ctx); err != nil {
			log.Printf("Graceful shutdown did not complete in %v: %v", 10*time.Second, err)
			if err := server.Close(); err != nil {
				log.Printf("Error killing server: %v", err)
			}
		}

		// Flush remaining logs
		fmt.Println("Flushing remaining request logs...")
		ShutdownLogger()
		
		fmt.Println("Shutdown complete")
	}
}
