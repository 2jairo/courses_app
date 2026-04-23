-- Table to register tags
CREATE TABLE IF NOT EXISTS tags (
	id BIGSERIAL PRIMARY KEY,
	created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	deleted_at TIMESTAMPTZ,
    slug VARCHAR(60) NOT NULL,
	name CITEXT NOT NULL UNIQUE
);

-- Linking table between courses and tags
CREATE TABLE IF NOT EXISTS course_tags (
	course_id BIGINT REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
	tag_id BIGINT REFERENCES tags(id) ON DELETE CASCADE NOT NULL,

    PRIMARY KEY (course_id, tag_id)
);
