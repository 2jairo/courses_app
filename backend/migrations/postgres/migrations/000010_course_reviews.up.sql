CREATE TABLE IF NOT EXISTS course_reviews (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,

    course_id BIGINT REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT
);

CREATE INDEX IF NOT EXISTS idx_course_reviews_course_id
ON course_reviews(course_id);

CREATE INDEX IF NOT EXISTS idx_course_reviews_user_id
ON course_reviews(user_id);