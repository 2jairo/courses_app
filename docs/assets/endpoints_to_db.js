/**
 * Database and service operations performed by each endpoint in A_core_service and B_identity_service.
 *
 * Databases / Services:
 *   pg              – PostgreSQL (TimescaleDB)
 *   clickhouse      – ClickHouse (analytics)
 *   redis           – Redis (session / token cache)
 *   typesense       – Typesense (full-text / vector search engine)
 *   stripe          – Stripe API (payments, external)
 *   rabbitmq        – RabbitMQ (async message broker → C_media_service)
 *   gateway_ia      – gateway_IA_search (LLM proxy – Groq/Cerebras/OpenRouter/Gemini/Mistral/Cohere)
 *
 * Operation keys:
 *   'r'       – read / consume
 *   'w'       – write / publish (insert / update / delete)
 *   'rw'      – read + write
 *   'pub'     – publish message (fire-and-forget)
 *   'pub+sub' – publish message and wait for reply (RPC pattern)
 *   'sub'     – consume / subscribe to messages
 */

const OPERATION_SYSTEM_LABELS = {
  pg: 'PostgreSQL (TimescaleDB)',
  clickhouse: 'ClickHouse (analytics)',
  redis: 'Redis (session / token cache)',
  typesense: 'Typesense (full-text / vector search engine)',
  stripe: 'Stripe API (payments, external)',
  rabbitmq: 'RabbitMQ (async message broker -> C_media_service)',
  gateway_ia: 'gateway_IA_search (LLM proxy - Groq/Cerebras/OpenRouter/Gemini/Mistral/Cohere)'
};

// ─────────────────────────────────────────────
//  A_core_service
// ─────────────────────────────────────────────

