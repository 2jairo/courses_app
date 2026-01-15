import { createContext, useState } from "react"
import { UserAuthService } from '@/services/userAuth.service';
import type { UserAuthServicieLoginRequestBody, UserAuthServiceRegisterRequestBody, UserAuthServiceUserProfileResponse } from '@/types/user';
import { ErrKind, type LocalErrorResponse } from "@/types/error";
import { JwtService } from "@/services/jwt.service";

export const useCreateUserContext = () => {
  const [isLogged, setIsLogged] = useState<{ logged: boolean } | null>(null)
  const [user, setUserInner] = useState<UserAuthServiceUserProfileResponse | null>(null)

  const setUser = (userProfile: UserAuthServiceUserProfileResponse) => {
    setIsLogged({ logged: true })
    setUserInner(userProfile)
  }

  const logoutInner = async (destroyToken: boolean) => {
    setIsLogged({ logged: false })
    setUserInner(null)

    if(destroyToken) {
      JwtService.destroyAccessToken()
      await UserAuthService.logout()
    }
  }

  const login = (data: UserAuthServicieLoginRequestBody) => {
    return UserAuthService.login(data)
      .then(({ token, ...userProfile }) => {
        setUser(userProfile)
        JwtService.setAccessToken(token)
      })
  };

  const register = (data: UserAuthServiceRegisterRequestBody) => {
    return UserAuthService.register(data)
      .then(({ token, ...userProfile }) => {
        setUser(userProfile)
        JwtService.setAccessToken(token)
      })
  };

  const populate = () => {
    const token = JwtService.getAccessToken()
    if (!token) {
      logoutInner(false)
      return
    }

    return UserAuthService.populate()
      .then((userProfile) => {
        setUser(userProfile)
      })
      .catch((e: LocalErrorResponse) => {
        logoutInner(e.error === ErrKind.Unauthorized)
      })
  }

  const logout = () => {
    return logoutInner(true)
  }  

  return {
    isLogged,
    user,
    login,
    logout,
    register,
    populate
  }
}

export type UserContextType = ReturnType<typeof useCreateUserContext>

export const UserContext = createContext<UserContextType>(
  {} as UserContextType
)