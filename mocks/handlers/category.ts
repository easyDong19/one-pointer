import { categoryListResponseSchema } from "@/entities/category/api/category.schema"
import { asset } from "../lib/assets"
import { mock } from "../lib/respond"
import { CATEGORIES } from "../world"

export const categoryHandlers = [
  mock("get", "/v1/api/category", categoryListResponseSchema, () =>
    CATEGORIES.map((category) => ({
      id: category.id,
      name: category.name,
      description: category.description,
      iconUrl: asset("icon", `category-${category.id}`, category.emoji),
      subCategories: category.subCategories.map((sub) => ({
        id: sub.id,
        name: sub.name,
        availableType: "BOTH",
      })),
    })),
  ),
]
