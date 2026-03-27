export const userQueryKeys = {
  all: ["user"] as const,
  me: ["user", "me"] as const,
  expertProfile: (id: number) => ["user", "expert", id] as const,
  myExpertProfile: ["user", "expert", "me"] as const,
  expertExists: ["user", "expert", "exists"] as const,
  expertEarnings: (params?: { period?: string; startDate?: string; endDate?: string }) =>
    ["user", "expert", "earnings", params] as const,
  expertTransactions: (params?: { status?: string }) =>
    ["user", "expert", "transactions", params] as const,
  expertDashboard: ["user", "expert", "dashboard"] as const,
  clientDashboard: ["user", "client", "dashboard"] as const,
  myReviews: (cursor?: string) => ["user", "reviews", cursor] as const,
  myReviewSummary: ["user", "reviews", "summary"] as const,
  directRequests: (cursor?: string) => ["user", "direct-requests", cursor] as const,
}
