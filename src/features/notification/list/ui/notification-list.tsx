"use client"

import { useCallback, useRef } from "react"

import type { Notification } from "@/entities/notification/api/notification.schema"

import { NotificationItem } from "./notification-item"

type Props = {
  notifications: ReadonlyArray<Notification>
  hasNextPage: boolean
  isFetchingNextPage: boolean
  fetchNextPage: () => void
  onNavigate: (notification: Notification) => void
  onDelete: (notification: Notification) => void
}

export function NotificationList({
  notifications,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  onNavigate,
  onDelete,
}: Props) {
  const observerRef = useRef<IntersectionObserver | null>(null)
  const sentinelRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (observerRef.current) observerRef.current.disconnect()
      if (!node) return
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      })
      observerRef.current.observe(node)
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage],
  )

  return (
    <ul className="divide-border divide-y">
      {notifications.map((n) => (
        <li key={n.id}>
          <NotificationItem
            notification={n}
            onNavigate={() => onNavigate(n)}
            onDelete={() => onDelete(n)}
          />
        </li>
      ))}
      {hasNextPage && (
        <li>
          <div ref={sentinelRef} className="h-12" aria-hidden />
          {isFetchingNextPage && (
            <div className="flex items-center justify-center py-4">
              <div className="border-primary size-5 animate-spin rounded-full border-2 border-t-transparent" />
            </div>
          )}
        </li>
      )}
    </ul>
  )
}
