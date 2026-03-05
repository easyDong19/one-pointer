export const deliveryQueryKeys = {
  all: ["delivery"] as const,
  byTicket: (ticketId: number) => ["delivery", "ticket", ticketId] as const,
}
