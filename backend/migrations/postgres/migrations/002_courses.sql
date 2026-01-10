CREATE TYPE "CourseVisibility" as ENUM (
    'Private', 
    'Link', 
    'Public'
);

CREATE TABLE IF NOT EXISTS courses (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    visibility "CourseVisibility" NOT NULL DEFAULT 'Private',

    slug TEXT NOT NULL,
    title VARCHAR(100) NOT NULL,
    description VARCHAR(1000) NOT NULL DEFAULT '',
    poster VARCHAR(50),
    lectures_amount INT NOT NULL DEFAULT 0
);

CREATE UNIQUE INDEX idx_courses_slug_unique 
ON courses(lower(slug));

CREATE TABLE IF NOT EXISTS course_sections (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,

    slug TEXT NOT NULL,
    course_id BIGINT REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
    position INT NOT NULL,
    title TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_course_sections_course_id 
ON course_sections(course_id);

CREATE UNIQUE INDEX idx_course_sections_slug_unique 
ON course_sections(lower(slug));