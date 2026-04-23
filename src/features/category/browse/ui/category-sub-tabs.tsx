import { cn } from "@/shared/lib/utils"
import { Text } from "@/shared/ui/text"
import type { SubCategory } from "@/entities/category/api/category.schema"

export function CategorySubTabs({
  subCategories,
  activeSubCategoryId,
  onSubCategoryChange,
}: {
  subCategories: (SubCategory & { isAll: boolean })[]
  activeSubCategoryId: number | undefined
  onSubCategoryChange: (id: number | undefined) => void
}) {
  return (
    <div className="border-border/50 border-b">
      <div className="scrollbar-none mx-auto flex max-w-3xl gap-0 overflow-x-auto lg:max-w-5xl">
        {subCategories.map((sc) => {
          const isActive = sc.isAll
            ? activeSubCategoryId === undefined
            : activeSubCategoryId === sc.id
          return (
            <button
              key={sc.id}
              onClick={() => onSubCategoryChange(sc.isAll ? undefined : sc.id)}
              className={cn(
                "shrink-0 px-5 py-2.5 transition-colors",
                isActive
                  ? "border-foreground text-foreground border-b-2 font-semibold"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Text as="span" typography="body3-medium">
                {sc.name}
              </Text>
            </button>
          )
        })}
      </div>
    </div>
  )
}
