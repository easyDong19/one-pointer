import Link from "next/link"
import { Text } from "@/shared/ui/text"
import type { Category } from "@/entities/category/api/category.schema"

/**
 * 대분류 카테고리만 표시 (스크린샷 기준: 스포츠, 음악, IT, 디자인, 과외 등)
 * 모바일: 4열 그리드 / 데스크탑: 대분류 카드 가로 나열
 */

const CATEGORY_ICONS: Record<string, string> = {
  스포츠: "🏃",
  음악: "🎵",
  IT: "💻",
  디자인: "🎨",
  과외: "📚",
  // 향후 확장
  "취미/자기개발": "✨",
  "외주/의뢰": "📋",
  "커리어/취업": "💼",
  "교육/과외": "📖",
}

type HomeCategoryGridProps = {
  categories: Category[]
}

export function HomeCategoryGrid({ categories }: HomeCategoryGridProps) {
  if (categories.length === 0) return null

  return (
    <section className="flex flex-col gap-4">
      <Text as="h2" typography="subtitle1-bold" className="text-foreground">
        카테고리
      </Text>

      {/* 모바일: 대분류만 4열 그리드 (스크린샷 기준) */}
      {/* 데스크탑: 대분류 카드 + 중분류 태그 노출 */}
      <div className="rounded-2xl border border-border bg-card p-4 md:p-6 lg:p-8">
        {/* 모바일 뷰: 대분류 아이콘 그리드 */}
        <div className="grid grid-cols-4 gap-y-5 md:hidden">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/experts?majorCategoryId=${cat.id}`}
              className="flex flex-col items-center gap-2"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-light">
                <span className="text-2xl">
                  {CATEGORY_ICONS[cat.name] ?? "📌"}
                </span>
              </div>
              <Text as="span" typography="caption1-medium" className="text-foreground">
                {cat.name}
              </Text>
            </Link>
          ))}
        </div>

        {/* 데스크탑 뷰: 대분류 카드 + 중분류 태그 */}
        <div className="hidden gap-4 md:grid md:grid-cols-3 lg:grid-cols-5">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex flex-col gap-3 rounded-2xl border border-border/50 bg-background p-5 transition-shadow hover:shadow-md"
            >
              {/* 대분류 헤더 */}
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-light">
                  <span className="text-xl">{CATEGORY_ICONS[cat.name] ?? "📌"}</span>
                </div>
                <Text as="h3" typography="body2-bold" className="text-foreground">
                  {cat.name}
                </Text>
              </div>

              {/* 중분류 태그들 */}
              <div className="flex flex-wrap gap-1.5">
                {cat.subCategories.map((sub) => (
                  <Link
                    key={sub.id}
                    href={`/experts?subCategoryId=${sub.id}`}
                    className="rounded-lg bg-muted px-2.5 py-1 transition-colors hover:bg-primary-light hover:text-primary"
                  >
                    <Text as="span" typography="caption2-medium" className="text-muted-foreground">
                      {sub.name}
                    </Text>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
