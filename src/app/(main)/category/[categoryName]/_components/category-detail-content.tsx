"use client"

import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Text } from "@/shared/ui/text"
import { useCategoryDetail } from "@/features/category/browse/model/use-category-detail"
import { CategoryMobileLayout } from "@/features/category/browse/ui/category-mobile-layout"
import { CategoryDesktopLayout } from "@/features/category/browse/ui/category-desktop-layout"

/**
 * `/category/[categoryName]` 본체.
 *
 * - `useCategoryDetail` 을 **단 한 번만** 호출하고, 두 레이아웃에 결과를 공급한다.
 * - 뷰포트 분기는 CSS `hidden`/`block` 기반(`lg` 기준) — SSR mismatch 방지.
 */
export function CategoryDetailContent({ categoryName }: { categoryName: string }) {
  const router = useRouter()
  const detail = useCategoryDetail(categoryName)
  const { category, isCategoryLoading } = detail

  if (isCategoryLoading) {
    return (
      <div className="bg-background flex min-h-dvh items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!category) {
    return (
      <div className="bg-background flex min-h-dvh flex-col items-center justify-center gap-3">
        <Text as="p" typography="body1-medium" className="text-muted-foreground">
          카테고리를 찾을 수 없습니다
        </Text>
        <button
          onClick={() => router.back()}
          className="text-primary text-sm font-medium underline"
        >
          뒤로가기
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="lg:hidden">
        <CategoryMobileLayout {...detail} category={category} />
      </div>
      <div className="hidden lg:block">
        <CategoryDesktopLayout {...detail} category={category} />
      </div>
    </>
  )
}
