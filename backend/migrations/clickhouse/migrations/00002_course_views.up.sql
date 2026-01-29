CREATE TABLE course_views_raw(
    created_at DateTime DEFAULT now(),
    course_id Int64,
    user_id Nullable(Int64),
    device Enum('Desktop', 'Mobile', 'Tablet', 'SmartTv', 'Other') DEFAULT 'Other',
    view_source Enum('Search', 'Recommendation', 'Direct', 'External', 'Category') DEFAULT 'Direct',
    seen Boolean, -- impressions: false, clicks: true
    user_sex Nullable(Enum('Male', 'Female', 'Other'))
)
ENGINE = MergeTree
ORDER BY (course_id, created_at)
PARTITION BY toStartOfMonth(created_at);


CREATE TABLE course_views_aggregated(
    course_id Int64,
    view_date Date DEFAULT today(),
    device Enum('Desktop', 'Mobile', 'Tablet', 'SmartTv', 'Other'),
    view_source Enum('Search', 'Recommendation',' Direct', 'External', 'Category'),
    user_sex Nullable(Enum('Male', 'Female', 'Other')),
    impressions UInt64 DEFAULT 0,
    views UInt64 DEFAULT 0
)
ENGINE = SummingMergeTree
PARTITION BY course_id
ORDER BY (course_id, device, view_source);


CREATE TABLE course_views_unique (
    view_date Date,
    course_id Int64,
    unique_users AggregateFunction(uniq, Int64)
)
ENGINE = AggregatingMergeTree
PARTITION BY toYYYYMM(view_date)
ORDER BY (course_id, view_date)
TTL view_date + INTERVAL 90 DAY;

-- MV
CREATE MATERIALIZED VIEW mv_course_views_aggregated
TO course_views_aggregated
AS
SELECT
    course_id,
    device,
    view_source,
    user_sex,
    count() AS impressions,
    sum(toUInt8(seen)) AS views
FROM course_views_raw
GROUP BY course_id, device, view_source, user_sex;


CREATE MATERIALIZED VIEW mv_course_views_unique
TO course_views_unique
AS
SELECT
    toDate(created_at) AS view_date,
    course_id,
    uniqState(assumeNotNull(user_id)) AS unique_users
FROM course_views_raw
WHERE user_id IS NOT NULL AND seen = true
GROUP BY view_date, course_id;
