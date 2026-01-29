CREATE TABLE lecture_views_raw(
    created_at DateTime DEFAULT now(),
    lecture_id Int64,
    user_id Nullable(Int64),
    device Enum('Desktop', 'Mobile', 'Tablet', 'SmartTv', 'Other') DEFAULT 'Other',
    user_sex Nullable(Enum('Male', 'Female', 'Other')),
    view_seconds UInt32 DEFAULT 0 -- time spent viewing
)
ENGINE = MergeTree
ORDER BY (lecture_id, created_at)
PARTITION BY toStartOfMonth(created_at);


CREATE TABLE lecture_views_aggregated(
    lecture_id Int64,
    view_date Date DEFAULT today(),
    device Enum('Desktop', 'Mobile', 'Tablet', 'SmartTv', 'Other'),
    user_sex Nullable(Enum('Male', 'Female', 'Other')),
    views UInt64,
    view_seconds UInt64
)
ENGINE = SummingMergeTree
PARTITION BY view_date
ORDER BY (lecture_id, device);


-- MV

CREATE MATERIALIZED VIEW mv_lecture_views_aggregated
TO lecture_views_aggregated
AS
SELECT
    lecture_id,
    toDate(created_at) AS view_date,
    device,
    user_sex,

    count() AS views,
    sum(view_seconds) AS view_seconds
FROM lecture_views_raw
GROUP BY lecture_id, view_date, device, user_sex;
