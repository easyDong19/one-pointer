export const agreementQueryKeys = {
  all: ["agreement"] as const,
  byTicket: (ticketId: number) => ["agreement", "ticket", ticketId] as const,
}
