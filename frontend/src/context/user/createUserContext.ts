import { createContext, useEffect, useState } from "react"
import { ClientAuthService } from '@/services/client/clientAuth.service';
import type { UserAuthServicieLoginRequestBody, UserAuthServiceRegisterRequestBody, UserAuthServiceUserProfileResponse } from '@/types/client/auth';
import { ErrKind, type LocalErrorResponse } from "@/types/error";
import { ClientJwtService } from "@/services/client/clientJwt.service";

export const useCreateUserContext = () => {
  const [isLogged, setIsLogged] = useState<{ logged: boolean } | null>(null)
  const [user, setUserInner] = useState<UserAuthServiceUserProfileResponse | null>(null)

  const setUser = (userProfile: UserAuthServiceUserProfileResponse, broadcast = true) => {
    setIsLogged({ logged: true })
    setUserInner(userProfile)
    if (broadcast) ClientJwtService.userChannel.broadcastLogin(userProfile)
  }

  const logoutInner = async (destroyToken: boolean, allSessions = false, callService = true) => {
    setIsLogged({ logged: false })
    setUserInner(null)

    if(destroyToken) {
      ClientJwtService.destroyAccessToken()
      if (callService) {
        await ClientAuthService.logout({ all_sessions: allSessions })
      }
    }
  }

  const broadcastLogout = () => {
    ClientJwtService.userChannel.broadcastLogout()
  }

  useEffect(() => {
    ClientJwtService.setOnLogout(() => logoutInner(true))
    ClientJwtService.userChannel.setOnLogin((user) => setUser(user, false))
    ClientJwtService.userChannel.setOnLogout(() => logoutInner(true, false, false))
  }, [])

  const login = (data: UserAuthServicieLoginRequestBody) => {
    return ClientAuthService.login(data)
      .then(({ token, ...userProfile }) => {
        setUser(userProfile)
        ClientJwtService.setAccessToken(token)
      })
  };

  const register = (data: UserAuthServiceRegisterRequestBody) => {
    return ClientAuthService.register(data)
      .then(({ token, ...userProfile }) => {
        setUser(userProfile)
        ClientJwtService.setAccessToken(token)
      })
  };

  const populate = () => {
    if(isLogged && user) {
      return
    }

    const token = ClientJwtService.getAccessToken()
    if (!token) {
      logoutInner(false)
      return
    }

    return ClientAuthService.populate()
      .then((userProfile) => {
        setUser(userProfile)
      })
      .catch((e: LocalErrorResponse) => {
        logoutInner(e.error === ErrKind.Unauthorized)
      })
  }

  const logout = () => {
    broadcastLogout()
    return logoutInner(true)
  }

  const logoutAll = () => {
    broadcastLogout()
    return logoutInner(true, true)
  }

  const setUnreadNotifications = (count: number) => {
    setUserInner((prev) => {
      if (!prev) {
        return prev
      }

      return {
        ...prev,
        unread_notifications: Math.max(0, count),
      }
    })
  }

  return {
    isLogged,
    user,
    setUnreadNotifications,
    login,
    logout,
    logoutAll,
    register,
    populate
  }
}

export type UserContextType = ReturnType<typeof useCreateUserContext>

export const UserContext = createContext<UserContextType>(
  {} as UserContextType
)