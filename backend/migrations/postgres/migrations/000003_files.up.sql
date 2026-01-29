CREATE TYPE "FileKind" AS ENUM (
    'Image',
    'Video',
    'Other'
);

CREATE TYPE "FileStatus" AS ENUM (
    'Pending',
    'Processing',
    'Ready',
    'Failed'
);

CREATE TABLE IF NOT EXISTS files (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,

    user_id BIGINT NOT NULL REFERENCES users(id),
    course_id BIGINT NOT NULL REFERENCES courses(id),
    kind "FileKind" NOT NULL,
    status "FileStatus" NOT NULL DEFAULT 'Pending',
    
    original_name VARCHAR(255) NOT NULL,
    raw_file_name VARCHAR(50) NOT NULL,
    file_size BIGINT NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'
);

CREATE INDEX idx_media_user_id
ON files(user_id);

CREATE INDEX idx_media_course_id
ON files(course_id);