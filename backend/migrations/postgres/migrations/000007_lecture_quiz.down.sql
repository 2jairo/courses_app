DROP TRIGGER IF EXISTS quiz_questions_amount_trigger ON quiz_questions;

DROP FUNCTION IF EXISTS update_quiz_questions_amount();

DROP TABLE IF EXISTS quiz_attempt_answers;

DROP TABLE IF EXISTS quiz_attempts;

DROP TABLE IF EXISTS quiz_questions;

DROP TABLE IF EXISTS lecture_quizzes;

DROP TYPE IF EXISTS "QuizQuestionKind";

DROP TYPE IF EXISTS "QuizQuestionStatus";
