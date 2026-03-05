export const ticketQueryKeys = {
  all: ["ticket"] as const,
  detail: (id: number) => ["ticket", id] as const,
  feed: (params?: { cursor?: string; size?: number; subCategoryId?: number }) =>
    ["ticket", "feed", params] as const,
  search: (query: string, params?: { cursor?: string; size?: number }) =>
    ["ticket", "search", query, params] as const,
  my: (params?: { cursor?: string; size?: number }) => ["ticket", "my", params] as const,
  myInProgress: (params?: { cursor?: string; size?: number }) =>
    ["ticket", "my", "in-progress", params] as const,
  myCompleted: (params?: { cursor?: string; size?: number }) =>
    ["ticket", "my", "completed", params] as const,
  directRequestSent: (params?: { cursor?: string; size?: number }) =>
    ["ticket", "direct-request", "sent", params] as const,
  directRequestReceived: (params?: { cursor?: string; size?: number }) =>
    ["ticket", "direct-request", "received", params] as const,
}
