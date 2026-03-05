export const paymentQueryKeys = {
  all: ["payment"] as const,
  escrowByTicket: (ticketId: number) => ["payment", "escrow", "ticket", ticketId] as const,
}
