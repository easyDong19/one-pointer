export const reviewQueryKeys = {
  all: ["review"] as const,
  detail: (reviewId: number) => ["review", reviewId] as const,
  filtering: (reviewId: number) => ["review", reviewId, "filtering"] as const,
  mySummary: ["review", "my-summary"] as const,
  byExpert: (expertProfileId: number, params?: { cursor?: string; size?: number }) =>
    ["review", "expert", expertProfileId, params] as const,
}
