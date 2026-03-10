import Link from "next/link"
import { Star, User } from "lucide-react"
import { Text } from "@/shared/ui/text"
import type { ExpertSummary, PopularExpertItem } from "@/entities/expert/api/expert.schema"

/** @deprecated ExpertSummary 사용 권장 */
type HomePopularExpertsProps = {
  experts: ExpertSummary[]
}

const ACTIVITY_METHOD_LABEL: Record<string, string> = {
  OFFLINE: "오프라인",
  ONLINE: "온라인",
  BOTH: "온·오프라인",
}

/** 지역 중복 제거 */
function uniqueRegions(regions: string[] | undefined): string[] {
  if (!regions || regions.length === 0) return []
  return [...new Set(regions)]
}

export function HomePopularExperts({ experts }: HomePopularExpertsProps) {
  if (experts.length === 0) return null

  const displayExperts = experts.slice(0, 8)

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🔥</span>
          <Text as="h2" typography="subtitle1-bold" className="text-foreground">
            인기 전문가
          </Text>
        </div>
        <Link href="/experts" className="hidden md:block">
          <Text as="span" typography="body3-medium" className="text-primary hover:underline">
            전체보기 &rarr;
          </Text>
        </Link>
      </div>

      {/* 모바일: 가로 스크롤 캐러셀 */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none md:hidden">
        {displayExperts.map((expert) => (
          <ExpertCard key={expert.expertProfileId} expert={expert} className="w-[160px] shrink-0" />
        ))}
      </div>

      {/* 데스크탑: 그리드 */}
      <div className="hidden gap-3 md:grid md:grid-cols-3 lg:grid-cols-4">
        {displayExperts.map((expert) => (
          <ExpertCard key={expert.expertProfileId} expert={expert} />
        ))}
      </div>
    </section>
  )
}

function ExpertCard({
  expert,
  className = "",
}: {
  expert: ExpertSummary
  className?: string
}) {
  const regions = uniqueRegions(expert.regions)

  return (
    <Link
      href={`/experts/${expert.expertProfileId}`}
      className={`group flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary/20 hover:shadow-md ${className}`}
    >
      {/* 프로필 */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted md:h-12 md:w-12">
          {expert.profileImageUrl ? (
            <img
              src={expert.profileImageUrl}
              alt={expert.nickname}
              className="h-full w-full object-cover"
            />
          ) : (
            <User className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
        <Text as="span" typography="body2-bold" className="text-foreground line-clamp-1">
          {expert.nickname}
        </Text>
      </div>

      {/* 카테고리 태그 */}
      {expert.categoryNames && expert.categoryNames.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {expert.categoryNames.map((name) => (
            <span key={name} className="rounded-md bg-primary-light px-2 py-0.5">
              <Text as="span" typography="caption2-medium" className="text-primary">
                {name}
              </Text>
            </span>
          ))}
        </div>
      ) : null}

      {/* 별점 */}
      <div className="flex items-center gap-1">
        <Star className="h-3.5 w-3.5 fill-warning text-warning" />
        <Text as="span" typography="body3-bold" className="text-foreground">
          {expert.averageRating != null ? expert.averageRating.toFixed(1) : "-"}
        </Text>
        {expert.reviewCount != null && expert.reviewCount > 0 ? (
          <Text as="span" typography="caption1-medium" className="text-muted-foreground">
            ({expert.reviewCount})
          </Text>
        ) : null}
      </div>

      {/* 활동방식 & 지역 */}
      <div className="flex flex-wrap gap-1">
        <span className="rounded-md bg-muted px-2 py-0.5">
          <Text as="span" typography="caption2-medium" className="text-muted-foreground">
            {ACTIVITY_METHOD_LABEL[expert.activityMethod] ?? expert.activityMethod}
          </Text>
        </span>
        {regions.slice(0, 1).map((region) => (
          <span key={region} className="rounded-md bg-muted px-2 py-0.5">
            <Text as="span" typography="caption2-medium" className="text-muted-foreground">
              {region}
            </Text>
          </span>
        ))}
      </div>
    </Link>
  )
}
