import { clientFetch } from "@/shared/api/http/client-fetch"
import { parseSchemaOrThrow } from "@/shared/api/http/parse-schema"
import {
  imageUploadResponseSchema,
  imageBulkUploadResponseSchema,
  fileUploadResponseSchema,
  fileBulkUploadResponseSchema,
  type ImageUploadResult,
  type ImageBulkUploadResult,
  type FileUploadResult,
} from "./media.schema"

export type { ImageUploadResult, ImageBulkUploadResult, FileUploadResult }


export async function uploadImage(file: File): Promise<ImageUploadResult> {
  const path = "/v1/api/image/upload"
  const method = "POST"
  const formData = new FormData()
  formData.append("file", file)
  const response = await clientFetch<unknown, FormData>({ path, method, body: formData })
  const parsed = parseSchemaOrThrow(imageUploadResponseSchema, response, {
    path,
    method,
    message: "Invalid image upload response payload",
  })
  return parsed.data
}

export async function uploadImages(files: File[]): Promise<ImageBulkUploadResult> {
  const path = "/v1/api/image/upload/bulk"
  const method = "POST"
  const formData = new FormData()
  files.forEach((file) => formData.append("files", file))
  const response = await clientFetch<unknown, FormData>({ path, method, body: formData })
  const parsed = parseSchemaOrThrow(imageBulkUploadResponseSchema, response, {
    path,
    method,
    message: "Invalid bulk image upload response payload",
  })
  return parsed.data
}

export async function uploadPdf(file: File): Promise<FileUploadResult> {
  const path = "/v1/api/file/upload/pdf"
  const method = "POST"
  const formData = new FormData()
  formData.append("file", file)
  const response = await clientFetch<unknown, FormData>({ path, method, body: formData })
  const parsed = parseSchemaOrThrow(fileUploadResponseSchema, response, {
    path,
    method,
    message: "Invalid PDF upload response payload",
  })
  return parsed.data
}

export async function uploadPdfs(files: File[]): Promise<FileUploadResult[]> {
  const path = "/v1/api/file/upload/pdf/bulk"
  const method = "POST"
  const formData = new FormData()
  files.forEach((file) => formData.append("files", file))
  const response = await clientFetch<unknown, FormData>({ path, method, body: formData })
  const parsed = parseSchemaOrThrow(fileBulkUploadResponseSchema, response, {
    path,
    method,
    message: "Invalid bulk PDF upload response payload",
  })
  return parsed.data
}
