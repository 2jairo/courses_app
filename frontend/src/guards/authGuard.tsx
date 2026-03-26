import { UserContext } from "@/context/user/createUserContext"
import { useContext } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { FullPageSpinner } from "@/components/shared/fullPageSpinner/fullPageSpinner"

interface AuthGuardProps {
  children: React.ReactNode
  userLoggedIn?: boolean
  navigateTo?: string
}

export const AuthGuard = ({ children, userLoggedIn = false, navigateTo = "/login" }: AuthGuardProps) => {
  const { isLogged } = useContext(UserContext)
  const location = useLocation()

  if (!isLogged) {
    return <FullPageSpinner />
  }

  
  if (!userLoggedIn && !isLogged.logged) {
    const returnUrl = new URLSearchParams({ returnTo: location.pathname + location.search }).toString()
    return <Navigate to={`${navigateTo}?${returnUrl}`} />
  }
  if (userLoggedIn && isLogged.logged) {
    return <Navigate to="/" />
  }

  return children
}