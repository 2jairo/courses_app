DROP TABLE IF EXISTS lecture_documents;

DROP TABLE IF EXISTS lecture_videos;

DROP TABLE IF EXISTS lecture_assets;

DROP TRIGGER IF EXISTS course_lectures_ammount_trigger ON lectures;

DROP FUNCTION IF EXISTS update_course_lectures_ammount();

DROP TABLE IF EXISTS lectures;

DROP TYPE IF EXISTS "LectureVisibility";

DROP TYPE IF EXISTS "LectureKind";
