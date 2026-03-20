import { MessageSquareText } from "lucide-react"
import { Text } from "@/shared/ui/text"
import type { ExpertDetail } from "@/entities/expert/api/expert.schema"

/**
 * 리뷰 탭 — 껍데기만 구현.
 * 추후 Review API 연동 시 상세 구현 예정.
 */
export function ExpertReviewTab({ expert }: { expert: ExpertDetail }) {
  const reviewCount = expert.reviewSummary?.reviewCount ?? 0

  if (reviewCount === 0) {
    return (
      <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 py-12">
        <MessageSquareText className="text-muted-foreground/40" size={48} />
        <Text as="p" typography="body2-regular" className="text-muted-foreground">
          등록된 리뷰가 없습니다
        </Text>
      </div>
    )
  }

  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 px-4 py-12 lg:px-0">
      <MessageSquareText className="text-muted-foreground/40" size={48} />
      <Text as="p" typography="body2-regular" className="text-muted-foreground">
        리뷰 {reviewCount}개가 있습니다
      </Text>
      <Text as="p" typography="caption1-medium" className="text-muted-foreground">
        준비 중입니다
      </Text>
    </div>
  )
}
