-- owner and amin can admin,write,read
-- write can write,read
-- read can read
CREATE TYPE "CoursePermission" AS ENUM (
    'Owner',
    'Admin',
    'Write',
    'Read'
);

CREATE TABLE course_permissions (
    deleted_at TIMESTAMPTZ,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    role "CoursePermission" NOT NULL,

    PRIMARY KEY (user_id, course_id)
);
