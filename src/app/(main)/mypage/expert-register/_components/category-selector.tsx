"use client"

import { useState } from "react"
import { ChevronDown, X } from "lucide-react"
import { Text } from "@/shared/ui/text"
import { Badge } from "@/shared/ui/badge"
import { cn } from "@/shared/lib/utils"
import { useCategoryListQuery } from "@/features/category/browse/model/use-category-list-query"

type CategorySelectorProps = {
  selectedIds: number[]
  onChange: (ids: number[]) => void
  maxCount?: number
  error?: string
}

export function CategorySelector({
  selectedIds,
  onChange,
  maxCount = 3,
  error,
}: CategorySelectorProps) {
  const { data: categories = [] } = useCategoryListQuery()
  const [expandedGroupId, setExpandedGroupId] = useState<number | null>(null)

  const handleToggle = (subCategoryId: number) => {
    if (selectedIds.includes(subCategoryId)) {
      onChange(selectedIds.filter((id) => id !== subCategoryId))
    } else if (selectedIds.length < maxCount) {
      onChange([...selectedIds, subCategoryId])
    }
  }

  const handleRemove = (subCategoryId: number) => {
    onChange(selectedIds.filter((id) => id !== subCategoryId))
  }

  // 선택된 서브카테고리 이름 조회
  const getSubCategoryName = (id: number) => {
    for (const cat of categories) {
      const sub = cat.subCategories.find((s) => s.id === id)
      if (sub) return sub.name
    }
    return ""
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Text as="label" typography="body3-medium">
          카테고리 <span className="text-destructive">*</span>
        </Text>
        <Text as="span" typography="caption2-medium" className="text-muted-foreground">
          {selectedIds.length}/{maxCount}
        </Text>
      </div>

      {/* 선택된 카테고리 뱃지 */}
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedIds.map((id) => (
            <Badge key={id} variant="secondary" className="gap-1 pr-1">
              {getSubCategoryName(id)}
              <button
                type="button"
                onClick={() => handleRemove(id)}
                className="rounded-full p-0.5 hover:bg-foreground/10"
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* 카테고리 그룹 */}
      <div className="rounded-md border">
        {categories.map((category) => {
          const isExpanded = expandedGroupId === category.id

          return (
            <div key={category.id} className="border-b last:border-b-0">
              <button
                type="button"
                onClick={() => setExpandedGroupId(isExpanded ? null : category.id)}
                className="flex w-full items-center justify-between px-3 py-2.5 text-left hover:bg-muted/50"
              >
                <Text as="span" typography="body3-medium">
                  {category.name}
                </Text>
                <ChevronDown
                  className={cn(
                    "size-4 text-muted-foreground transition-transform",
                    isExpanded && "rotate-180",
                  )}
                />
              </button>

              {isExpanded && (
                <div className="flex flex-wrap gap-1.5 px-3 pb-3">
                  {category.subCategories.map((sub) => {
                    const isSelected = selectedIds.includes(sub.id)
                    const isDisabled = !isSelected && selectedIds.length >= maxCount

                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => handleToggle(sub.id)}
                        disabled={isDisabled}
                        className={cn(
                          "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                          isSelected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background text-muted-foreground hover:bg-muted",
                          isDisabled && "cursor-not-allowed opacity-40",
                        )}
                      >
                        {sub.name}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {error && (
        <Text as="p" typography="caption2-medium" className="text-destructive">
          {error}
        </Text>
      )}
    </div>
  )
}
