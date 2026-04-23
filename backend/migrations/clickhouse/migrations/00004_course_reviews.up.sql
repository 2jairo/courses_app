CREATE TABLE course_reviews_raw(
    created_at DateTime DEFAULT now(),
    course_id Int64,
    review_id Int64,
    user_id Int64,
    is_update Bool,
    rating Int8
)
ENGINE = MergeTree
ORDER BY (course_id, created_at)
PARTITION BY toStartOfMonth(created_at);


CREATE TABLE course_reviews_aggregated(
    course_id Int64,
    avg_rating AggregateFunction(avg, Int8),
    total_reviews AggregateFunction(countIf, Bool)
)
ENGINE = AggregatingMergeTree
ORDER BY course_id;

-- MV

CREATE MATERIALIZED VIEW mv_course_reviews_aggregated
TO course_reviews_aggregated
AS
SELECT
    course_id,
    avgState(rating) AS avg_rating,
    countIfState(is_update = FALSE) AS total_reviews
FROM course_reviews_raw
GROUP BY course_id;