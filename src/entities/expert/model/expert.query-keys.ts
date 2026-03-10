import type { ExpertListParams } from "../api/expert.schema"

export const expertQueryKeys = {
  all: ["expert"] as const,
  list: (params?: ExpertListParams) => ["expert", "list", params] as const,
  detail: (expertProfileId: number) => ["expert", expertProfileId] as const,
  popular: ["expert", "popular"] as const,
  popularBySubCategory: (subCategoryId: number) =>
    ["expert", "popular", "subcategory", subCategoryId] as const,
}
