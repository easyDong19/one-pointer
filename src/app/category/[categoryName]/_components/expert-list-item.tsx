import Link from "next/link"
import { Star, User, Eye } from "lucide-react"
import { Text } from "@/shared/ui/text"
import type { ExpertSummary } from "@/entities/expert/api/expert.schema"

export function ExpertList({
  experts,
  isLoading,
}: {
  experts: ExpertSummary[]
  isLoading: boolean
}) {
  if (isLoading) {
    return (
      <div className="flex flex-col">
        {Array.from({ length: 5 }).map((_, i) => (
          <ExpertSkeleton key={i} />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {experts.map((expert) => (
        <ExpertListItem key={expert.expertProfileId} expert={expert} />
      ))}
    </div>
  )
}

function ExpertListItem({ expert }: { expert: ExpertSummary }) {
  const regions = [...new Set(expert.regions)]

  return (
    <Link
      href={`/experts/${expert.expertProfileId}`}
      className="border-border/50 hover:bg-muted/30 flex gap-4 border-b px-4 py-4 transition-colors lg:px-6"
    >
      {/* Avatar */}
      <div className="bg-muted flex h-[88px] w-[88px] shrink-0 items-center justify-center overflow-hidden rounded-xl lg:h-[100px] lg:w-[100px]">
        {expert.profileImageUrl ? (
          <img
            src={expert.profileImageUrl}
            alt={expert.nickname}
            className="h-full w-full object-cover"
          />
        ) : (
          <User className="text-muted-foreground/40 h-10 w-10" />
        )}
      </div>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {/* Name */}
        <Text as="h3" typography="body2-bold" className="text-foreground line-clamp-1">
          {expert.nickname}
        </Text>

        {/* Category */}
        {expert.categoryNames.length > 0 && (
          <Text as="span" typography="caption1-medium" className="text-muted-foreground">
            {expert.categoryNames[0]}
          </Text>
        )}

        {/* Introduction */}
        <Text as="p" typography="body3-regular" className="text-foreground line-clamp-1">
          {expert.introduction}
        </Text>

        {/* Rating + Match count */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5">
            <Star className="fill-warning text-warning h-3.5 w-3.5" />
            <Text as="span" typography="body3-bold" className="text-foreground">
              {expert.averageRating != null ? expert.averageRating.toFixed(1) : "-"}
            </Text>
            {expert.reviewCount > 0 && (
              <Text as="span" typography="caption1-medium" className="text-muted-foreground">
                ({expert.reviewCount})
              </Text>
            )}
          </div>
          <div className="flex items-center gap-0.5">
            <Eye className="text-muted-foreground h-3.5 w-3.5" />
            <Text as="span" typography="caption1-medium" className="text-muted-foreground">
              {expert.matchCount}
            </Text>
          </div>

          {/* Region + Career (right side) */}
          <div className="ml-auto flex items-center gap-1">
            {regions.length > 0 && (
              <Text as="span" typography="caption1-medium" className="text-muted-foreground">
                {regions[0]}
              </Text>
            )}
            {regions.length > 0 && expert.careerPeriod && (
              <Text as="span" typography="caption1-medium" className="text-muted-foreground">
                ·
              </Text>
            )}
            {expert.careerPeriod && (
              <Text as="span" typography="caption1-medium" className="text-muted-foreground">
                {expert.careerPeriod}
              </Text>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

function ExpertSkeleton() {
  return (
    <div className="border-border/50 flex gap-4 border-b px-4 py-4 lg:px-6">
      <div className="bg-muted h-[88px] w-[88px] shrink-0 animate-pulse rounded-xl lg:h-[100px] lg:w-[100px]" />
      <div className="flex flex-1 flex-col gap-2">
        <div className="bg-muted h-5 w-28 animate-pulse rounded" />
        <div className="bg-muted h-4 w-16 animate-pulse rounded" />
        <div className="bg-muted h-4 w-full animate-pulse rounded" />
        <div className="bg-muted h-4 w-36 animate-pulse rounded" />
      </div>
    </div>
  )
}
