import Link from "next/link"
import { Text } from "@/shared/ui/text"
import type { Category } from "@/entities/category/api/category.schema"

/**
 * 홈 대분류 카테고리 그리드
 * 모바일/데스크탑 동일: 아이콘 + 텍스트 (중분류는 상세 페이지에서 노출)
 */

/** API iconUrl이 없을 때 fallback 이모지 */
const CATEGORY_FALLBACK_ICONS: Record<string, string> = {
  스포츠: "🏃",
  음악: "🎵",
  IT: "💻",
  디자인: "🎨",
  과외: "📚",
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
    <section className="gap-op-lg flex flex-col">
      <Text as="h2" typography="subtitle1-bold" className="text-foreground">
        카테고리
      </Text>

      <div className="border-border bg-card px-op-lg py-op-xl rounded-2xl border">
        <div className="gap-x-op-sm gap-y-op-xl grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${encodeURIComponent(cat.name)}`}
              className="gap-op-sm flex flex-col items-center"
            >
              <div className="bg-muted flex h-14 w-14 items-center justify-center rounded-2xl">
                {cat.iconUrl ? (
                  <img src={cat.iconUrl} alt={cat.name} className="h-8 w-8 object-contain" />
                ) : (
                  <span className="text-2xl">{CATEGORY_FALLBACK_ICONS[cat.name] ?? "📌"}</span>
                )}
              </div>
              <Text as="span" typography="caption1-medium" className="text-foreground">
                {cat.name}
              </Text>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
