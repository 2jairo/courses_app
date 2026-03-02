import { http } from "@/lib/axiosInstance";
import { ErrKind, type LocalErrorResponse } from "@/types/error";
import type { AxiosError, AxiosRequestConfig } from "axios";
import { JwtRefreshBroadcastChannel, type RefreshMessage } from "./broadcastChannels/jwtBrocadcastChannel";
import { UserStateBroadcastChannel } from "./broadcastChannels/userBroadcastChannel";

const LOCALSTORAGE_TOKEN_KEY = 'jwt';

export class ClientJwtService {
  private static accessToken = localStorage.getItem(LOCALSTORAGE_TOKEN_KEY)
  private static onLogout: (() => void) | null = null
  static userChannel = new UserStateBroadcastChannel()
  private static channel = new JwtRefreshBroadcastChannel(
    (token) => this.setAccessToken(token),
    () => this.onLogout?.()    
  )

  static setOnLogout(cb: () => void) {
    this.onLogout = cb
  }

  static getAccessToken() {
    return localStorage.getItem(LOCALSTORAGE_TOKEN_KEY)
  }

  static setAccessToken(value: string) {
    this.accessToken = value
    localStorage.setItem(LOCALSTORAGE_TOKEN_KEY, value)
  }

  static destroyAccessToken() {
    this.accessToken = null
    localStorage.removeItem(LOCALSTORAGE_TOKEN_KEY)
  }

  static async refreshAccessToken(config?: AxiosRequestConfig) {
    if (this.channel.isRefreshing) {
      return new Promise<{ token: string }>((resolve, reject) => {
        this.channel.addWaiter(resolve, reject)
      })
    }

    this.channel.handleRefreshBegin()
    this.channel.channel.postMessage({ type: 'REFRESH_BEGIN' } satisfies RefreshMessage)

    return http.post<{ token: string }>(
      `${import.meta.env.VITE_B_SERVICE_URL}/auth/refresh`,
      undefined,
      { ...config, withCredentials: true }
    )
    .then((resp) => {
      this.channel.handleTokenRefreshed(resp.data.token)
      this.channel.channel.postMessage({ type: 'TOKEN_REFRESHED', token: resp.data.token } satisfies RefreshMessage)
      return resp.data
    })
    .catch((error: AxiosError<LocalErrorResponse>) => {
      const err = error.response!.data

      if (err.error == ErrKind.InvalidRefreshToken) {
        this.destroyAccessToken()
      }

      this.channel.handleRefreshFailed(error)
      this.channel.channel.postMessage({ type: 'REFRESH_FAILED', error: error } satisfies RefreshMessage)
      throw error
    })
  }
}
