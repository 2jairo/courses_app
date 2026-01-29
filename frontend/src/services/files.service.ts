// src/services/files.service.ts
import { http } from "@/lib/axiosInstance"
import { objectToParams } from "@/lib/objectToParams"
import type { UploadFilesRequest, UploadFilesResponse, GetFilesRequest } from "@/types/dashboard/files"
import type { Pagination } from "@/types/pagination"

export class FilesService {
  static async uploadFiles(payload: UploadFilesRequest) {
    const { files, courseId } = payload
    const multipart = new FormData()
    for (const file of files) {
      multipart.append(file.kind, file.file)
    }

    const { data } = await http.post<UploadFilesResponse[]>(
      `${import.meta.env.VITE_A_SERVICE_URL}/files/upload?courseId=${courseId}`,
      multipart,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    )
    return data
  }

  static async getFiles(query: GetFilesRequest & Pagination) {
    const { courseId, ...filters } = query 

    const params = objectToParams(filters).toString()   
    
    const { data } = await http.get<UploadFilesResponse[]>(
      `${import.meta.env.VITE_A_SERVICE_URL}/files/${courseId}?${params}`
    )
    return data
  }
}
