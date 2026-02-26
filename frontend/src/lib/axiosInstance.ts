import axios, { AxiosError } from 'axios'
import { ErrKind, type LocalErrorResponse } from "@/types/error"
import { ClientJwtService } from '@/services/client/clientJwt.service'

export const http = axios.create()

// transform local error
http.interceptors.response.use(
  (resp) => resp,
  (err: AxiosError<LocalErrorResponse>) => {
    let newError: LocalErrorResponse = {
      error: ErrKind.Status0
    }

    if (err.response?.data && err.response.data.error in ErrKind) {
      newError = err.response.data
    }

    return Promise.reject({
      ...err,
      response: {
        ...err.response,
        data: newError
      }
    })
  }
)

// add access token
http.interceptors.request.use(
  (conf) => {
    if (ClientJwtService.getAccessToken()) {
      conf.headers.set('Authorization', `Bearer ${ClientJwtService.getAccessToken()}`)
    }
    return conf
  }
)

// refresh access token
http.interceptors.response.use(
  (resp) => resp,
  async (err: AxiosError<LocalErrorResponse>) => {
    if (err.response!.data.error === ErrKind.InvalidAccessToken) {
      await ClientJwtService.refreshAccessToken()
      return http(err.config!)
    }

    return Promise.reject(err)
  }
)