package main

import (
	"context"
	"log"

	"github.com/aprator/date/internal/config"
	"github.com/aprator/date/internal/database"
	"github.com/aprator/date/internal/email"
	"github.com/aprator/date/internal/router"
	"github.com/aws/aws-sdk-go-v2/service/sesv2"
	"github.com/joho/godotenv"
)

func main() {
	godotenv.Load()

	cfg := config.Load()

	db, err := database.Connect(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}
	defer db.Close()

	var sesClient *sesv2.Client
	if cfg.SESFromAddress != "" {
		sesClient, err = email.NewSESClient(context.Background(), cfg.AWSRegion)
		if err != nil {
			log.Printf("AWS not configured, verification emails will be logged instead of sent: %v", err)
			sesClient = nil
		}
	}

	r := router.Setup(db, cfg, sesClient)

	log.Printf("server starting on port %s", cfg.ServerPort)
	if err := r.Run(":" + cfg.ServerPort); err != nil {
		log.Fatalf("failed to start server: %v", err)
	}
}
