CREATE TABLE course_views_raw(
    created_at DateTime DEFAULT now(),
    course_id Int64,
    user_id Nullable(Int64),
    device Enum('Desktop', 'Mobile', 'Tablet', 'SmartTv', 'Other') DEFAULT 'Other',
    view_source Enum('Search', 'Recommendation', 'Direct', 'External', 'Category') DEFAULT 'Direct',
    seen Boolean, -- impressions: false, clicks: true
    user_sex Nullable(Enum('Male', 'Female', 'Other')),
    birth_date Nullable(Date)
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
    age_range Nullable(Enum('0-17', '18-24', '25-34', '35-44', '45-54', '55-64', '65+')),
    impressions UInt64 DEFAULT 0,
    views UInt64 DEFAULT 0
)
ENGINE = SummingMergeTree
PARTITION BY course_id
ORDER BY (course_id, device, view_source);
-- SELECT * FROM course_views_aggregated


CREATE TABLE course_views_unique (
    view_date Date,
    course_id Int64,
    unique_users AggregateFunction(uniq, Int64)
)
ENGINE = AggregatingMergeTree
PARTITION BY toYYYYMM(view_date)
ORDER BY (course_id, view_date)
TTL view_date + INTERVAL 90 DAY;
-- select view_date, course_id, uniqMerge(unique_users) as unique_users from course_views_unique group by view_date, course_id

------ MV
CREATE MATERIALIZED VIEW mv_course_views_aggregated
TO course_views_aggregated
AS
SELECT
    course_id,
    today() as view_date,
    device,
    view_source,
    user_sex,
    multiIf(
        birth_date IS NULL, NULL,
        dateDiff('year', birth_date, today()) < 18, '0-17',
        dateDiff('year', birth_date, today()) < 25, '18-24',
        dateDiff('year', birth_date, today()) < 35, '25-34',
        dateDiff('year', birth_date, today()) < 45, '35-44',
        dateDiff('year', birth_date, today()) < 55, '45-54',
        dateDiff('year', birth_date, today()) < 65, '55-64',
        '65+'
    ) AS age_range,
    count() AS impressions,
    sum(toUInt8(seen)) AS views
FROM course_views_raw
GROUP BY course_id, device, view_source, user_sex, age_range;

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
