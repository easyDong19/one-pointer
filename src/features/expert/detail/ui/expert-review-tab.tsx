import type { ExpertDetail } from "@/entities/expert/api/expert.schema"
import { ExpertReviewsList } from "@/features/review/expert-list/ui/expert-reviews-list"

/**
 * 전문가 프로필 리뷰 탭.
 * 리뷰 카드 클릭 → /reviews/{id} (공개 리뷰 상세 페이지).
 */
export function ExpertReviewTab({ expert }: { expert: ExpertDetail }) {
  return (
    <div className="px-4 py-6 lg:px-0">
      <ExpertReviewsList
        expertProfileId={expert.expertProfileId}
        reviewCount={expert.reviewSummary?.reviewCount ?? 0}
      />
    </div>
  )
}
