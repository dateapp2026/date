package router

import (
	"github.com/aprator/date/internal/config"
	"github.com/aprator/date/internal/handlers"
	"github.com/aprator/date/internal/middleware"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

func Setup(db *pgxpool.Pool, cfg config.Config) *gin.Engine {
	r := gin.Default()

	authHandler := handlers.NewAuthHandler(db, cfg.JWTSecret)

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