const A_core_service = [

  // ═══════════════════════════════════════════
  //  /api  (dashboard / management endpoints)
  // ═══════════════════════════════════════════

  // ── courses ─────────────────────────────────
  { path: 'POST /api/courses/create',                           operations: { pg: 'rw', typesense: 'w', clickhouse: 'r' } },       // CreateCourse – creates course+permissions in pg, upserts doc to typesense (reads stats from clickhouse for doc)
  { path: 'GET  /api/courses',                                  operations: { pg: 'r' } },                                         // GetCourses – reads courses with permissions from pg
  { path: 'GET  /api/courses/:courseId',                        operations: { pg: 'r', clickhouse: 'r' } },                        // GetCourseDetails – reads course+tags from pg, reads stats from clickhouse
  { path: 'PUT  /api/courses/:courseId',                        operations: { pg: 'rw', typesense: 'w', clickhouse: 'r' } },       // UpdateCourse – updates course in pg, optionally sets tags in pg, syncs typesense doc (reads stats from clickhouse)
  { path: 'DELETE /api/courses/:courseId',                      operations: { pg: 'rw', typesense: 'w' } },                        // DeleteCourse – cascade-deletes course+sections+lectures+permissions etc from pg, deletes typesense doc, creates notification in pg

  // ── course-permissions ──────────────────────
  { path: 'POST /api/course-permissions/:courseId',             operations: { pg: 'rw' } },                                        // SetUserPermissions
  { path: 'GET  /api/course-permissions/:courseId',             operations: { pg: 'r' } },                                         // GetCourseIntegrants
  { path: 'DELETE /api/course-permissions/:courseId',           operations: { pg: 'rw' } },                                        // DeleteUserPermissions

  // ── course-sections ─────────────────────────
  { path: 'POST /api/course-sections/create',                   operations: { pg: 'rw' } },                                        // CreateCourseSection
  { path: 'PUT  /api/course-sections/:sectionId',               operations: { pg: 'rw' } },                                        // UpdateCourseSection
  { path: 'PUT  /api/course-sections/:sectionId/position',      operations: { pg: 'rw' } },                                        // UpdateCourseSectionPosition
  { path: 'DELETE /api/course-sections/:sectionId',             operations: { pg: 'rw' } },                                        // DeleteCourseSection (cascade deletes lectures)

  // ── course-tags ─────────────────────────────
  { path: 'GET  /api/course-tags',                              operations: { pg: 'r' } },                                         // GetTags – reads tags by prefix from pg

  // ── lectures ────────────────────────────────
  { path: 'GET  /api/lectures/:lectureId',                      operations: { pg: 'r' } },                                         // GetLecture
  { path: 'POST /api/lectures/create',                          operations: { pg: 'rw' } },                                        // CreateLecture – creates lecture + lecture data (video/document/quiz) in pg
  { path: 'PUT  /api/lectures/:lectureId',                      operations: { pg: 'rw' } },                                        // UpdateLecture
  { path: 'PUT  /api/lectures/:lectureId/position',             operations: { pg: 'rw' } },                                        // UpdateLecturePosition
  { path: 'PUT  /api/lectures/:lectureId/section',              operations: { pg: 'rw' } },                                        // MoveLectureToSection
  { path: 'DELETE /api/lectures/:lectureId',                    operations: { pg: 'rw' } },                                        // DeleteLecture

  // ── lecture-assets ──────────────────────────
  { path: 'POST /api/lecture-assets/:lectureId/files',          operations: { pg: 'rw' } },                                        // SetFilesToLecture – deletes old + creates new lecture assets in pg
  { path: 'GET  /api/lecture-assets/:lectureId/files',          operations: { pg: 'r' } },                                         // GetLectureFiles

  // ── files ───────────────────────────────────
  { path: 'POST /api/files/upload',                             operations: { pg: 'rw', rabbitmq: 'pub' } },                       // UploadCourseFiles – saves files to disk, creates file records in pg, publishes AMQP messages to C_media_service for async processing (video/image/other queues)
  { path: 'POST /api/files/upload-image',                       operations: { pg: 'rw', rabbitmq: 'pub+sub' } },                   // UploadImage – saves image to disk, creates file record in pg, publishes AMQP message to C_media_service and blocks waiting for RPC reply with processed metadata
  { path: 'GET  /api/files/:courseId',                          operations: { pg: 'r' } },                                         // GetCourseFiles

  // ── files-video ─────────────────────────────
  { path: 'GET  /api/files-video/:fileId',                      operations: { pg: 'r' } },                                         // GetVideoDetails

  // ── quizzes ─────────────────────────────────
  { path: 'POST /api/quizzes/create/:courseId',                 operations: { pg: 'rw' } },                                        // CreateQuiz
  { path: 'GET  /api/quizzes/:courseId',                        operations: { pg: 'r' } },                                         // GetQuizzes
  { path: 'GET  /api/quizzes/:courseId/:quizId',                operations: { pg: 'r' } },                                         // GetQuizDetails
  { path: 'DELETE /api/quizzes/:quizId',                        operations: { pg: 'rw' } },                                        // DeleteQuiz
  { path: 'PUT  /api/quizzes/:quizId',                          operations: { pg: 'rw' } },                                        // UpdateQuiz

  // ── quizzes-questions ───────────────────────
  { path: 'POST /api/quizzes-questions/create/:quizId',         operations: { pg: 'rw' } },                                        // CreateQuestion
  { path: 'PUT  /api/quizzes-questions/:questionId',            operations: { pg: 'rw' } },                                        // UpdateQuestion
  { path: 'PUT  /api/quizzes-questions/:questionId/position',   operations: { pg: 'rw' } },                                        // UpdateQuestionPosition
  { path: 'DELETE /api/quizzes-questions/:questionId',          operations: { pg: 'rw' } },                                        // DeleteQuestion

  // ── analytics (dashboard) ──────────────────
  { path: 'GET  /api/analytics/:courseId',                      operations: { pg: 'r', clickhouse: 'r' } },                        // GetCourseAnalytics – reads stats, views, impressions, demographics, lecture analytics from clickhouse; reads lecture IDs from pg


  // ═══════════════════════════════════════════
  //  AMQP consumers (background, not HTTP)
  // ═══════════════════════════════════════════

  { path: '[AMQP] C_media_service image reply',                 operations: { pg: 'rw', rabbitmq: 'sub' } },                       // Consumes image processing results from C_media_service, updates file metadata+status in pg
  { path: '[AMQP] C_media_service video reply',                 operations: { pg: 'rw', rabbitmq: 'sub' } },                       // Consumes video processing results from C_media_service, updates file metadata+status in pg
  { path: '[AMQP] C_media_service other reply',                 operations: { pg: 'rw', rabbitmq: 'sub' } },                       // Consumes other file processing results from C_media_service, updates file metadata+status in pg
  { path: '[AMQP] clickhouse course stats → typesense',         operations: { typesense: 'w', rabbitmq: 'sub' } },                 // Consumes aggregated course stats from clickhouse (via AMQP), updates typesense document with latest stats (avgRating, totalReviews, totalViews, totalImpressions)
]

