import { clientFetch } from "@/shared/api/http/client-fetch"
import { parseSchemaOrThrow } from "@/shared/api/http/parse-schema"
import {
  notificationListResponseSchema,
  unreadCountResponseSchema,
  type Notification,
} from "./notification.schema"

export type { Notification }


export async function getNotifications(params?: {
  cursor?: string
  size?: number
}): Promise<{ content: Notification[]; nextCursor: string | null; hasNext: boolean }> {
  const path = "/v1/api/notification"
  const method = "GET"
  const response = await clientFetch<unknown>({ path, method, query: params })
  const parsed = parseSchemaOrThrow(notificationListResponseSchema, response, {
    path,
    method,
    message: "Invalid notifications response payload",
  })
  return parsed.data
}

export async function getUnreadNotificationCount(): Promise<number> {
  const path = "/v1/api/notification/unread-count"
  const method = "GET"
  const response = await clientFetch<unknown>({ path, method })
  const parsed = parseSchemaOrThrow(unreadCountResponseSchema, response, {
    path,
    method,
    message: "Invalid unread count response payload",
  })
  return parsed.data
}

export async function readNotification(notificationId: number): Promise<void> {
  const path = `/v1/api/notification/${notificationId}/read`
  const method = "PATCH"
  await clientFetch<unknown>({ path, method })
}

export async function readAllNotifications(): Promise<void> {
  const path = "/v1/api/notification/read-all"
  const method = "PATCH"
  await clientFetch<unknown>({ path, method })
}

export async function deleteNotification(notificationId: number): Promise<void> {
  const path = `/v1/api/notification/${notificationId}`
  const method = "DELETE"
  await clientFetch<unknown>({ path, method })
}
