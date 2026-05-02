import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ReviewDetail } from "./_components/review-detail"

type Props = {
  params: Promise<{ reviewId: string }>
}

export const metadata: Metadata = {
  title: "리뷰",
}

export default async function ReviewDetailPage({ params }: Props) {
  const { reviewId } = await params
  const id = Number(reviewId)
  if (!Number.isInteger(id) || id <= 0) notFound()
  return <ReviewDetail reviewId={id} />
}
