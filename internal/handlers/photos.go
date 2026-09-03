package handlers

import (
	"context"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/aprator/date/internal/models"
	"github.com/aprator/date/internal/storage"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

const uploadPresignExpiry = 15 * time.Minute
const viewPresignExpiry = 1 * time.Hour

var allowedPhotoContentTypes = map[string]string{
	"image/jpeg": "jpg",
	"image/png":  "png",
	"image/webp": "webp",
}

type PhotosHandler struct {
	DB        *pgxpool.Pool
	S3Client  *s3.Client
	Presigner *s3.PresignClient
	Bucket    string
	Region    string
}

func NewPhotosHandler(db *pgxpool.Pool, s3Client *s3.Client, presigner *s3.PresignClient, bucket, region string) *PhotosHandler {
	return &PhotosHandler{
		DB:        db,
		S3Client:  s3Client,
		Presigner: presigner,
		Bucket:    bucket,
		Region:    region,
	}
}

// PresignUpload issues a short-lived URL the client PUTs the photo bytes to
// directly, so large files never pass through this server.
func (h *PhotosHandler) PresignUpload(c *gin.Context) {
	var req struct {
		ContentType string `json:"content_type" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ext, ok := allowedPhotoContentTypes[req.ContentType]
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "content_type must be one of image/jpeg, image/png, image/webp"})
		return
	}

	userID := c.GetString("user_id")
	token, err := generateToken()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate upload key"})
		return
	}
	key := fmt.Sprintf("users/%s/%s.%s", userID, token, ext)

	uploadURL, err := storage.PresignPutObject(c.Request.Context(), h.Presigner, h.Bucket, key, req.ContentType, uploadPresignExpiry)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create upload url"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"upload_url": uploadURL,
		"key":        key,
		"expires_in": int(uploadPresignExpiry.Seconds()),
	})
}

// presignView returns a short-lived GET URL for a private object — the
// bucket has no public access, so every view needs a fresh signature.
func (h *PhotosHandler) presignView(ctx context.Context, key string) (string, error) {
	return storage.PresignGetObject(ctx, h.Presigner, h.Bucket, key, viewPresignExpiry)
}

// CreatePhoto records a photo the client already uploaded to the presigned
// key, attaching it to the current user.
func (h *PhotosHandler) CreatePhoto(c *gin.Context) {
	var req struct {
		Key      string `json:"key" binding:"required"`
		Position int    `json:"position"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID := c.GetString("user_id")
	if !strings.HasPrefix(req.Key, fmt.Sprintf("users/%s/", userID)) {
		c.JSON(http.StatusForbidden, gin.H{"error": "key does not belong to this user"})
		return
	}

	// The bucket is private, so the stored `url` is never served directly —
	// every response gets a freshly presigned GET built from s3_key instead.
	placeholderURL := storage.PublicObjectURL(h.Bucket, h.Region, req.Key)

	var photo models.Photo
	err := h.DB.QueryRow(context.Background(),
		`INSERT INTO photos (user_id, url, s3_key, position) VALUES ($1, $2, $3, $4)
		 RETURNING id, position, created_at`,
		userID, placeholderURL, req.Key, req.Position,
	).Scan(&photo.ID, &photo.Position, &photo.CreatedAt)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save photo"})
		return
	}

	viewURL, err := h.presignView(c.Request.Context(), req.Key)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "photo saved but failed to create view url"})
		return
	}
	photo.URL = viewURL

	c.JSON(http.StatusCreated, photo)
}

func (h *PhotosHandler) ListPhotos(c *gin.Context) {
	userID := c.GetString("user_id")

	rows, err := h.DB.Query(context.Background(),
		`SELECT id, s3_key, position, created_at FROM photos WHERE user_id = $1 ORDER BY position`, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load photos"})
		return
	}
	defer rows.Close()

	type row struct {
		photo models.Photo
		key   string
	}
	var loaded []row
	for rows.Next() {
		var r row
		if err := rows.Scan(&r.photo.ID, &r.key, &r.photo.Position, &r.photo.CreatedAt); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load photos"})
			return
		}
		loaded = append(loaded, r)
	}

	photos := []models.Photo{}
	for _, r := range loaded {
		viewURL, err := h.presignView(c.Request.Context(), r.key)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create view url"})
			return
		}
		r.photo.URL = viewURL
		photos = append(photos, r.photo)
	}

	c.JSON(http.StatusOK, photos)
}

func (h *PhotosHandler) DeletePhoto(c *gin.Context) {
	userID := c.GetString("user_id")
	photoID := c.Param("id")

	var s3Key string
	err := h.DB.QueryRow(context.Background(),
		`SELECT s3_key FROM photos WHERE id = $1 AND user_id = $2`, photoID, userID,
	).Scan(&s3Key)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "photo not found"})
		return
	}

	if _, err := h.DB.Exec(context.Background(),
		`DELETE FROM photos WHERE id = $1 AND user_id = $2`, photoID, userID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete photo"})
		return
	}

	if err := storage.DeleteObject(context.Background(), h.S3Client, h.Bucket, s3Key); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "photo removed but failed to delete file from storage"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "photo deleted"})
}
