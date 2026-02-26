// src/services/files.service.ts
import { http } from "@/lib/axiosInstance"
import { objectToParams } from "@/lib/objectToParams"
import type { FileKind } from "@/types/common/files"
import type { UploadFilesRequest, UploadFilesResponse, GetFilesRequest, UploadImageRequest } from "@/types/dashboard/files"
import type { Pagination } from "@/types/pagination"
import type { AxiosRequestConfig } from "axios"

export class FilesService {
  static async uploadFiles(payload: UploadFilesRequest, config?: AxiosRequestConfig) {
    const { files, courseId } = payload
    const multipart = new FormData()
    for (const file of files) {
      multipart.append(file.kind, file.file)
    }

    const { data } = await http.post<UploadFilesResponse[]>(
      `${import.meta.env.VITE_A_SERVICE_URL}/files/upload?courseId=${courseId}`,
      multipart,
      {
        ...config,
        headers: {
          "Content-Type": "multipart/form-data",
          ...config?.headers,
        },
      }
    )
    return data
  }
    
  static async uploadImage(payload: UploadImageRequest, config?: AxiosRequestConfig) {
    const { image, courseId } = payload
    const multipart = new FormData()
    const name: FileKind = 'Image'
    multipart.append(name, image)
    
    const { data } = await http.post<UploadFilesResponse>(
      `${import.meta.env.VITE_A_SERVICE_URL}/files/upload-image?courseId=${courseId}`,
      multipart,
      {
        ...config,
        headers: {
          "Content-Type": "multipart/form-data",
          ...config?.headers,
        },
      }
    )
    return data
  }

  static async getFiles(query: GetFilesRequest & Pagination, config?: AxiosRequestConfig) {
    const { courseId, q, ...filters } = query

    const paramsStr = (!!q && q.length >= 3)
      ? objectToParams({ ...filters, q }).toString()
      : objectToParams(filters).toString()
    
    const { data } = await http.get<UploadFilesResponse[]>(
      `${import.meta.env.VITE_A_SERVICE_URL}/files/${courseId}?${paramsStr}`,
      config
    )
    return data
  }
}
