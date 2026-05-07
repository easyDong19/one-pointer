"use client"

import { useMutation, useQueryClient, type InfiniteData } from "@tanstack/react-query"

import { readNotification } from "@/entities/notification/api/notification.service"
import type { Notification } from "@/entities/notification/api/notification.schema"
import { notificationQueryKeys } from "@/entities/notification/model/notification.query-keys"

type ListPage = { content: Notification[]; nextCursor: string | null; hasNext: boolean }

export function useReadNotification() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (notificationId: number) => readNotification(notificationId),
    onMutate: async (notificationId) => {
      await qc.cancelQueries({ queryKey: notificationQueryKeys.lists })

      qc.setQueriesData<InfiniteData<ListPage>>(
        { queryKey: notificationQueryKeys.lists },
        (old) => {
          if (!old) return old
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              content: page.content.map((n) =>
                n.id === notificationId ? { ...n, isRead: true } : n,
              ),
            })),
          }
        },
      )
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: notificationQueryKeys.unreadCount })
    },
  })
}
