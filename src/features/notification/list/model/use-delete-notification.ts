"use client"

import { useMutation, useQueryClient, type InfiniteData } from "@tanstack/react-query"

import { deleteNotification } from "@/entities/notification/api/notification.service"
import type { Notification } from "@/entities/notification/api/notification.schema"
import { notificationQueryKeys } from "@/entities/notification/model/notification.query-keys"

type ListPage = { content: Notification[]; nextCursor: string | null; hasNext: boolean }

export function useDeleteNotification() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (notificationId: number) => deleteNotification(notificationId),
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
              content: page.content.filter((n) => n.id !== notificationId),
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
