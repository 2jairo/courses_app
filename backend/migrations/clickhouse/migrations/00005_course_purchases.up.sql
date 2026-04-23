CREATE TABLE course_purchases_raw(
    created_at DateTime DEFAULT now(),
    course_id Int64,
    user_id Int64
)
ENGINE = MergeTree
ORDER BY (course_id, created_at)
PARTITION BY toStartOfMonth(created_at);


CREATE TABLE course_purchases_aggregated(
    course_id Int64,
    total UInt64
)
ENGINE = SummingMergeTree
ORDER BY course_id;

-- MV

CREATE MATERIALIZED VIEW mv_course_purchases_aggregated
TO course_purchases_aggregated
AS
SELECT
    course_id,
    count() AS total
FROM course_purchases_raw
GROUP BY course_id;