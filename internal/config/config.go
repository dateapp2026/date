package config

import "os"

type Config struct {
	DatabaseURL string
	JWTSecret   string
	ServerPort  string
}

func Load() Config {
	return Config{
		DatabaseURL: getEnv("DATABASE_URL", "postgres://localhost:5432/dateapp?sslmode=disable"),
		JWTSecret:   getEnv("JWT_SECRET", "change-this-to-a-random-secret"),
		ServerPort:  getEnv("SERVER_PORT", "8080"),
	}
}

func getEnv(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}
