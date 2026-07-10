package handlers

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"log"
	"net/http"
	"regexp"
	"time"

	"github.com/aprator/date/internal/email"
	"github.com/aprator/date/internal/models"
	"github.com/aws/aws-sdk-go-v2/service/sesv2"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"golang.org/x/crypto/bcrypt"
)

type AuthHandler struct {
	DB            *pgxpool.Pool
	JWTSecret     string
	SESClient     *sesv2.Client
	SESFrom       string
	PublicBaseURL string
}

func NewAuthHandler(db *pgxpool.Pool, jwtSecret string, sesClient *sesv2.Client, sesFrom, publicBaseURL string) *AuthHandler {
	return &AuthHandler{
		DB:            db,
		JWTSecret:     jwtSecret,
		SESClient:     sesClient,
		SESFrom:       sesFrom,
		PublicBaseURL: publicBaseURL,
	}
}

var usernameRegex = regexp.MustCompile(`^[a-zA-Z0-9_]+$`)

func (h *AuthHandler) Register(c *gin.Context) {
	var req models.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if !usernameRegex.MatchString(req.Username) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "username can only contain letters, numbers, and underscores"})
		return
	}

	birthday, err := time.Parse("2006-01-02", req.Birthday)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "birthday must be in YYYY-MM-DD format"})
		return
	}

	age := time.Now().Year() - birthday.Year()
	if time.Now().YearDay() < birthday.YearDay() {
		age--
	}
	if age < 18 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "must be at least 18 years old"})
		return
	}

	if len(req.Password) < 8 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "password must be at least 8 characters"})
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to hash password"})
		return
	}

	verificationToken, err := generateToken()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate verification token"})
		return
	}

	verificationExpires := time.Now().Add(24 * time.Hour)

	var user models.User
	err = h.DB.QueryRow(context.Background(),
		`INSERT INTO users (email, username, password_hash, first_name, last_name, birthday, gender, email_verification_token, email_verification_expires_at)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		 RETURNING id, email, username, first_name, last_name, birthday, gender, email_verified, created_at, updated_at`,
		req.Email, req.Username, string(hashedPassword), req.FirstName, req.LastName, birthday, req.Gender, verificationToken, verificationExpires,
	).Scan(&user.ID, &user.Email, &user.Username, &user.FirstName, &user.LastName, &user.Birthday, &user.Gender, &user.EmailVerified, &user.CreatedAt, &user.UpdatedAt)

	if err != nil {
		if isDuplicateError(err) {
			c.JSON(http.StatusConflict, gin.H{"error": "email or username already taken"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create user"})
		return
	}

	sesConfigured := h.SESClient != nil && h.SESFrom != ""
	if sesConfigured {
		if err := email.SendVerificationEmail(context.Background(), h.SESClient, h.SESFrom, user.Email, verificationToken, h.PublicBaseURL); err != nil {
			log.Printf("failed to send verification email to %s: %v", user.Email, err)
		}
	} else {
		log.Printf("SES not configured — skipping verification email, token: %s", verificationToken)
	}

	response := gin.H{
		"message": "account created — check your email to verify",
		"user":    user,
	}
	if !sesConfigured {
		// Dev convenience only: with no SES configured there's no other way to get the token.
		response["verification_token"] = verificationToken
	}
	c.JSON(http.StatusCreated, response)
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	err := h.DB.QueryRow(context.Background(),
		`SELECT id, email, username, password_hash, first_name, last_name, birthday, gender, profile_picture_url, email_verified, created_at, updated_at
		 FROM users WHERE username = $1`, req.Username,
	).Scan(&user.ID, &user.Email, &user.Username, &user.PasswordHash, &user.FirstName, &user.LastName, &user.Birthday, &user.Gender, &user.ProfilePictureURL, &user.EmailVerified, &user.CreatedAt, &user.UpdatedAt)

	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid email or password"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid email or password"})
		return
	}

	token, err := h.generateJWT(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, models.AuthResponse{Token: token, User: user})
}

func (h *AuthHandler) VerifyEmail(c *gin.Context) {
	token := c.Query("token")
	if token == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "token is required"})
		return
	}

	result, err := h.DB.Exec(context.Background(),
		`UPDATE users SET email_verified = TRUE, email_verification_token = NULL, email_verification_expires_at = NULL, updated_at = NOW()
		 WHERE email_verification_token = $1 AND email_verification_expires_at > NOW()`, token)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to verify email"})
		return
	}

	if result.RowsAffected() == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid or expired token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "email verified"})
}

func (h *AuthHandler) ResendVerification(c *gin.Context) {
	var req struct {
		Email string `json:"email" binding:"required,email"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	token, err := generateToken()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate token"})
		return
	}

	expires := time.Now().Add(24 * time.Hour)

	result, err := h.DB.Exec(context.Background(),
		`UPDATE users SET email_verification_token = $1, email_verification_expires_at = $2, updated_at = NOW()
		 WHERE email = $3 AND email_verified = FALSE`, token, expires, req.Email)

	if err != nil || result.RowsAffected() == 0 {
		c.JSON(http.StatusOK, gin.H{"message": "if that email exists and is unverified, a new verification email has been sent"})
		return
	}

	// TODO: send verification email with token
	c.JSON(http.StatusOK, gin.H{
		"message":            "verification email sent",
		"verification_token": token,
	})
}

func (h *AuthHandler) GetMe(c *gin.Context) {
	userID := c.GetString("user_id")

	var user models.User
	err := h.DB.QueryRow(context.Background(),
		`SELECT id, email, username, first_name, last_name, birthday, gender, profile_picture_url, email_verified, created_at, updated_at
		 FROM users WHERE id = $1`, userID,
	).Scan(&user.ID, &user.Email, &user.Username, &user.FirstName, &user.LastName, &user.Birthday, &user.Gender, &user.ProfilePictureURL, &user.EmailVerified, &user.CreatedAt, &user.UpdatedAt)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}

	c.JSON(http.StatusOK, user)
}

func (h *AuthHandler) generateJWT(userID string) (string, error) {
	claims := jwt.MapClaims{
		"user_id": userID,
		"exp":     time.Now().Add(7 * 24 * time.Hour).Unix(),
		"iat":     time.Now().Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(h.JWTSecret))
}

func generateToken() (string, error) {
	bytes := make([]byte, 32)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}

func isDuplicateError(err error) bool {
	return err != nil && (len(err.Error()) > 0 && contains(err.Error(), "duplicate key"))
}

func contains(s, substr string) bool {
	return len(s) >= len(substr) && searchString(s, substr)
}

func searchString(s, substr string) bool {
	for i := 0; i <= len(s)-len(substr); i++ {
		if s[i:i+len(substr)] == substr {
			return true
		}
	}
	return false
}
