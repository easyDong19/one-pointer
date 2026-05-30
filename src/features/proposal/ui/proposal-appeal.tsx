"use client"

import { Text } from "@/shared/ui/text"

type Props = {
  appeal: string
}

/** 어필 메시지 섹션. 모바일 앱의 어필 섹션 레이아웃을 따른다. */
export function ProposalAppeal({ appeal }: Props) {
  return (
    <section className="bg-card border-border rounded-2xl border p-5 shadow-sm md:p-6">
      <Text as="h2" typography="body3-bold" className="text-foreground">
        어필 메시지
      </Text>
      <Text
        as="p"
        typography="body3-regular"
        className="text-foreground/80 mt-2 leading-relaxed whitespace-pre-wrap"
      >
        {appeal}
      </Text>
    </section>
  )
}
