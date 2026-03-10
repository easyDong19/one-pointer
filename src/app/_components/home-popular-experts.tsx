import Link from "next/link"
import { Star, User } from "lucide-react"
import { Text } from "@/shared/ui/text"
import type { ExpertSummary } from "@/entities/expert/api/expert.schema"

type HomePopularExpertsProps = {
  experts: ExpertSummary[]
}

const ACTIVITY_METHOD_LABEL: Record<string, string> = {
  OFFLINE: "오프라인",
  ONLINE: "온라인",
  BOTH: "온·오프라인",
}

function uniqueRegions(regions: string[] | undefined): string[] {
  if (!regions || regions.length === 0) return []
  return [...new Set(regions)]
}

export function HomePopularExperts({ experts }: HomePopularExpertsProps) {
  if (experts.length === 0) return null

  const displayExperts = experts.slice(0, 8)

  return (
    <section className="flex flex-col gap-op-lg">
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

      {/* 모바일: 가로 스크롤 */}
      <div className="-mx-5 px-5 md:mx-0 md:px-0">
        <div className="flex gap-op-md overflow-x-auto pb-2 scrollbar-none md:hidden">
          {displayExperts.map((expert) => (
            <ExpertCard key={expert.expertProfileId} expert={expert} className="w-[170px] shrink-0" />
          ))}
        </div>
      </div>

      {/* 데스크탑: 그리드 */}
      <div className="hidden gap-op-md md:grid md:grid-cols-3 lg:grid-cols-4">
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
      className={`border-border bg-card group flex flex-col gap-op-md rounded-2xl border p-op-lg transition-shadow hover:shadow-md ${className}`}
    >
      {/* 프로필 */}
      <div className="flex items-center gap-op-md">
        <div className="bg-muted flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full">
          {expert.profileImageUrl ? (
            <img
              src={expert.profileImageUrl}
              alt={expert.nickname}
              className="h-full w-full object-cover"
            />
          ) : (
            <User className="text-muted-foreground h-5 w-5" />
          )}
        </div>
        <Text as="span" typography="body2-bold" className="text-foreground line-clamp-1">
          {expert.nickname}
        </Text>
      </div>

      {/* 카테고리 태그 */}
      {expert.categoryNames.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {expert.categoryNames.slice(0, 2).map((name) => (
            <span key={name} className="bg-primary-light rounded-md px-2 py-0.5">
              <Text as="span" typography="caption2-medium" className="text-primary">
                {name}
              </Text>
            </span>
          ))}
        </div>
      )}

      {/* 별점 */}
      <div className="flex items-center gap-1">
        <Star className="fill-warning text-warning h-3.5 w-3.5" />
        <Text as="span" typography="body3-bold" className="text-foreground">
          {expert.averageRating != null ? expert.averageRating.toFixed(1) : "-"}
        </Text>
        {expert.reviewCount != null && expert.reviewCount > 0 && (
          <Text as="span" typography="caption1-medium" className="text-muted-foreground">
            ({expert.reviewCount})
          </Text>
        )}
      </div>

      {/* 활동방식 & 지역 */}
      <div className="flex flex-wrap gap-1">
        <span className="bg-muted rounded-md px-2 py-0.5">
          <Text as="span" typography="caption2-medium" className="text-muted-foreground">
            {ACTIVITY_METHOD_LABEL[expert.activityMethod] ?? expert.activityMethod}
          </Text>
        </span>
        {regions.slice(0, 1).map((region) => (
          <span key={region} className="bg-muted rounded-md px-2 py-0.5">
            <Text as="span" typography="caption2-medium" className="text-muted-foreground">
              {region}
            </Text>
          </span>
        ))}
      </div>
    </Link>
  )
}
