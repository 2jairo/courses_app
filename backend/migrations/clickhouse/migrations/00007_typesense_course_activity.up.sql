CREATE TABLE rabbitmq_course_stats
(
    course_id       Int64,
    avg_rating      Float64,
    total_reviews   UInt64,
    total_purchases UInt64,
    total_views     UInt64,
    total_impressions UInt64,
    updated_at      DateTime
)
ENGINE = RabbitMQ
SETTINGS
    rabbitmq_host_port = 'rabbitmq:5672',
    rabbitmq_exchange_name = 'course_stats',
    rabbitmq_routing_key_list = 'course.stats.updated',
    rabbitmq_format = 'JSONEachRow',
    rabbitmq_exchange_type = 'direct',
    rabbitmq_username = 'guest',
    rabbitmq_password = 'guest';


CREATE TABLE course_activity_recent (
    created_at DateTime DEFAULT now(),
    course_id  Int64,
    source     Enum('view', 'purchase', 'review')
)
ENGINE = MergeTree
ORDER BY (course_id, created_at)
TTL created_at + INTERVAL 5 MINUTE; 

CREATE MATERIALIZED VIEW mv_course_activity_views
TO course_activity_recent
AS
SELECT
    created_at,
    course_id,
    'view' AS source
FROM course_views_raw;


CREATE MATERIALIZED VIEW mv_course_activity_purchases
TO course_activity_recent
AS
SELECT
    created_at,
    course_id,
    'purchase' AS source
FROM course_purchases_raw;

CREATE MATERIALIZED VIEW mv_course_activity_reviews
TO course_activity_recent
AS
SELECT
    created_at,
    course_id,
    'review' AS source
FROM course_reviews_raw;

CREATE MATERIALIZED VIEW mv_rabbitmq_course_stats
REFRESH EVERY 1 MINUTE TO rabbitmq_course_stats AS
SELECT 
    course_id,
    avg_rating,
    total_reviews,
    total_purchases,
    total_views,
    total_impressions,
    now() as updated_at
FROM course_stats WHERE course_id IN (
    SELECT DISTINCT course_id
    FROM course_activity_recent
    WHERE created_at >= now() - INTERVAL 1 MINUTE
);