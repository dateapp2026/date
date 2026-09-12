package models

import "time"

type User struct {
	ID                       string    `json:"id"`
	Email                    string    `json:"email"`
	Username                 string    `json:"username"`
	PasswordHash             string    `json:"-"`
	FirstName                string    `json:"first_name"`
	LastName                 string    `json:"last_name"`
	Birthday                 time.Time `json:"birthday"`
	Gender                   string    `json:"gender"`
	ProfilePictureURL        *string   `json:"profile_picture_url"`
	Bio                      *string   `json:"bio"`
	EmailVerified            bool      `json:"email_verified"`
	EmailVerificationToken   *string   `json:"-"`
	EmailVerificationExpires *time.Time `json:"-"`
	CreatedAt                time.Time `json:"created_at"`
	UpdatedAt                time.Time `json:"updated_at"`
}

type RegisterRequest struct {
	Email     string `json:"email" binding:"required,email"`
	Username  string `json:"username" binding:"required,min=3,max=30"`
	Password  string `json:"password" binding:"required,min=8"`
	FirstName string `json:"first_name" binding:"required"`
	LastName  string `json:"last_name" binding:"required"`
	Birthday  string `json:"birthday" binding:"required"`
	Gender    string `json:"gender" binding:"required"`
}

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type AuthResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}

type Photo struct {
	ID        string    `json:"id"`
	UserID    string    `json:"-"`
	URL       string    `json:"url"`
	Position  int       `json:"position"`
	CreatedAt time.Time `json:"created_at"`
}

type UpdateBioRequest struct {
	Bio string `json:"bio" binding:"max=500"`
}

type DiscoverCandidate struct {
	ID        string  `json:"id"`
	FirstName string  `json:"first_name"`
	Age       int     `json:"age"`
	Bio       *string `json:"bio"`
	Photos    []Photo `json:"photos"`
}

type SwipeRequest struct {
	SwipeeID string `json:"swipee_id" binding:"required"`
	Liked    bool   `json:"liked"`
}
