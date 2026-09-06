package handlers

import (
	"context"
	"net/http"
	"time"

	"github.com/aprator/date/internal/models"
	"github.com/aprator/date/internal/storage"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

const discoverViewPresignExpiry = 1 * time.Hour
const discoverCandidateLimit = 20

type DiscoverHandler struct {
	DB        *pgxpool.Pool
	Presigner *s3.PresignClient
	Bucket    string
	Region    string
}

func NewDiscoverHandler(db *pgxpool.Pool, presigner *s3.PresignClient, bucket, region string) *DiscoverHandler {
	return &DiscoverHandler{DB: db, Presigner: presigner, Bucket: bucket, Region: region}
}

// ListCandidates returns profiles the current user hasn't swiped on yet.
func (h *DiscoverHandler) ListCandidates(c *gin.Context) {
	userID := c.GetString("user_id")
	ctx := c.Request.Context()

	rows, err := h.DB.Query(ctx,
		`SELECT id, first_name, birthday, bio FROM users
		 WHERE id != $1
		   AND id NOT IN (SELECT swipee_id FROM swipes WHERE swiper_id = $1)
		 ORDER BY random()
		 LIMIT $2`, userID, discoverCandidateLimit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load candidates"})
		return
	}
	defer rows.Close()

	candidates := []models.DiscoverCandidate{}
	ids := []string{}
	for rows.Next() {
		var candidate models.DiscoverCandidate
		var birthday time.Time
		if err := rows.Scan(&candidate.ID, &candidate.FirstName, &birthday, &candidate.Bio); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load candidates"})
			return
		}
		candidate.Age = ageFromBirthday(birthday)
		candidate.Photos = []models.Photo{}
		candidates = append(candidates, candidate)
		ids = append(ids, candidate.ID)
	}

	photosByUser, err := h.loadPhotosByUser(ctx, ids)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load candidate photos"})
		return
	}
	for i := range candidates {
		if photos, ok := photosByUser[candidates[i].ID]; ok {
			candidates[i].Photos = photos
		}
	}

	c.JSON(http.StatusOK, candidates)
}

func (h *DiscoverHandler) loadPhotosByUser(ctx context.Context, userIDs []string) (map[string][]models.Photo, error) {
	result := map[string][]models.Photo{}
	if len(userIDs) == 0 {
		return result, nil
	}

	rows, err := h.DB.Query(ctx,
		`SELECT user_id, id, s3_key, position, created_at FROM photos
		 WHERE user_id = ANY($1) ORDER BY position`, userIDs)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	type row struct {
		userID string
		photo  models.Photo
		key    string
	}
	var loaded []row
	for rows.Next() {
		var r row
		if err := rows.Scan(&r.userID, &r.photo.ID, &r.key, &r.photo.Position, &r.photo.CreatedAt); err != nil {
			return nil, err
		}
		loaded = append(loaded, r)
	}

	for _, r := range loaded {
		viewURL, err := storage.PresignGetObject(ctx, h.Presigner, h.Bucket, r.key, discoverViewPresignExpiry)
		if err != nil {
			return nil, err
		}
		r.photo.URL = viewURL
		result[r.userID] = append(result[r.userID], r.photo)
	}

	return result, nil
}

// CreateSwipe records a like/pass and creates a match if the swipee already liked the swiper back.
func (h *DiscoverHandler) CreateSwipe(c *gin.Context) {
	var req models.SwipeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	swiperID := c.GetString("user_id")
	if swiperID == req.SwipeeID {
		c.JSON(http.StatusBadRequest, gin.H{"error": "cannot swipe on yourself"})
		return
	}

	ctx := c.Request.Context()

	if _, err := h.DB.Exec(ctx,
		`INSERT INTO swipes (swiper_id, swipee_id, liked) VALUES ($1, $2, $3)
		 ON CONFLICT (swiper_id, swipee_id) DO UPDATE SET liked = EXCLUDED.liked`,
		swiperID, req.SwipeeID, req.Liked); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to record swipe"})
		return
	}

	if !req.Liked {
		c.JSON(http.StatusOK, gin.H{"matched": false})
		return
	}

	var reciprocalLiked bool
	err := h.DB.QueryRow(ctx,
		`SELECT liked FROM swipes WHERE swiper_id = $1 AND swipee_id = $2`,
		req.SwipeeID, swiperID,
	).Scan(&reciprocalLiked)

	if err != nil || !reciprocalLiked {
		c.JSON(http.StatusOK, gin.H{"matched": false})
		return
	}

	userOne, userTwo := swiperID, req.SwipeeID
	if userOne > userTwo {
		userOne, userTwo = userTwo, userOne
	}

	var matchID string
	err = h.DB.QueryRow(ctx,
		`INSERT INTO matches (user_one_id, user_two_id) VALUES ($1, $2)
		 ON CONFLICT (user_one_id, user_two_id) DO UPDATE SET user_one_id = EXCLUDED.user_one_id
		 RETURNING id`,
		userOne, userTwo,
	).Scan(&matchID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create match"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"matched": true, "match_id": matchID})
}
