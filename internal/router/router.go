package router

import (
	"net/http"

	"github.com/aprator/date/internal/config"
	"github.com/aprator/date/internal/handlers"
	"github.com/aprator/date/internal/middleware"
	"github.com/aws/aws-sdk-go-v2/service/sesv2"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

func Setup(db *pgxpool.Pool, cfg config.Config, sesClient *sesv2.Client) *gin.Engine {
	r := gin.Default()
	r.Use(corsMiddleware())

	authHandler := handlers.NewAuthHandler(db, cfg.JWTSecret, sesClient, cfg.SESFromAddress, cfg.PublicBaseURL)

	auth := r.Group("/auth")
	{
		auth.POST("/register", authHandler.Register)
		auth.POST("/login", authHandler.Login)
		auth.GET("/verify-email", authHandler.VerifyEmail)
		auth.POST("/resend-verification", authHandler.ResendVerification)
	}

	protected := r.Group("/users")
	protected.Use(middleware.AuthRequired(cfg.JWTSecret))
	{
		protected.GET("/me", authHandler.GetMe)
	}

	return r
}

// corsMiddleware allows the Expo web dev server (a different origin) to call this
// API during local development. Native builds don't need CORS at all.
func corsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}
