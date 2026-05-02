import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ReviewFilter } from "./_components/review-filter"

type Props = {
  params: Promise<{ reviewId: string }>
}

export const metadata: Metadata = {
  title: "리뷰 필터링",
}

export default async function ReviewFilterPage({ params }: Props) {
  const { reviewId } = await params
  const id = Number(reviewId)
  if (!Number.isInteger(id) || id <= 0) notFound()
  return <ReviewFilter reviewId={id} />
}
