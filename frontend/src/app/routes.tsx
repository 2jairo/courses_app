import { FullPageSpinner } from "@/components/shared/fullPageSpinner/fullPageSpinner";
import { AuthGuard } from "@/guards/authGuard";
import React, { Suspense } from "react";
import { Route, Routes } from "react-router-dom";

const Home = React.lazy(() => import('@/pages/home/home'))
const Login = React.lazy(() => import('@/pages/login/login'))
const Register = React.lazy(() => import('@/pages/register/register'))
const Page404 = React.lazy(() => import('@/pages/page404/page404'))

const CourseListDasbhoard = React.lazy(() => import('@/pages/dashboard/coursesList/courseListDashboardPage'))
const ModifyCourseContentDashboard = React.lazy(() => import('@/pages/dashboard/modifyCourseContent/modifyCourseContentDashboardPage'))
const ModifyVideoContentDashboard = React.lazy(() => import('@/pages/dashboard/modifyVideoContent/modifyVideoContentDashboard'))

const Watch = React.lazy(() => import('@/pages/watch/watchPage'))
const Play = React.lazy(() => import('@/pages/play/play'))

export const AppRouter = () => (
  <Suspense fallback={<FullPageSpinner />}>
    <Routes>
      <Route
        path="/" 
        element={<Home />} 
      />

      <Route
        path="/dashboard/courses"
        element={<AuthGuard navigateTo="/login"><CourseListDasbhoard /></AuthGuard>}
      />
      <Route
        path="/dashboard/courses/:courseId"
        element={<AuthGuard navigateTo="/login"><ModifyCourseContentDashboard /></AuthGuard>}
      />
      <Route
        path="/dashboard/video/:fileId"
        element={<AuthGuard navigateTo="/login"><ModifyVideoContentDashboard /></AuthGuard>}
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