package main

import (
	"context"
	"log"

	"github.com/aprator/date/internal/config"
	"github.com/aprator/date/internal/database"
	"github.com/aprator/date/internal/email"
	"github.com/aprator/date/internal/router"
	"github.com/aprator/date/internal/storage"
	"github.com/aws/aws-sdk-go-v2/service/s3"
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

	var s3Client *s3.Client
	if cfg.S3BucketName != "" {
		s3Client, err = storage.NewS3Client(context.Background(), cfg.AWSRegion)
		if err != nil {
			log.Printf("AWS not configured, photo uploads will be unavailable: %v", err)
			s3Client = nil
		}
	}

	r := router.Setup(db, cfg, sesClient, s3Client)

	log.Printf("server starting on port %s", cfg.ServerPort)
	if err := r.Run(":" + cfg.ServerPort); err != nil {
		log.Fatalf("failed to start server: %v", err)
	}
}