const D_users_service = [
  // ═══════════════════════════════════════════
  //  /cli  (client-facing endpoints)
  // ═══════════════════════════════════════════

  // ── search ──────────────────────────────────
  { path: 'GET  /cli/search',                                  operations: { typesense: 'r', clickhouse: 'w', gateway_ia: 'r' } }, // SearchCourses – when mode=ai, calls gateway_IA_search to generate structured filters from natural language, then searches typesense; when mode=fts, searches typesense directly. Writes views+queries to clickhouse
  { path: 'GET  /cli/search/autocomplete',                     operations: { typesense: 'r', clickhouse: 'r' } },                 // SearchCoursesAutocomplete – searches typesense titles + reads clickhouse top queries by prefix
  { path: 'GET  /cli/search/recommendations/:courseId',        operations: { typesense: 'r' } },                                  // GetCourseRecommendations – vector search in typesense
  { path: 'GET  /cli/search/suggestions',                      operations: { typesense: 'r' } },                                  // GetFilterSuggestions – facet query on typesense
  { path: 'GET  /cli/search/top-courses',                      operations: { typesense: 'r', clickhouse: 'w' } },                 // GetTopCourses – reads typesense, writes impression views to clickhouse

  // ── courses ─────────────────────────────────
  { path: 'GET  /cli/courses',                                 operations: { pg: 'r' } },                                         // FindCourses – reads courses from pg with prefix filter
  { path: 'GET  /cli/courses/watch/:courseSlug',                operations: { pg: 'r', typesense: 'r', clickhouse: 'r' } },        // WatchCourse – reads course, sections, lectures, tags, permissions, progress, purchases from pg; favorites from typesense; stats from clickhouse

  // ── course-purchases ────────────────────────
  { path: 'GET  /cli/course-purchases',                        operations: { pg: 'r', typesense: 'r' } },                         // GetCoursePurchases – reads purchases from pg, enriches from typesense

  // ── gift-codes ──────────────────────────────
  { path: 'GET  /cli/gift-codes/:orderId/:courseId',            operations: { pg: 'r' } },                                         // GetOrderItemGiftCodes
  { path: 'POST /cli/gift-codes/redeem',                       operations: { pg: 'rw', clickhouse: 'w' } },                       // RedeemGiftCode – reads+updates gift code, creates course purchase in pg, writes purchase analytics to clickhouse

  // ── payment-methods ─────────────────────────
  { path: 'GET  /cli/payment-methods',                          operations: { pg: 'r' } },                                         // FindUserPaymentMethods
  { path: 'POST /cli/payment-methods/setup-intent',             operations: { pg: 'r', stripe: 'w' } },                            // CreateSetupIntent – reads user from pg, creates Stripe SetupIntent
  { path: 'POST /cli/payment-methods/setup-intent/finish',      operations: { pg: 'rw', stripe: 'r' } },                           // FinishSetupIntent – reads Stripe SetupIntent, creates payment method in pg
  { path: 'DELETE /cli/payment-methods/:paymentMethodId',        operations: { pg: 'rw', stripe: 'w' } },                           // RemovePaymentMethod – deletes from pg, detaches from Stripe
  { path: 'PUT  /cli/payment-methods/:paymentMethodId',         operations: { pg: 'rw', stripe: 'w' } },                           // UpdatePaymentMethod – updates pg, updates Stripe

  // ── payments ────────────────────────────────
  { path: 'POST /cli/payments/intent',                          operations: { pg: 'rw', stripe: 'w' } },                           // CreatePaymentIntent – reads user+cart from pg, creates order+orderItems+payment in pg, creates Stripe PaymentIntent
  { path: 'POST /cli/payments/add-to-library',                  operations: { pg: 'rw', clickhouse: 'w' } },                       // AddCourseToLibrary – reads course from pg, creates purchase in pg, writes analytics to clickhouse

  // ── webhook (Stripe) ───────────────────────
  { path: 'POST /webhook',                                      operations: { pg: 'rw', stripe: 'r', clickhouse: 'w' } },          // StripeWebhook – on success: updates payment+order in pg, creates purchases+gift codes+notifications in pg, writes purchase analytics to clickhouse, deletes shopping cart; reads Stripe PaymentMethod for saving; on failure/cancel: updates payment+order in pg; on setup: reads Stripe PaymentMethod, creates payment method in pg

  // ── orders ──────────────────────────────────
  { path: 'GET  /cli/orders',                                   operations: { pg: 'r' } },                                         // GetUserOrders

  // ── course-reviews ──────────────────────────
  { path: 'GET  /cli/course-reviews/:courseSlug',                operations: { pg: 'r' } },                                         // ListReviews
  { path: 'POST /cli/course-reviews/:courseSlug',                operations: { pg: 'rw' } },                                        // CreateReview – creates review, updates course stats via materialized view
  { path: 'PUT  /cli/course-reviews/:reviewId',                  operations: { pg: 'rw' } },                                        // UpdateReview

  // ── favorite-courses ────────────────────────
  { path: 'GET  /cli/favorite-courses',                          operations: { pg: 'r', typesense: 'r' } },                         // GetFavoriteCourses – reads favorites from pg, enriches from typesense
  { path: 'PUT  /cli/favorite-courses/:courseId',                operations: { pg: 'rw' } },                                        // SetFavorite – creates or deletes favorite in pg

  // ── course-progress ─────────────────────────
  { path: 'POST /cli/course-progress/mark-as-seen',             operations: { pg: 'rw' } },                                        // MarkAsSeen – creates/updates progress in pg
  { path: 'POST /cli/course-progress/reset',                    operations: { pg: 'rw' } },                                        // ResetCourseProgress – deletes progress in pg

  // ── analytics (client tracking) ─────────────
  { path: 'POST /cli/analytics/watch/course/:courseId',          operations: { clickhouse: 'w' } },                                 // TrackCourseView – writes raw view to clickhouse
  { path: 'POST /cli/analytics/watch/lecture/:lectureId',        operations: { clickhouse: 'w' } },                                 // TrackLectureView – writes raw lecture view to clickhouse

  // ── lectures (client) ───────────────────────
  { path: 'GET  /cli/lectures/play/:lectureSlug',               operations: { pg: 'r' } },                                         // GetLecture – reads lecture+section+course+progress from pg

  // ── lecture-comments ────────────────────────
  { path: 'GET  /cli/lecture-comments/:lectureSlug',             operations: { pg: 'r' } },                                         // ListComments
  { path: 'POST /cli/lecture-comments/:lectureSlug',             operations: { pg: 'rw' } },                                        // CreateComment
  { path: 'PUT  /cli/lecture-comments/:commentId',               operations: { pg: 'rw' } },                                        // UpdateComment
  { path: 'DELETE /cli/lecture-comments/:commentId',             operations: { pg: 'rw' } },                                        // DeleteComment

  // ── notifications ───────────────────────────
  { path: 'GET  /cli/notifications',                             operations: { pg: 'r' } },                                         // GetNotifications
  { path: 'POST /cli/notifications/mark-as-seen',               operations: { pg: 'rw' } },                                        // MarkAllAsSeen

  // ── quizzes (client) ────────────────────────
  { path: 'GET  /cli/quizzes/attempt/:attemptId',               operations: { pg: 'r' } },                                         // GetQuizAttemptDetails
  { path: 'POST /cli/quizzes/attempt/:lectureSlug',             operations: { pg: 'rw' } },                                        // StartQuizAttempt – reads quiz+lecture, creates attempt in pg
  { path: 'POST /cli/quizzes/attempt/:lectureSlug/answer/:questionId', operations: { pg: 'rw' } },                                 // SetAnswer – upserts quiz attempt answer in pg
  { path: 'POST /cli/quizzes/attempt/:lectureSlug/finish',      operations: { pg: 'rw' } },                                        // FinishAttempt – grades+updates attempt in pg

  // ── shopping-cart ───────────────────────────
  { path: 'GET  /cli/shopping-cart',                             operations: { pg: 'r' } },                                         // GetShoppingCart
  { path: 'PUT  /cli/shopping-cart',                             operations: { pg: 'rw' } },                                        // UpdateShoppingCart
  { path: 'DELETE /cli/shopping-cart',                           operations: { pg: 'rw' } },                                        // ClearShoppingCart
]


