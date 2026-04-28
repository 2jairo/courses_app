/**
 * Maps each frontend page/route to the backend endpoints it calls.
 *
 * Sources of truth:
 *   - pages/*                          → direct query/mutation imports
 *   - components/shared/*              → child components that fire queries/mutations
 *   - queries/*, mutations/*           → the actual service calls
 *   - services/*                       → the HTTP method + URL
 *   - context/user (global)            → auth flows available on every page
 *   - components/layout/header (global)→ notifications, shopping cart badge, search bar
 *
 * Endpoint format follows the previous endpoint-db-operations.js file.
 * "via component" notes indicate the call comes from a child component, not the page itself.
 */
const global_endpoints = {
  description: 'Called from layout header, user context, or interceptors on every page',
  endpoints: [
    'GET  /api/auth/user',                            // UserContext.populate – fetch current user profile on load
    'POST /api/auth/refresh',                         // Axios interceptor – auto-refresh access token
    'POST /api/auth/logout',                          // Header dropdown – logout
    'GET  /cli/notifications',                        // Header – notification bell
    'POST /cli/notifications/mark-as-seen',           // Header – mark notifications as seen
    'GET  /cli/shopping-cart',                         // Header – shopping cart badge/count
    'GET  /cli/search/autocomplete',                  // Header SearchInput – autocomplete dropdown
  ],
}

