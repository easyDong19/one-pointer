"use client"

import { cn } from "@/shared/lib/utils"
import { Text } from "@/shared/ui/text"

type Props = {
  categoryName: string
  mainTab: "tickets" | "experts"
  onMainTabChange: (tab: "tickets" | "experts") => void
  subCategories: Array<{ id: number; name: string; isAll: boolean }>
  activeSubCategoryId: number | undefined
  onSubCategoryChange: (id: number | undefined) => void
}

const MAIN_TABS = [
  { value: "tickets", label: "의뢰" },
  { value: "experts", label: "전문가" },
] as const

/**
 * 데스크탑 전용 카테고리 사이드바.
 *
 * - 상단: 카테고리 제목
 * - 중단: 의뢰 / 전문가 세그먼트 토글 (pill 스타일)
 * - 하단: 서브카테고리 세로 리스트 (active: bg-muted + foreground)
 *
 * sticky 포지셔닝은 부모 레이아웃에서 부여한다.
 */
export function CategoryDesktopSidebar({
  categoryName,
  mainTab,
  onMainTabChange,
  subCategories,
  activeSubCategoryId,
  onSubCategoryChange,
}: Props) {
  return (
    <nav aria-label="카테고리 필터" className="flex w-full flex-col gap-4">
      {/* Title */}
      <div className="flex flex-col gap-1 px-1">
        <Text as="span" typography="caption1-medium" className="text-muted-foreground">
          카테고리
        </Text>
        <Text as="h2" typography="body1-bold" className="text-foreground">
          {categoryName}
        </Text>
      </div>

      {/* Segmented tab */}
      <div
        role="tablist"
        aria-label="의뢰 또는 전문가 선택"
        className="bg-muted flex gap-1 rounded-lg p-1"
      >
        {MAIN_TABS.map((t) => {
          const isActive = mainTab === t.value
          return (
            <button
              key={t.value}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onMainTabChange(t.value)}
              className={cn(
                "flex-1 rounded-md px-3 py-2 transition-all outline-none",
                "focus-visible:ring-ring/50 focus-visible:ring-2",
                isActive
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Text as="span" typography={isActive ? "body3-bold" : "body3-medium"}>
                {t.label}
              </Text>
            </button>
          )
        })}
      </div>

      {/* Separator */}
      <div className="border-border/50 border-t" />

      {/* Subcategory list */}
      <ul className="flex flex-col gap-0.5">
        {subCategories.map((sc) => {
          const isActive = sc.isAll
            ? activeSubCategoryId === undefined
            : activeSubCategoryId === sc.id
          return (
            <li key={sc.id}>
              <button
                type="button"
                onClick={() => onSubCategoryChange(sc.isAll ? undefined : sc.id)}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex w-full items-center rounded-md px-3 py-2.5 text-left transition-colors outline-none",
                  "focus-visible:ring-ring/50 focus-visible:ring-2",
                  isActive
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                )}
              >
                <Text
                  as="span"
                  typography={isActive ? "body3-bold" : "body3-medium"}
                  className="truncate"
                >
                  {sc.name}
                </Text>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