// ─────────────────────────────────────────────
//  B_identity_service
// ─────────────────────────────────────────────

const B_identity_service = [

  // ═══════════════════════════════════════════
  //  /api  (public auth endpoints)
  // ═══════════════════════════════════════════

  { path: 'POST /api/auth/register',                            operations: { pg: 'rw', redis: 'w', stripe: 'w' } },               // Register – checks user existence in pg, inserts user in pg (creates Stripe customer), creates refresh session in pg, stores access token version in redis
  { path: 'POST /api/auth/login',                               operations: { pg: 'rw', redis: 'w' } },                            // Login – reads user from pg, creates refresh session in pg, stores access token in redis, creates login notification in pg
  { path: 'GET  /api/auth/user',                                operations: { pg: 'r' } },                                         // GetUserProfile – reads user + unread notification count from pg
  { path: 'POST /api/auth/refresh',                             operations: { pg: 'rw', redis: 'rw' } },                           // RefreshAccessToken – validates refresh token, rotates refresh session in pg, deletes old + writes new access token version in redis
  { path: 'POST /api/auth/logout',                              operations: { pg: 'rw', redis: 'w' } },                            // Logout – revokes refresh session(s) in pg, deletes access token key(s) from redis
  { path: 'GET  /api/auth/sessions',                            operations: { pg: 'r', redis: 'r' } },                             // GetUserSessions – reads refresh sessions from pg, checks online status from redis

  // ── user ────────────────────────────────────
  { path: 'GET  /api/user/prefix',                              operations: { pg: 'r' } },                                         // GetUsersByPrefix – reads users from pg

  // ═══════════════════════════════════════════
  //  /internal  (service-to-service)
  // ═══════════════════════════════════════════

  { path: 'POST /internal/auth/authenticate',                   operations: { pg: 'r', redis: 'r' } },                             // AuthenticateClientAccessToken – validates JWT, checks session version in redis, reads refresh session from pg
  { path: 'GET  /internal/user/info',                           operations: { pg: 'r' } },                                         // GetUserInfo – reads user from pg by id/username/email
]
