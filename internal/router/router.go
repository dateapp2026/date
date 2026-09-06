package router

import (
	"net/http"

	"github.com/aprator/date/internal/config"
	"github.com/aprator/date/internal/handlers"
	"github.com/aprator/date/internal/middleware"
	"github.com/aprator/date/internal/storage"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/aws/aws-sdk-go-v2/service/sesv2"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

func Setup(db *pgxpool.Pool, cfg config.Config, sesClient *sesv2.Client, s3Client *s3.Client) *gin.Engine {
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

	if s3Client != nil {
		photosHandler := handlers.NewPhotosHandler(db, s3Client, storage.NewPresignClient(s3Client), cfg.S3BucketName, cfg.AWSRegion)

		photos := r.Group("/photos")
		photos.Use(middleware.AuthRequired(cfg.JWTSecret))
		{
			photos.GET("", photosHandler.ListPhotos)
			photos.POST("", photosHandler.CreatePhoto)
			photos.POST("/presign-upload", photosHandler.PresignUpload)
			photos.DELETE("/:id", photosHandler.DeletePhoto)
		}

		discoverHandler := handlers.NewDiscoverHandler(db, storage.NewPresignClient(s3Client), cfg.S3BucketName, cfg.AWSRegion)

		discover := r.Group("/discover")
		discover.Use(middleware.AuthRequired(cfg.JWTSecret))
		discover.GET("", discoverHandler.ListCandidates)

		swipes := r.Group("/swipes")
		swipes.Use(middleware.AuthRequired(cfg.JWTSecret))
		swipes.POST("", discoverHandler.CreateSwipe)
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
