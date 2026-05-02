import type { Metadata } from "next"

import { MyReviewsContent } from "@/features/review/my-list/ui/my-reviews-content"

export const metadata: Metadata = {
  title: "리뷰 관리",
}

export default function MyReviewsPage() {
  return <MyReviewsContent />
}