const pages = [

  // ── / (Home) ────────────────────────────────
  {
    route: '/',
    page: 'Home',
    endpoints: [
      'GET  /cli/search/top-courses',                 // useTopCoursesQuery – hero carousel
    ],
  },

  // ── /login ──────────────────────────────────
  {
    route: '/login',
    page: 'Login',
    endpoints: [
      'POST /api/auth/login',                         // UserContext.login
    ],
  },

  // ── /register ───────────────────────────────
  {
    route: '/register',
    page: 'Register',
    endpoints: [
      'POST /api/auth/register',                      // UserContext.register
    ],
  },

  // ── /search ─────────────────────────────────
  {
    route: '/search',
    page: 'Search',
    endpoints: [
      'GET  /cli/search',                             // useSearchCoursesQuery – main results (infinite scroll)
      'GET  /cli/search/suggestions',                 // useFilterSuggestionsQuery – facet filter dropdowns (via SearchInputFilters component)
    ],
  },

  // ── /watch/:courseSlug ──────────────────────
  {
    route: '/watch/:courseSlug',
    page: 'Watch (course detail)',
    endpoints: [
      'GET  /cli/courses/watch/:courseSlug',           // useWatchCourseQuery – course detail, sections, progress
      'POST /cli/analytics/watch/course/:courseId',    // via WatchCourseActions – track course view impression
      'PUT  /cli/favorite-courses/:courseId',          // via useToggleFavoriteCourseMutation – toggle favorite
      'PUT  /cli/shopping-cart',                       // via useUpdateShoppingCartMutation – add to cart
      'POST /cli/payments/add-to-library',             // via useAddToLibraryMutation – add free course to library
      'GET  /cli/course-reviews/:courseSlug',           // via WatchCourseReviews → useGetReviewsQuery
      'POST /cli/course-reviews/:courseSlug',           // via useCreateReviewMutation
      'PUT  /cli/course-reviews/:reviewId',             // via useUpdateReviewMutation
      'GET  /cli/search/recommendations/:courseId',    // via WatchCourseRecommendedCourses → useCourseRecommendationsQuery
    ],
  },

  // ── /play/:courseSlug/:lectureSlug ──────────
  {
    route: '/play/:courseSlug/:lectureSlug',
    page: 'Play (lecture player)',
    endpoints: [
      'GET  /cli/courses/watch/:courseSlug',           // useWatchCourseQuery – course sidebar with sections
      'GET  /cli/lectures/play/:lectureSlug',          // usePlayLectureQuery – lecture content
      'POST /cli/analytics/watch/lecture/:lectureId',  // via PlayCourse component – track lecture view
      'POST /cli/course-progress/mark-as-seen',       // via useMarkLectureAsSeenMutation
      'POST /cli/course-progress/reset',              // via useResetCourseProgressMutation
      'GET  /cli/lecture-comments/:lectureSlug',       // via LectureComments component – list comments
      'POST /cli/lecture-comments/:lectureSlug',       // via useCreateCommentMutation
      'PUT  /cli/lecture-comments/:commentId',         // via useUpdateCommentMutation
      'DELETE /cli/lecture-comments/:commentId',       // via useDeleteCommentMutation
      // Quiz lecture type:
      'POST /cli/quizzes/attempt/:lectureSlug',        // via ClientQuizzesService.startQuizAttempt
      'POST /cli/quizzes/attempt/:lectureSlug/answer/:questionId', // via ClientQuizzesService.setAnswer
      'POST /cli/quizzes/attempt/:lectureSlug/finish', // via ClientQuizzesService.finishQuizAttempt
      'GET  /cli/quizzes/attempt/:attemptId',          // via ClientQuizzesService.getQuizAttemptDetails
    ],
  },

  // ── /fav-courses ────────────────────────────
  {
    route: '/fav-courses',
    page: 'FavCourses',
    endpoints: [
      'GET  /cli/favorite-courses',                    // useFavoriteCoursesQuery (infinite scroll)
    ],
  },

  // ── /library ────────────────────────────────
  {
    route: '/library',
    page: 'Library',
    endpoints: [
      'GET  /cli/course-purchases',                    // usePurchasedCoursesQuery (infinite scroll)
    ],
  },

  // ── /checkout ───────────────────────────────
  {
    route: '/checkout',
    page: 'Checkout',
    endpoints: [
      'GET  /cli/shopping-cart',                       // useGetShoppingCartQuery – cart items
      'PUT  /cli/shopping-cart',                       // useUpdateShoppingCartMutation – update quantities
      'DELETE /cli/shopping-cart',                     // useClearShoppingCartMutation – clear cart
      'GET  /cli/payment-methods',                     // useGetPaymentMethodsQuery – saved cards
      'POST /cli/payments/intent',                     // useCreatePaymentIntentMutation – create Stripe PaymentIntent
    ],
  },

  // ── /profile ────────────────────────────────
  {
    route: '/profile',
    page: 'Profile',
    endpoints: [
      'GET  /internal/user/info',                      // useProfileInfoQuery → ClientProfileService.getUserInfo (calls B_identity_service)
    ],
  },

  // ── /settings/sessions ──────────────────────
  {
    route: '/settings/sessions',
    page: 'SettingsSessions',
    endpoints: [
      'GET  /api/auth/sessions',                       // useUserSessionsQuery – list active sessions
      'POST /api/auth/logout',                         // logout current/all sessions
    ],
  },

  // ── /settings/payment-methods ───────────────
  {
    route: '/settings/payment-methods',
    page: 'SettingsPaymentMethods',
    endpoints: [
      'GET  /cli/payment-methods',                     // useGetPaymentMethodsQuery
      'POST /cli/payment-methods/setup-intent',        // useCreateSetupIntentMutation
      'POST /cli/payment-methods/setup-intent/finish', // useFinishSetupIntentMutation
      'PUT  /cli/payment-methods/:paymentMethodId',    // useUpdatePaymentMethodMutation
      'DELETE /cli/payment-methods/:paymentMethodId',  // useRemovePaymentMethodMutation
    ],
  },

  // ── /settings/billing ───────────────────────
  {
    route: '/settings/billing',
    page: 'SettingsBilling',
    endpoints: [
      'GET  /cli/orders',                              // useOrdersQuery → OrdersList component
      'GET  /cli/gift-codes/:orderId/:courseId',        // via gift code dialog inside order items
      'POST /cli/gift-codes/redeem',                   // via redeem gift code dialog
    ],
  },


  // ═══════════════════════════════════════════
  //  DASHBOARD PAGES
  // ═══════════════════════════════════════════

  // ── /dashboard/courses ──────────────────────
  {
    route: '/dashboard/courses',
    page: 'DashboardCourseList',
    endpoints: [
      'GET  /api/courses',                             // useDashboardCoursesQuery – list user's courses
      'POST /api/courses/create',                      // useCreateCourseMutation – create course modal
      'DELETE /api/courses/:courseId',                  // useDeleteCourseMutation – delete from card actions
    ],
  },

  // ── /dashboard/courses/:courseId ─────────────
  {
    route: '/dashboard/courses/:courseId',
    page: 'DashboardModifyCourse',
    endpoints: [
      // Course details
      'GET  /api/courses/:courseId',                    // useCourseDetailsQuery
      'PUT  /api/courses/:courseId',                    // useUpdateCourseMutation – update course props

      // Course permissions
      'GET  /api/course-permissions/:courseId',         // useDashboardCoursePermissionsQuery
      'POST /api/course-permissions/:courseId',         // useSetUserPermissionsMutation
      'DELETE /api/course-permissions/:courseId',       // useDeleteUserPermissionsMutation

      // Course sections
      'POST /api/course-sections/create',              // useCreateCourseSectionMutation
      'PUT  /api/course-sections/:sectionId',          // useUpdateCourseSectionMutation
      'PUT  /api/course-sections/:sectionId/position', // useUpdateCourseSectionPositionMutation
      'DELETE /api/course-sections/:sectionId',        // useDeleteCourseSectionMutation

      // Lectures
      'POST /api/lectures/create',                     // useCreateLectureMutation
      'GET  /api/lectures/:lectureId',                 // useLectureDetailsQuery (via edit dialog)
      'PUT  /api/lectures/:lectureId',                 // useUpdateLectureMutation
      'PUT  /api/lectures/:lectureId/position',        // useUpdateLecturePositionMutation
      'PUT  /api/lectures/:lectureId/section',         // useMoveLectureToSectionMutation
      'DELETE /api/lectures/:lectureId',               // useDeleteLectureMutation

      // Lecture assets
      'POST /api/lecture-assets/:lectureId/files',     // useSetFilesToLectureMutation
      'GET  /api/lecture-assets/:lectureId/files',     // useLectureFilesQuery

      // Quizzes
      'GET  /api/quizzes/:courseId',                   // useQuizzesQuery (infinite scroll)
      'POST /api/quizzes/create/:courseId',            // useCreateQuizMutation
      'DELETE /api/quizzes/:quizId',                   // useDeleteQuizMutation

      // Files
      'GET  /api/files/:courseId',                     // useFilesQuery (infinite scroll)
      'POST /api/files/upload',                        // useUploadFilesMutation – file dropzone
      'POST /api/files/upload-image',                  // useUploadImageMutation – poster upload

      // Users (B_identity_service, for permission user search)
      'GET  /api/user/prefix',                         // via CoursePermissionsActionsAddUser → search users by prefix
    ],
  },

  // ── /dashboard/analytics/:courseId ──────────
  {
    route: '/dashboard/analytics/:courseId',
    page: 'DashboardCourseAnalytics',
    endpoints: [
      'GET  /api/courses/:courseId',                    // useCourseDetailsQuery – course info header
      'GET  /api/analytics/:courseId',                  // useCourseAnalyticsQuery – all analytics data
    ],
  },

  // ── /dashboard/video/:fileId ────────────────
  {
    route: '/dashboard/video/:fileId',
    page: 'DashboardModifyVideo',
    endpoints: [
      'GET  /api/files-video/:fileId',                 // useVideoDetailsQuery – video metadata & resolutions
    ],
  },

  // ── /dashboard/quizzes/:courseId/:quizId ─────
  {
    route: '/dashboard/quizzes/:courseId/:quizId',
    page: 'DashboardModifyQuiz',
    endpoints: [
      'GET  /api/quizzes/:courseId/:quizId',            // useQuizDetailsQuery – quiz + questions
      'PUT  /api/quizzes/:quizId',                     // useUpdateQuizMutation

      // Quiz questions
      'POST /api/quizzes-questions/create/:quizId',    // useCreateQuestionMutation
      'PUT  /api/quizzes-questions/:questionId',       // useUpdateQuestionMutation
      'PUT  /api/quizzes-questions/:questionId/position', // useUpdateQuestionPositionMutation
      'DELETE /api/quizzes-questions/:questionId',     // useDeleteQuestionMutation
    ],
  },
]
