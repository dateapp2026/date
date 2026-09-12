package matching

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
)

// PreferencesFromLikes ranks, for each user in userIDs, the other users in
// userIDs that they swiped "liked" on, most recent like first. Users with no
// likes among userIDs get an empty preference list.
func PreferencesFromLikes(ctx context.Context, db *pgxpool.Pool, userIDs []UserID) (map[UserID][]UserID, error) {
	prefs := make(map[UserID][]UserID, len(userIDs))
	for _, id := range userIDs {
		prefs[id] = nil
	}

	rows, err := db.Query(ctx,
		`SELECT swiper_id, swipee_id FROM swipes
		 WHERE liked = true AND swiper_id = ANY($1) AND swipee_id = ANY($1)
		 ORDER BY created_at DESC`, userIDs)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var swiper, swipee UserID
		if err := rows.Scan(&swiper, &swipee); err != nil {
			return nil, err
		}
		prefs[swiper] = append(prefs[swiper], swipee)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	return prefs, nil
}
