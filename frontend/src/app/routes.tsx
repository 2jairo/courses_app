import { FullPageSpinner } from "@/components/shared/fullPageSpinner/fullPageSpinner";
import { AuthGuard } from "@/guards/authGuard";
import React, { Suspense } from "react";
import { Route, Routes } from "react-router-dom";

const Home = React.lazy(() => import('../pages/home/home'))
const Login = React.lazy(() => import('../pages/login/login'))
const Register = React.lazy(() => import('../pages/register/register'))
const Page404 = React.lazy(() => import('../pages/page404/page404'))

export const AppRouter = () => (
  <Suspense fallback={<FullPageSpinner />}>
    <Routes>
      <Route
        path="/" 
        element={<Home />} 
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