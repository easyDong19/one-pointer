export const disputeQueryKeys = {
  all: ["dispute"] as const,
  detail: (disputeId: number) => ["dispute", disputeId] as const,
  my: (params?: { cursor?: string; size?: number }) => ["dispute", "my", params] as const,
  eligibleTransactions: ["dispute", "eligible-transactions"] as const,
}
