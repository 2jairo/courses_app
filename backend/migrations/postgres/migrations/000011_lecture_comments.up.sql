CREATE TABLE IF NOT EXISTS lecture_comments (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,

    lecture_id BIGINT NOT NULL REFERENCES lectures(id) ON DELETE CASCADE,
    author_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_comment_id BIGINT REFERENCES lecture_comments(id) ON DELETE CASCADE,
    reply_count INT NOT NULL DEFAULT 0,
    reply_from_staff BOOLEAN NOT NULL DEFAULT FALSE,
    author_is_staff BOOLEAN NOT NULL DEFAULT FALSE,
    body TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_lecture_comments_parent_comment_id
    ON lecture_comments(parent_comment_id);


CREATE OR REPLACE FUNCTION trg_sync_parent_comment_flags()
RETURNS TRIGGER AS $$
DECLARE
    param_parent_id BIGINT;
BEGIN
    param_parent_id := COALESCE(NEW.parent_comment_id, OLD.parent_comment_id);

    IF param_parent_id IS NULL THEN
        RETURN COALESCE(NEW, OLD);
    END IF;

    UPDATE lecture_comments p 
    SET 
        reply_from_staff = EXISTS (
            SELECT 1 FROM lecture_comments c WHERE 
                c.parent_comment_id = param_parent_id AND 
                c.deleted_at IS NULL AND 
                c.author_is_staff = TRUE
        ),
        reply_count = (
            SELECT COUNT(id)
            FROM lecture_comments c
            WHERE c.parent_comment_id = param_parent_id AND c.deleted_at IS NULL
        )
    WHERE p.id = param_parent_id;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql; 


CREATE TRIGGER trg_lecture_comments_sync_parent_flags
AFTER INSERT OR UPDATE OR DELETE ON lecture_comments
FOR EACH ROW
EXECUTE FUNCTION trg_sync_parent_comment_flags();
