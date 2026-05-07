"use client"

import { useQuery } from "@tanstack/react-query"

import { getUnreadNotificationCount } from "@/entities/notification/api/notification.service"
import { notificationQueryKeys } from "@/entities/notification/model/notification.query-keys"

export function useUnreadCountQuery(enabled = true) {
  return useQuery({
    queryKey: notificationQueryKeys.unreadCount,
    queryFn: getUnreadNotificationCount,
    refetchInterval: 60_000,
    enabled,
  })
}
