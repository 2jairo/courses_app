import { FullPageSpinner } from "@/components/shared/fullPageSpinner/fullPageSpinner";
import { AuthGuard } from "@/guards/authGuard";
import React, { Suspense } from "react";
import { Route, Routes } from "react-router-dom";

const Home = React.lazy(() => import('@/pages/home/home'))
const Login = React.lazy(() => import('@/pages/login/login'))
const Register = React.lazy(() => import('@/pages/register/register'))
const Page404 = React.lazy(() => import('@/pages/page404/page404'))

const DashboardCourseList = React.lazy(() => import('@/pages/dashboard/courses/dashboardCourseList'))
const DashboardModifyCourse = React.lazy(() => import('@/pages/dashboard/courses/[courseId]/dashboardModifyCourse'))
const DashboardModifyVideo = React.lazy(() => import('@/pages/dashboard/video/[courseId]/[videoId]/dashboardModifyVideo'))
const DashboardModifyQuiz = React.lazy(() => import('@/pages/dashboard/quizzes/[courseId]/[quizId]/dashboardModifyQuiz'))

const Watch = React.lazy(() => import('@/pages/watch/[courseSlug]/watch'))
const Play = React.lazy(() => import('@/pages/play/[courseSlug]/[lectureSlug]/play'))

export const AppRouter = () => (
  <Suspense fallback={<FullPageSpinner />}>
    <Routes>
      <Route
        path="/" 
        element={<Home />} 
      />

      <Route
        path="/dashboard/courses"
        element={<AuthGuard navigateTo="/login"><DashboardCourseList /></AuthGuard>}
      />
      <Route
        path="/dashboard/courses/:courseId"
        element={<AuthGuard navigateTo="/login"><DashboardModifyCourse /></AuthGuard>}
      />
      <Route
        path="/dashboard/video/:fileId"
        element={<AuthGuard navigateTo="/login"><DashboardModifyVideo /></AuthGuard>}
      />
      <Route
        path="/dashboard/quizzes/:courseId/:quizId"
        element={<AuthGuard navigateTo="/login"><DashboardModifyQuiz /></AuthGuard>}
      />

      <Route
        path="/watch/:courseSlug"
        element={<Watch />}
      />

      <Route 
        path="/play/:courseSlug"
        element={<Play />}
      />
      <Route
        path="/play/:courseSlug/:lectureSlug"
        element={<Play />}
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
        path="*" 
        element={<Page404 />} 
      />
    </Routes>
  </Suspense>
)