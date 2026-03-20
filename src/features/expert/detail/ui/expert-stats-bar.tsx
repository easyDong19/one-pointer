import { Star } from "lucide-react"
import { Text } from "@/shared/ui/text"
import type { ExpertDetail } from "@/entities/expert/api/expert.schema"

export function ExpertStatsBar({ expert }: { expert: ExpertDetail }) {
  const summary = expert.reviewSummary

  return (
    <div className="border-border flex items-center divide-x border-y py-4">
      {/* 리뷰 평점 */}
      <div className="flex flex-1 flex-col items-center gap-1">
        <Text as="span" typography="caption1-medium" className="text-muted-foreground">
          리뷰 평점
        </Text>
        <div className="flex items-center gap-1">
          <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
          <Text as="span" typography="subtitle1-bold" className="text-foreground">
            {summary?.averageRating?.toFixed(1) ?? "-"}
          </Text>
        </div>
      </div>

      {/* 리뷰 */}
      <div className="flex flex-1 flex-col items-center gap-1">
        <Text as="span" typography="caption1-medium" className="text-muted-foreground">
          리뷰
        </Text>
        <Text as="span" typography="subtitle1-bold" className="text-foreground">
          {summary?.reviewCount ?? 0}개
        </Text>
      </div>

      {/* 매칭 */}
      <div className="flex flex-1 flex-col items-center gap-1">
        <Text as="span" typography="caption1-medium" className="text-muted-foreground">
          매칭
        </Text>
        <Text as="span" typography="subtitle1-bold" className="text-foreground">
          {summary?.totalMatchCount ?? 0}회
        </Text>
      </div>
    </div>
  )
}
