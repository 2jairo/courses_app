CREATE TABLE IF NOT EXISTS lecture_quizzes (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,

    title VARCHAR(100) NOT NULL,
    course_id BIGINT REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
    time_limit_secs INT, -- NULL means no time limit
    passing_score_percentage INT NOT NULL DEFAULT 70,
    shuffle_questions BOOLEAN NOT NULL DEFAULT false,
    show_correct_answers BOOLEAN NOT NULL DEFAULT false,
    questions_amount INT NOT NULL DEFAULT 0,
    public_questions_amount INT NOT NULL DEFAULT 0,

    CONSTRAINT quiz_passing_score_range CHECK (passing_score_percentage >= 0 AND passing_score_percentage <= 100),
    CONSTRAINT quiz_time_limit_positive CHECK (time_limit_secs IS NULL OR time_limit_secs > 0)
);

CREATE TYPE "QuizQuestionKind" AS ENUM (
    'BoolMultiple', -- checkbox (multiple good answers)
    'BoolSingle', -- radius (single good answer)
    'TextMultiple', -- guess multiple keywords
    'TextSingle', -- guess single keyword
    'Match' -- match keys:values
);

CREATE TYPE "QuizQuestionStatus" AS ENUM (
    'Public',
    'Private'
);

CREATE TABLE IF NOT EXISTS quiz_questions (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,

    quiz_id BIGINT REFERENCES lecture_quizzes(id) ON DELETE CASCADE NOT NULL,
    position INT NOT NULL,
    kind "QuizQuestionKind" NOT NULL,
    status "QuizQuestionStatus" NOT NULL,
    question_text TEXT NOT NULL,
    options JSONB NOT NULL,
    explanation TEXT, -- explanation shown after answering
    points INT NOT NULL DEFAULT 1,

    CONSTRAINT quiz_question_points_positive CHECK (points > 0)
);


CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id
ON quiz_questions(quiz_id);

-- Table to track user quiz attempts
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    lecture_id BIGINT REFERENCES lectures(id) ON DELETE CASCADE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id
ON quiz_attempts(user_id);

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_lecture_id
ON quiz_attempts(lecture_id);

-- Table to store individual answers within an attempt
CREATE TABLE IF NOT EXISTS quiz_attempt_answers (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    
    attempt_id BIGINT REFERENCES quiz_attempts(id) ON DELETE CASCADE NOT NULL,
    question_id BIGINT REFERENCES quiz_questions(id) ON DELETE CASCADE NOT NULL,
    answer JSONB NOT NULL, -- flexible storage for various answer types
    is_correct BOOLEAN NOT NULL,
    points_earned DOUBLE PRECISION NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_quiz_answers_attempt_id
ON quiz_attempt_answers(attempt_id);

CREATE INDEX IF NOT EXISTS idx_quiz_answers_question_id
ON quiz_attempt_answers(question_id);




CREATE OR REPLACE FUNCTION update_quiz_questions_amount()
RETURNS TRIGGER AS $$
DECLARE
    param_quiz_id BIGINT;
BEGIN
    param_quiz_id := COALESCE(NEW.quiz_id, OLD.quiz_id);

    WITH relevant_questions AS (
        SELECT *
        FROM quiz_questions qq
        WHERE qq.quiz_id = param_quiz_id
        AND qq.deleted_at IS NULL
    )
    UPDATE lecture_quizzes SET
        questions_amount = (SELECT COUNT(*) FROM relevant_questions),
        public_questions_amount = (SELECT COUNT(*) FROM relevant_questions WHERE status = 'Public')
        -- updated_at = now()
    WHERE id = param_quiz_id;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER quiz_questions_amount_trigger
AFTER INSERT OR UPDATE OR DELETE ON quiz_questions
FOR EACH ROW
EXECUTE FUNCTION update_quiz_questions_amount();