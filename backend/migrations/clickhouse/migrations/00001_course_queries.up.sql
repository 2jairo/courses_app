CREATE TABLE course_search_queries_raw(
    created_at DateTime DEFAULT now(),
    query String,
    course_id Int64,
    mode Enum('ai', 'fts'),
    seen Boolean, -- impressions: false, clicks: true
    user_id Nullable(Int64)
)
ENGINE = MergeTree
ORDER BY (course_id, query, created_at)
PARTITION BY toStartOfMonth(created_at);


CREATE TABLE course_search_queries(
    course_id Int64,
    query String,
    search_count UInt64,
    seen Boolean,
    mode Enum('ai', 'fts'),
    last_searched DateTime
)
ENGINE = SummingMergeTree
ORDER BY (course_id, query, search_count, mode, seen)
PARTITION BY course_id;

CREATE VIEW course_search_queries_aggregated AS
SELECT
    query,
    count(search_count) as search_count,
    seen,
    mode,
    max(last_searched) as last_searched
FROM course_search_queries GROUP BY query, seen, mode;

CREATE TABLE course_search_queries_recent (
    course_id Int64,
    query String,
    seen Boolean,
    mode Enum('ai', 'fts'),
    count_state AggregateFunction(count),
    last_searched_state AggregateFunction(max, DateTime),
    last_searched DateTime -- FOR TTL
)
ENGINE = AggregatingMergeTree
PARTITION BY course_id
ORDER BY (course_id, query, seen, mode)
TTL last_searched + INTERVAL 30 DAY;

CREATE VIEW course_search_queries_recent_aggregated AS
SELECT
    course_id,
    query,
    seen,
    mode,
    countMerge(count_state) AS count,
    maxMerge(last_searched_state) AS last_searched
FROM course_search_queries_recent GROUP BY course_id, query, seen, mode;

-- MV

CREATE MATERIALIZED VIEW mv_course_search_queries
TO course_search_queries
AS
SELECT
    course_id,
    query,
    seen,
    mode,
    count() AS search_count,
    max(created_at) AS last_searched
FROM course_search_queries_raw
GROUP BY course_id, query, seen, mode;

CREATE MATERIALIZED VIEW mv_course_search_queries_recent
TO course_search_queries_recent
AS
SELECT
    course_id,
    query,
    seen,
    mode,
    countState() AS count_state,
    maxState(created_at) AS last_searched_state,
    max(created_at) AS last_searched
FROM course_search_queries_raw
WHERE created_at >= now() - INTERVAL 30 DAY
GROUP BY course_id, query, seen, mode;
