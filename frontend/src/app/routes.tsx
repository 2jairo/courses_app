import { FullPageSpinner } from "@/components/shared/fullPageSpinner/fullPageSpinner";
import { AuthGuard } from "@/guards/authGuard";
import React, { Suspense } from "react";
import { Route, Routes } from "react-router-dom";

const Home = React.lazy(() => import('@/pages/home/home'))
const Login = React.lazy(() => import('@/pages/login/login'))
const Register = React.lazy(() => import('@/pages/register/register'))
const Profile = React.lazy(() => import('@/pages/profile/profile'))
const FavCourses = React.lazy(() => import('@/pages/fav-courses/favCourses'))
const Library = React.lazy(() => import('@/pages/library/library'))
const Checkout = React.lazy(() => import('@/pages/chcekout/checkout'))
const Watch = React.lazy(() => import('@/pages/watch/[courseSlug]/watch'))
const Play = React.lazy(() => import('@/pages/play/[courseSlug]/[lectureSlug]/play'))
const Search = React.lazy(() => import('@/pages/search/search'))

const SettingsSessions = React.lazy(() => import('@/pages/settings/sessions/sessions'))
const SettingsPaymentMethods = React.lazy(() => import('@/pages/settings/payment-methods/paymentMethods'))
const SettingsBilling = React.lazy(() => import('@/pages/settings/billing/billing'))

const DashboardCourseList = React.lazy(() => import('@/pages/dashboard/courses/dashboardCourseList'))
const DashboardCourseAnalytics = React.lazy(() => import('@/pages/dashboard/analytics/[courseId]/dashboardCourseAnalytics'))
const DashboardModifyCourse = React.lazy(() => import('@/pages/dashboard/courses/[courseId]/dashboardModifyCourse'))
const DashboardModifyVideo = React.lazy(() => import('@/pages/dashboard/video/[courseId]/[videoId]/dashboardModifyVideo'))
const DashboardModifyQuiz = React.lazy(() => import('@/pages/dashboard/quizzes/[courseId]/[quizId]/dashboardModifyQuiz'))

const Page404 = React.lazy(() => import('@/pages/page404/page404'))

export const AppRouter = () => (
  <Suspense fallback={<FullPageSpinner />}>
    <Routes>
      <Route
        path="/" 
        element={<Home />} 
      />

      <Route
        path="/dashboard/courses"
        element={<AuthGuard><DashboardCourseList /></AuthGuard>}
      />
      <Route
        path="/dashboard/courses/:courseId"
        element={<AuthGuard><DashboardModifyCourse /></AuthGuard>}
      />
      <Route
        path="/dashboard/analytics/:courseId"
        element={<AuthGuard><DashboardCourseAnalytics /></AuthGuard>}
      />
      <Route
        path="/dashboard/video/:fileId"
        element={<AuthGuard><DashboardModifyVideo /></AuthGuard>}
      />
      <Route
        path="/dashboard/quizzes/:courseId/:quizId"
        element={<AuthGuard><DashboardModifyQuiz /></AuthGuard>}
      />
      <Route 
        path="/search"
        element={<Search />}
      />

      <Route
        path="/watch/:courseSlug"
        element={<Watch />}
      />

      <Route 
        path="/play/:courseSlug"
        element={<AuthGuard><Play /></AuthGuard>}
      />
      <Route
        path="/play/:courseSlug/:lectureSlug"
        element={<AuthGuard><Play /></AuthGuard>}
      />

      <Route
        path="/fav-courses"
        element={<AuthGuard><FavCourses /></AuthGuard>}
      />
      <Route
        path="/library"
        element={<AuthGuard><Library /></AuthGuard>}
      />
      <Route 
        path="/checkout"
        element={<AuthGuard><Checkout /></AuthGuard>}
      />

      <Route
        path="/login" 
        element={<AuthGuard navigateTo="/" userLoggedIn><Login /></AuthGuard>} 
      /> 
      <Route
        path="/register" 
        element={<AuthGuard navigateTo="/" userLoggedIn><Register /></AuthGuard>} 
      />
      <Route 
        path="/profile"
        element={<AuthGuard><Profile /></AuthGuard>}
      />
      <Route
        path="/settings/sessions"
        element={<AuthGuard><SettingsSessions /></AuthGuard>}
      />
      <Route 
        path="/settings/payment-methods"
        element={<AuthGuard><SettingsPaymentMethods /></AuthGuard>}
      />
      <Route 
        path="/settings/billing"
        element={<AuthGuard><SettingsBilling /></AuthGuard>}
      />
      <Route
        path="*" 
        element={<Page404 />} 
      />
    </Routes>
  </Suspense>
)