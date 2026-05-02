"use client"

import Link from "next/link"
import { ThumbsUp, User } from "lucide-react"

import type { MessagePreview, ReviewFeed } from "@/entities/review/api/review.schema"
import { TICKET_TYPE_LABEL } from "@/entities/review/lib/review.constants"
import { StarRatingDisplay } from "@/features/review/detail/ui/star-rating-display"
import { Text } from "@/shared/ui/text"
import { formatDate } from "@/shared/lib/format"

type Props = {
  review: ReviewFeed
}

/**
 * 전문가 프로필 리뷰 탭의 단일 카드.
 * 클릭 시 `/reviews/{id}` 로 이동.
 */
export function ExpertReviewCard({ review }: Props) {
  const previewMessages = (review.messagePreview ?? []).filter(
    (msg) => msg.visibility === "PUBLIC" && msg.messageType !== "SYSTEM",
  )

  return (
    <Link
      href={`/reviews/${review.reviewId}`}
      className="group border-border hover:bg-muted/30 flex flex-col gap-3 rounded-xl border p-4 transition-colors"
    >
      <header className="flex items-center gap-3">
        <Avatar
          imageUrl={review.clientProfile.profileImageUrl}
          nickname={review.clientProfile.nickname}
        />
        <div className="min-w-0 flex-1">
          <Text
            as="div"
            typography="caption1-bold"
            className="text-foreground truncate"
          >
            {review.clientProfile.nickname}
          </Text>
          <Text
            as="div"
            typography="caption2-medium"
            className="text-muted-foreground tabular-nums"
          >
            {formatDate(review.publishedAt)}
          </Text>
        </div>
        <StarRatingDisplay rating={review.rating} size="sm" />
      </header>

      <div className="flex flex-col gap-1">
        <Text
          as="div"
          typography="caption2-medium"
          className="text-muted-foreground"
        >
          {TICKET_TYPE_LABEL[review.ticketType]} 의뢰
        </Text>
        <Text
          as="div"
          typography="body2-bold"
          className="text-foreground line-clamp-1"
        >
          {review.ticketTitle}
        </Text>
      </div>

      {previewMessages.length > 0 && (
        <div className="bg-muted/40 flex flex-col gap-1.5 rounded-lg px-3 py-2">
          {previewMessages.slice(0, 2).map((msg, idx) => (
            <PreviewLine key={idx} message={msg} />
          ))}
          {review.totalPublicMessageCount > previewMessages.length && (
            <Text
              as="div"
              typography="caption2-medium"
              className="text-muted-foreground tabular-nums"
            >
              +{review.totalPublicMessageCount - previewMessages.length}개 메시지 더보기
            </Text>
          )}
        </div>
      )}

      {review.helpfulCount > 0 && (
        <div className="text-muted-foreground inline-flex items-center gap-1">
          <ThumbsUp className="h-3 w-3" />
          <Text as="span" typography="caption2-medium" className="tabular-nums">
            도움됐어요 {review.helpfulCount}
          </Text>
        </div>
      )}
    </Link>
  )
}

function PreviewLine({ message }: { message: MessagePreview }) {
  const text =
    message.messageType === "TEXT"
      ? message.content
      : message.messageType === "IMAGE"
        ? "사진"
        : message.messageType === "FILE"
          ? message.content || "파일"
          : message.messageType === "AGREEMENT"
            ? "합의서"
            : message.messageType === "DELIVERY"
              ? "작업물"
              : message.content

  return (
    <Text
      as="p"
      typography="caption2-medium"
      className="text-muted-foreground line-clamp-1"
    >
      <span className="text-foreground/80 mr-1 font-medium">
        {message.senderNickname}
      </span>
      {text}
    </Text>
  )
}

function Avatar({
  imageUrl,
  nickname,
}: {
  imageUrl: string | null | undefined
  nickname: string
}) {
  return (
    <div className="bg-muted relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full">
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt={nickname} className="h-full w-full object-cover" />
      ) : (
        <User className="text-muted-foreground/40 h-4 w-4" />
      )}
    </div>
  )
}
