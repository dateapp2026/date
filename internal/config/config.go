package config

import "os"

type Config struct {
	DatabaseURL    string
	JWTSecret      string
	ServerPort     string
	AWSRegion      string
	S3BucketName   string
	SESFromAddress string
	PublicBaseURL  string
}

func Load() Config {
	return Config{
		DatabaseURL:    getEnv("DATABASE_URL", "postgres://localhost:5432/dateapp?sslmode=disable"),
		JWTSecret:      getEnv("JWT_SECRET", "change-this-to-a-random-secret"),
		ServerPort:     getEnv("SERVER_PORT", "8080"),
		AWSRegion:      getEnv("AWS_REGION", "us-east-1"),
		S3BucketName:   getEnv("S3_BUCKET_NAME", ""),
		SESFromAddress: getEnv("SES_FROM_ADDRESS", ""),
		PublicBaseURL:  getEnv("PUBLIC_BASE_URL", "http://localhost:8080"),
	}
}

func getEnv(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}
