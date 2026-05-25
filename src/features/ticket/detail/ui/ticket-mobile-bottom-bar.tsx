"use client"

import { useRouter } from "next/navigation"

import { Text } from "@/shared/ui/text"
import { Button } from "@/shared/ui/button"
import { STATUS_LABEL } from "@/entities/ticket/lib/ticket.constants"
import type { TicketDetail } from "@/entities/ticket/api/ticket.schema"
import { useAuthStore } from "@/entities/auth/model/auth-store"
import { openProposalForm } from "@/features/proposal/lib/open-proposal-form"
import { openExpertRegisterPrompt, useExpertExistsQuery } from "@/features/mypage"

export function TicketMobileBottomBar({ ticket }: { ticket: TicketDetail }) {
  const router = useRouter()
  const userId = useAuthStore((s) => s.user?.id)
  const isOwner = userId != null && userId === ticket.clientId
  const { data: expertExists, isLoading: isExpertLoading } = useExpertExistsQuery()
  const canPropose = ticket.status === "OPEN" || ticket.status === "IN_REVIEW"
  const statusInfo = STATUS_LABEL[ticket.status] ?? STATUS_LABEL.OPEN

  if (isOwner) return null

  const handleSendProposal = async () => {
    if (isExpertLoading) return
    if (!expertExists) {
      const confirmed = await openExpertRegisterPrompt()
      if (confirmed) router.push("/mypage/expert-register")
      return
    }
    openProposalForm({
      ticketId: ticket.id,
      ticketType: ticket.ticketType,
    })
  }

  return (
    <div className="bg-background/80 border-border/50 fixed bottom-0 left-0 right-0 z-50 border-t px-4 pb-[env(safe-area-inset-bottom,0px)] pt-3 backdrop-blur-md lg:hidden">
      <div className="mx-auto max-w-3xl pb-3">
        <Button
          size="lg"
          className="w-full rounded-xl py-6"
          disabled={!canPropose}
          onClick={canPropose ? handleSendProposal : undefined}
        >
          <Text as="span" typography="body1-bold">
            {canPropose ? "제안서 보내기" : statusInfo.text}
          </Text>
        </Button>
      </div>
    </div>
  )
}
