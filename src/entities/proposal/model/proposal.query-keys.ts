export const proposalQueryKeys = {
  all: ["proposal"] as const,
  detail: (id: number) => ["proposal", id] as const,
  byTicket: (ticketId: number, params?: { cursor?: string; size?: number }) =>
    ["proposal", "ticket", ticketId, params] as const,
  myDetail: (id: number) => ["proposal", "my", id] as const,
  myInProgress: (params?: { cursor?: string; size?: number }) =>
    ["proposal", "my", "in-progress", params] as const,
  myCompleted: (params?: { cursor?: string; size?: number }) =>
    ["proposal", "my", "completed", params] as const,
}
