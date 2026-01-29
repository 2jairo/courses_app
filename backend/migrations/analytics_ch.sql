CREATE TABLE vi_events_clicks(
    created_at DateTime DEFAULT now(),
    video_id Int64,
    user_id Int64,
    event Enum('Like', 'Dislike', 'FinalScreen', 'Subscribed'),
    value Int8,

    CONSTRAINT c1 CHECK value = 1 OR value = -1
)
ENGINE = MergeTree
ORDER BY (video_id, created_at)
PARTITION BY toStartOfMonth(created_at);


CREATE TABLE vi_events_views(
    created_at DateTime DEFAULT now(),
    video_id Int64,
    user_id Int64,
    device Enum('Desktop', 'Mobile', 'Tablet', 'SmartTv', 'Other'),
    view_font Enum('Search', 'Recommendation', 'Channel', 'External'),
    seen BOOLEAN,
    sex Enum('Male', 'Female', 'Other')
)
ENGINE = MergeTree
ORDER BY (video_id, created_at)
PARTITION BY toStartOfMonth(created_at);

CREATE TABLE vi_events_queries(
    video_id Int64,
    query String,
    cnt UInt32
)
ENGINE = SummingMergeTree
ORDER BY (video_id, query);

CREATE TABLE vi_events_heatmap(
    created_at DateTime64 DEFAULT now64(),
    video_id Int64,
    user_id Int64,
    heatmap Array(Float32),
)
ENGINE = MergeTree
ORDER BY (video_id, user_id, created_at);


-- Keep the last second of video_id of a user_id 
CREATE MATERIALIZED VIEW vi_events_heatmap_seen
    ENGINE = ReplacingMergeTree(_version)
    ORDER BY (video_id, user_id)
    TTL created_at + INTERVAL 2 YEAR DELETE
    POPULATE
AS SELECT
    created_at,
    video_id,
    user_id,
    length(heatmap) as sec,
    toUnixTimestamp64Milli(created_at) AS _version
FROM vi_events_heatmap


-- avg element wise heatmap
CREATE TABLE vi_events_heatmap_total(
    video_id     Int64,
    heatmap_sum  AggregateFunction(sumForEach, Array(Float32)),
    samples  AggregateFunction(sum, UInt32)
)
ENGINE = AggregatingMergeTree
ORDER BY (video_id);

CREATE MATERIALIZED VIEW mv_vi_events_heatmap_total
TO vi_events_heatmap_total AS
SELECT
    video_id,
    sumForEachState(heatmap) AS heatmap_sum,
    sumState(toUInt32(1)) AS samples
FROM vi_events_heatmap
GROUP BY video_id;
-- SELECT 
--     sumMerge(samples) as samples,
--     arrayMap(x -> x / samples, sumForEachMerge(heatmap_sum))
-- FROM vi_events_heatmap_total 
-- WHERE video_id = 10

-- hourly
CREATE MATERIALIZED VIEW vi_events_clicks_hour
    ENGINE = MergeTree
    ORDER BY (video_id, bucket)
    TTL bucket + INTERVAL 1 DAY DELETE
    POPULATE
AS SELECT
    video_id,
    toStartOfHour(created_at) as bucket,
    sumIf(value, event = 'Like') as likes,
    sumIf(value, event = 'Dislike') as dislikes,
    sumIf(value, event = 'Subscribed') as subs,
    sumIf(value, event = 'FinalScreen') as final_screen
FROM vi_events_clicks
GROUP BY video_id, bucket


CREATE TABLE vi_events_hour (
    video_id Int64,
    bucket DateTime,

    likes AggregateFunction(sum, Int32),
    dislikes AggregateFunction(sum, Int32),
    subs AggregateFunction(sum, Int32),
    final_screen AggregateFunction(sum, Int32),

    font_views_search AggregateFunction(count, Int32),
    font_views_recom AggregateFunction(count, Int32),
    font_views_channel AggregateFunction(count, Int32),
    font_views_ext AggregateFunction(count, Int32),
    views AggregateFunction(count, Int32),
)
ENGINE = AggregatingMergeTree
ORDER BY (video_id, bucket)
TTL bucket + INTERVAL 1 DAY DELETE;

CREATE MATERIALIZED VIEW mv_clicks_vi_events_hour
TO vi_events_hour AS
SELECT
    video_id,
    toStartOfHour(created_at) as bucket,
    sumIfState(toInt32(value), event = 'Like') as likes,
    sumIfState(toInt32(value), event = 'Dislike') as dislikes,
    sumIfState(toInt32(value), event = 'Subscribed') as subs,
    sumIfState(toInt32(value), event = 'FinalScreen') as final_screen,

    countState(0) as font_views_search,
    countState(0) as font_views_recom,
    countState(0) as font_views_channel,
    countState(0) as font_views_ext,
    countState(0) as views
FROM vi_events_clicks
GROUP BY video_id, bucket

CREATE MATERIALIZED VIEW mv_views_vi_events_hour
TO vi_events_hour AS
SELECT
    video_id,
    toStartOfHour(created_at) as bucket,

    countIfState(seen = true AND view_font = 'Search') font_views_search,
    countIfState(seen = true AND view_font = 'Recommendation') font_views_recom,
    countIfState(seen = true AND view_font = 'Channel') font_views_channel,
    countIfState(seen = true AND view_font = 'External') font_views_ext,
    countIfState(seen = true) views
FROM vi_events_views
GROUP BY video_id, bucket



-- CREATE TABLE vi_events_views(
--     created_at DateTime DEFAULT now(),
--     video_id Int64,
--     user_id Int64,
--     device Enum('Desktop', 'Mobile', 'Tablet', 'SmartTv', 'Other'),
--     view_font Enum('Search', 'Recommendation', 'Channel', 'External'),
--     seen BOOLEAN,
--     sex Enum('Male', 'Female', 'Other')
-- )
-- ENGINE = MergeTree
-- ORDER BY (video_id, created_at)
-- PARTITION BY toStartOfMonth(created_at);



