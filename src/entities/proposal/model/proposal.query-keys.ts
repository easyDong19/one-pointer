export const proposalQueryKeys = {
  all: ["proposal"] as const,
  detail: (id: number) => ["proposal", id] as const,
  byTicket: (ticketId: number) => ["proposal", "ticket", ticketId] as const,
  myDetail: (id: number) => ["proposal", "my", id] as const,
  myInProgress: (params?: { cursor?: string | number; size?: number }) =>
    ["proposal", "my", "in-progress", params] as const,
  myCompleted: (params?: { cursor?: string | number; size?: number }) =>
    ["proposal", "my", "completed", params] as const,
}
