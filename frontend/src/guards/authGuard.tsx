import { UserContext } from "@/context/user/createUserContext"
import { useContext } from "react"
import { Navigate } from "react-router-dom"
import { FullPageSpinner } from "@/components/shared/fullPageSpinner/fullPageSpinner"

interface Params {
  userLoggedIn?: boolean
  navigateTo?: string
  children: React.ReactNode
}
export const AuthGuard = ({ children, userLoggedIn = false, navigateTo = "/login" }: Params) => {
  const { isLogged } = useContext(UserContext)

  if (!isLogged) {
    return <FullPageSpinner />
  }

  const nv = userLoggedIn ? isLogged.logged : !isLogged.logged
  return nv ? <Navigate to={navigateTo} /> : children
}