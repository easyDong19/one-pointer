"use client"

import { BadgeCheck, ChevronRight } from "lucide-react"
import Link from "next/link"

import type { ExpertInfo } from "@/entities/proposal/api/proposal.schema"
import { Text } from "@/shared/ui/text"
import { cn } from "@/shared/lib/utils"

type Props = {
  expert: ExpertInfo
}

/**
 * 제안 전문가 카드. expertProfileId 가 있으면 전문가 상세(`/experts/{id}`)로 이동.
 * 모바일 앱 ProposalDetailView 의 전문가 섹션 디자인을 따른다.
 */
export function ProposalExpertCard({ expert }: Props) {
  const href = expert.expertProfileId ? `/experts/${expert.expertProfileId}` : null
  const isApproved = expert.authStatus === "APPROVED"

  const inner = (
    <>
      <Avatar
        url={expert.profileImageUrl}
        name={expert.nickname ?? "전문가"}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-center gap-1.5">
          <Text typography="subtitle2-bold" className="text-foreground truncate">
            {expert.nickname ?? "전문가"}
          </Text>
          {isApproved && (
            <BadgeCheck className="text-primary h-4 w-4 shrink-0" aria-label="인증 전문가" />
          )}
        </div>
        {expert.introduction && (
          <Text
            typography="caption1-medium"
            className="text-muted-foreground truncate"
          >
            {expert.introduction}
          </Text>
        )}
      </div>
      {href && (
        <ChevronRight className="text-muted-foreground h-5 w-5 shrink-0" />
      )}
    </>
  )

  const baseClass =
    "bg-card border-border flex items-center gap-3.5 rounded-2xl border p-4 shadow-sm"

  if (href) {
    return (
      <Link
        href={href}
        className={cn(baseClass, "hover:border-primary/30 transition-colors")}
      >
        {inner}
      </Link>
    )
  }

  return <div className={baseClass}>{inner}</div>
}

function Avatar({ url, name }: { url?: string | null; name: string }) {
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={name}
        className="size-12 shrink-0 rounded-full object-cover"
      />
    )
  }
  return (
    <div className="from-primary flex size-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br to-[#8b7cf0]">
      <Text typography="subtitle2-bold" className="text-white">
        {name.charAt(0)}
      </Text>
    </div>
  )
}
