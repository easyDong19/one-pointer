"use client"

import { useInfiniteQuery } from "@tanstack/react-query"

import { getNotifications } from "@/entities/notification/api/notification.service"
import { notificationQueryKeys } from "@/entities/notification/model/notification.query-keys"

const PAGE_SIZE = 20

export function useNotificationsQuery(enabled = true) {
  return useInfiniteQuery({
    queryKey: notificationQueryKeys.list({ size: PAGE_SIZE }),
    queryFn: ({ pageParam }) =>
      getNotifications({
        cursor: pageParam ?? undefined,
        size: PAGE_SIZE,
      }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? lastPage.nextCursor : undefined,
    enabled,
  })
}
