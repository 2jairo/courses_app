CREATE TABLE course_search_queries_raw(
    created_at DateTime DEFAULT now(),
    query String,
    course_id Int64,
    user_id Nullable(Int64)
)
ENGINE = MergeTree
ORDER BY (course_id, query, created_at)
PARTITION BY toStartOfMonth(created_at);


CREATE TABLE course_search_queries(
    course_id Int64,
    query String,
    search_count UInt64,
    last_searched DateTime
)
ENGINE = SummingMergeTree
ORDER BY (course_id, query)
PARTITION BY course_id;

CREATE TABLE course_search_queries_recent (
    course_id Int64,
    query String,
    search_count AggregateFunction(count),
    last_searched_state AggregateFunction(max, DateTime),
    last_searched DateTime
)
ENGINE = AggregatingMergeTree
PARTITION BY course_id
ORDER BY (course_id, query)
TTL last_searched + INTERVAL 30 DAY;

-- MV

CREATE MATERIALIZED VIEW mv_course_search_queries
TO course_search_queries
AS
SELECT
    course_id,
    query,
    count() AS search_count,
    max(created_at) AS last_searched
FROM course_search_queries_raw
GROUP BY course_id, query;

CREATE MATERIALIZED VIEW mv_course_search_queries_recent
TO course_search_queries_recent
AS
SELECT
    course_id,
    query,
    countState() AS search_count,
    maxState(created_at) AS last_searched
FROM course_search_queries_raw
WHERE created_at >= now() - INTERVAL 30 DAY
GROUP BY course_id, query;
