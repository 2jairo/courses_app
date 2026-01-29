CREATE TABLE course_progress (
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,

    user_id BIGINT REFERENCES course_sections(id) ON DELETE CASCADE NOT NULL,
    course_id BIGINT REFERENCES course_sections(id) ON DELETE CASCADE NOT NULL,
    lecture_id BIGINT REFERENCES course_sections(id) ON DELETE CASCADE NOT NULL,

    PRIMARY KEY (user_id, course_id)
);