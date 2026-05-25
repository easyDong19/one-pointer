"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { BellOff, Loader2 } from "lucide-react"

import type { Notification } from "@/entities/notification/api/notification.schema"
import { useAuthStore } from "@/entities/auth/model/auth-store"
import { Text } from "@/shared/ui/text"
import { openConfirm } from "@/shared/lib/open-confirm-dialog"

import { matchesNotificationTab, type NotificationFilterTab } from "../lib/notification-filter"
import { resolveNotificationHref } from "../lib/notification-navigation"
import { useNotificationsQuery } from "../model/use-notifications-query"
import { useReadNotification } from "../model/use-read-notification"
import { useReadAllNotifications } from "../model/use-read-all-notifications"
import { useDeleteNotification } from "../model/use-delete-notification"
import { NotificationFilterTabs } from "./notification-filter-tabs"
import { NotificationList } from "./notification-list"

export function NotificationListContent() {
  const router = useRouter()
  const isAuthed = useAuthStore((s) => s.status === "authenticated")

  const [activeTab, setActiveTab] = useState<NotificationFilterTab>("ALL")

  const { data, isLoading, isError, refetch, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useNotificationsQuery(isAuthed)

  const readMutation = useReadNotification()
  const readAllMutation = useReadAllNotifications()
  const deleteMutation = useDeleteNotification()

  const allNotifications = useMemo(() => data?.pages.flatMap((p) => p.content) ?? [], [data])

  const filtered = useMemo(
    () => allNotifications.filter((n) => matchesNotificationTab(activeTab, n)),
    [allNotifications, activeTab],
  )

  const hasUnread = allNotifications.some((n) => !n.isRead)

  async function handleNavigate(n: Notification) {
    if (!n.isRead) readMutation.mutate(n.id)
    const href = await resolveNotificationHref(n)
    if (href) router.push(href)
  }

  async function handleDelete(n: Notification) {
    const ok = await openConfirm({
      title: "알림을 삭제하시겠습니까?",
      description: "삭제된 알림은 복구할 수 없습니다.",
      confirmLabel: "삭제",
      variant: "destructive",
    })
    if (!ok) return
    deleteMutation.mutate(n.id)
  }

  return (
    <section className="flex flex-col">
      <div className="flex items-center justify-between px-2 pt-4 pb-2">
        <Text as="h2" typography="subtitle1-bold">
          알림
        </Text>
        {hasUnread && (
          <button
            type="button"
            onClick={() => readAllMutation.mutate()}
            disabled={readAllMutation.isPending}
          >
            <Text as="span" typography="caption1-medium" className="text-primary">
              모두 읽음
            </Text>
          </button>
        )}
      </div>

      <NotificationFilterTabs active={activeTab} onChange={setActiveTab} />

      {isLoading ? (
        <div className="flex min-h-[280px] items-center justify-center">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
        </div>
      ) : isError ? (
        <div className="flex min-h-[280px] flex-col items-center justify-center gap-3">
          <Text typography="body2-medium" className="text-muted-foreground">
            알림을 불러오지 못했습니다
          </Text>
          <button
            type="button"
            onClick={() => refetch()}
            className="text-primary text-sm font-medium"
          >
            다시 시도
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex min-h-[280px] flex-col items-center justify-center gap-2 px-4 py-20 text-center">
          <div className="bg-muted mb-2 flex h-14 w-14 items-center justify-center rounded-full">
            <BellOff className="text-muted-foreground size-7" />
          </div>
          <Text typography="body2-medium" className="text-muted-foreground">
            알림이 없습니다
          </Text>
          <Text typography="caption1-medium" className="text-muted-foreground">
            새로운 알림이 오면 여기에서 확인할 수 있어요
          </Text>
        </div>
      ) : (
        <NotificationList
          notifications={filtered}
          hasNextPage={hasNextPage ?? false}
          isFetchingNextPage={isFetchingNextPage}
          fetchNextPage={fetchNextPage}
          onNavigate={handleNavigate}
          onDelete={handleDelete}
        />
      )}
    </section>
  )
}
