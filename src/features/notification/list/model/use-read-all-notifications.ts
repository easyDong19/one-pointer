"use client"

import { useMutation, useQueryClient, type InfiniteData } from "@tanstack/react-query"

import { readAllNotifications } from "@/entities/notification/api/notification.service"
import type { Notification } from "@/entities/notification/api/notification.schema"
import { notificationQueryKeys } from "@/entities/notification/model/notification.query-keys"

type ListPage = { content: Notification[]; nextCursor: string | null; hasNext: boolean }

export function useReadAllNotifications() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: readAllNotifications,
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: notificationQueryKeys.lists })

      qc.setQueriesData<InfiniteData<ListPage>>(
        { queryKey: notificationQueryKeys.lists },
        (old) => {
          if (!old) return old
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              content: page.content.map((n) => ({ ...n, isRead: true })),
            })),
          }
        },
      )

      qc.setQueryData(notificationQueryKeys.unreadCount, 0)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: notificationQueryKeys.unreadCount })
    },
  })
}
