export const earningsQueryKeys = {
  all: ["earnings"] as const,
  summary: (params?: { period?: string; startDate?: string; endDate?: string }) =>
    ["earnings", "summary", params] as const,
  transactions: (params?: { status?: string }) =>
    ["earnings", "transactions", params] as const,
}
