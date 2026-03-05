export const userQueryKeys = {
  all: ["user"] as const,
  me: ["user", "me"] as const,
  expertProfile: (id: number) => ["user", "expert", id] as const,
  myExpertProfile: ["user", "expert", "me"] as const,
  expertExists: ["user", "expert", "exists"] as const,
  expertEarnings: ["user", "expert", "earnings"] as const,
  expertTransactions: (params?: { cursor?: string; size?: number }) =>
    ["user", "expert", "transactions", params] as const,
  expertDashboard: ["user", "expert", "dashboard"] as const,
  clientDashboard: ["user", "client", "dashboard"] as const,
}
