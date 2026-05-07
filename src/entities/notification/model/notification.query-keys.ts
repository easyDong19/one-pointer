export const notificationQueryKeys = {
  all: ["notification"] as const,
  lists: ["notification", "list"] as const,
  list: (params?: { cursor?: string; size?: number }) =>
    ["notification", "list", params] as const,
  unreadCount: ["notification", "unread-count"] as const,
}
