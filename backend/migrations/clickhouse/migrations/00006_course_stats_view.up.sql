CREATE VIEW course_stats AS
SELECT
    v.course_id as course_id,
    r.avg_rating,
    r.total_reviews,
    p.total_purchases,
    v.total_views,
    v.total_impressions,
    ifNull(u.total_unique_viewers, 0) AS total_unique_viewers
FROM
(
    SELECT
        course_id,
        sum(views) AS total_views,
        sum(impressions) AS total_impressions
    FROM course_views_aggregated GROUP BY course_id
) v
LEFT JOIN
(
    SELECT
        course_id,
        sum(total) AS total_purchases
    FROM course_purchases_aggregated GROUP BY course_id
) p
ON v.course_id = p.course_id
LEFT JOIN
(
    SELECT
        course_id,
        avgMerge(avg_rating) AS avg_rating,
        countMerge(total_reviews) AS total_reviews
    FROM course_reviews_aggregated GROUP BY course_id
) r
ON v.course_id = r.course_id
LEFT JOIN
(
    SELECT
        course_id,
        uniqMerge(unique_users) AS total_unique_viewers
    FROM course_views_unique_total GROUP BY course_id
) u
ON v.course_id = u.course_id;