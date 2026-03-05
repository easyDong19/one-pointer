export const expertQueryKeys = {
  all: ["expert"] as const,
  list: (params?: {
    cursor?: string
    size?: number
    subCategoryId?: number
    activityMethod?: string
    region?: string
    query?: string
  }) => ["expert", "list", params] as const,
  detail: (expertProfileId: number) => ["expert", expertProfileId] as const,
  popular: ["expert", "popular"] as const,
}
