DROP TRIGGER IF EXISTS trg_lecture_comments_sync_parent_flags ON lecture_comments;

DROP FUNCTION IF EXISTS trg_sync_parent_comment_flags();

DROP TABLE IF EXISTS lecture_comments;