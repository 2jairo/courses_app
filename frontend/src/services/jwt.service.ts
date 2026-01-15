import { http } from "@/lib/axiosInstance";

const LOCALSTORAGE_TOKEN_KEY = 'jwt';

export class JwtService {
  private static accessToken = localStorage.getItem(LOCALSTORAGE_TOKEN_KEY)
  private static refreshingAccessToken: Promise<{ token: string }> | null = null
  
  static getAccessToken() {
    return this.accessToken
  }

  static setAccessToken(value: string) {
    this.accessToken = value
    localStorage.setItem(LOCALSTORAGE_TOKEN_KEY, value)
  }

  static destroyAccessToken() {
    this.accessToken = null
    localStorage.removeItem(LOCALSTORAGE_TOKEN_KEY)
  }

  static async refreshAccessToken() {
    if(this.refreshingAccessToken) {
      return this.refreshingAccessToken
    }

    const promise = http.post<{ token: string }>(
      `${import.meta.env.VITE_B_SERVICE_URL}/auth/refresh`, 
      undefined, 
      { withCredentials: true }
    )
    .then((resp) => {
      this.setAccessToken(resp.data.token)
      return resp.data
    })
    .finally(() => {
      this.refreshingAccessToken = null
    })

    this.refreshingAccessToken = promise
    return promise
  }
  

}