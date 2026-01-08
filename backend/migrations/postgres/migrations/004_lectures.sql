CREATE TYPE "LectureKind" AS ENUM (
    'Video',
    'Document',
    'Quiz',
    'Lab'
);

CREATE TYPE "LectureVisibility" AS ENUM (
    'Private', 
    'Link', 
    'Public'
);

CREATE TABLE IF NOT EXISTS lectures (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    visibility "LectureVisibility" NOT NULL DEFAULT 'Private',

    course_section_id BIGINT REFERENCES course_sections(id) ON DELETE CASCADE NOT NULL,
    position INT NOT NULL,
    kind "LectureKind" NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    data BIGINT NOT NULL -- references lecture_{videos,documents,quizzes,labs}
);

CREATE INDEX IF NOT EXISTS idx_lectures_course_section
ON lectures(course_section_id);

CREATE OR REPLACE FUNCTION update_course_lectures_ammount()
RETURNS TRIGGER AS $$
DECLARE
    param_course_id BIGINT;
BEGIN
    SELECT course_id
    INTO param_course_id
    FROM course_sections
    WHERE id = NEW.course_section_id;

    UPDATE courses SET
        lectures_amount = (
            SELECT COUNT(*)
            FROM lectures l
            JOIN course_sections cs ON cs.id = l.course_section
            WHERE cs.course_id = courses.id
            AND l.deleted_at IS NULL
        ),
        updated_at = now()
    WHERE id = param_course_id;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER course_lectures_ammount_trigger
AFTER INSERT OR UPDATE ON lectures
FOR EACH ROW
EXECUTE FUNCTION update_course_lectures_ammount();


CREATE TABLE IF NOT EXISTS lecture_assets (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    
    lecture_id BIGINT REFERENCES lectures(id) ON DELETE CASCADE NOT NULL,
    file_id BIGINT REFERENCES files(id) ON DELETE CASCADE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_assets_lecture_id
ON lecture_assets(lecture_id);

CREATE INDEX IF NOT EXISTS idx_assets_file_id
ON lecture_assets(file_id);


CREATE TABLE IF NOT EXISTS lecture_videos (
    lecture_id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,

    video_id BIGINT REFERENCES files(id) ON DELETE CASCADE NOT NULL
);

-- TODO: lecture_{documents,quizzes,labs}