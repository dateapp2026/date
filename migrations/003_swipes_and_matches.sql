CREATE TABLE swipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    swiper_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    swipee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    liked BOOLEAN NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (swiper_id, swipee_id)
);

CREATE INDEX idx_swipes_swiper_id ON swipes(swiper_id);
CREATE INDEX idx_swipes_swipee_id ON swipes(swipee_id);

CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_one_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_two_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK (user_one_id < user_two_id),
    UNIQUE (user_one_id, user_two_id)
);

CREATE INDEX idx_matches_user_one_id ON matches(user_one_id);
CREATE INDEX idx_matches_user_two_id ON matches(user_two_id);
