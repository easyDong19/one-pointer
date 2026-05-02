export const reviewQueryKeys = {
  all: ["review"] as const,
  detail: (reviewId: number) => ["review", reviewId] as const,
  filtering: (reviewId: number) => ["review", reviewId, "filtering"] as const,
  mySummary: ["review", "my-summary"] as const,
  myList: (params?: { size?: number }) =>
    ["review", "my", "list", params ?? {}] as const,
  byExpert: (expertProfileId: number, params?: { size?: number }) =>
    ["review", "expert", expertProfileId, "list", params ?? {}] as const,
}
