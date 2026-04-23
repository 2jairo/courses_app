CREATE TABLE course_views_daily(
    view_date Date,
    course_id Int64,
    impressions UInt64,
    views UInt64
)
ENGINE = SummingMergeTree
PARTITION BY toYYYYMM(view_date)
ORDER BY (course_id, view_date)
TTL view_date + INTERVAL 365 DAY;

CREATE MATERIALIZED VIEW mv_course_views_daily
TO course_views_daily
AS
SELECT
    toDate(created_at) AS view_date,
    course_id,
    countIf(seen = FALSE) AS impressions,
    countIf(seen = TRUE) AS views
FROM course_views_raw
GROUP BY course_id, view_date;
