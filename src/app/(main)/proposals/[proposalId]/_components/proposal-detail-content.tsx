"use client"

import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

import { AuthGuard } from "@/features/auth/guard"
import { PageShell } from "@/shared/ui/page-shell"
import { Text } from "@/shared/ui/text"
import { useProposalDetailQuery } from "@/features/proposal/model/use-proposal-detail-query"
import { ProposalDetailHeader } from "@/features/proposal/ui/proposal-detail-header"
import { ProposalExpertCard } from "@/features/proposal/ui/proposal-expert-card"
import { ProposalInfoCard } from "@/features/proposal/ui/proposal-info-card"
import { ProposalAppeal } from "@/features/proposal/ui/proposal-appeal"
import { ProposalSchedule } from "@/features/proposal/ui/proposal-schedule"
import { ProposalAcceptButton } from "@/features/proposal/ui/proposal-accept-button"
import { ProposalDetailMobileBottomBar } from "@/features/proposal/ui/proposal-detail-mobile-bottom-bar"

export function ProposalDetailContent({ proposalId }: { proposalId: number }) {
  return (
    <AuthGuard>
      <Inner proposalId={proposalId} />
    </AuthGuard>
  )
}

function Inner({ proposalId }: { proposalId: number }) {
  const router = useRouter()
  const { data, isLoading, isError } = useProposalDetailQuery(proposalId)

  if (isLoading) {
    return (
      <div className="bg-background flex min-h-dvh items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="bg-background flex min-h-dvh flex-col items-center justify-center gap-3">
        <Text as="p" typography="body1-medium" className="text-muted-foreground">
          제안서를 불러올 수 없어요
        </Text>
        <button
          onClick={() => router.back()}
          className="text-primary text-sm font-medium underline"
        >
          뒤로가기
        </button>
      </div>
    )
  }

  const ticketId = data.ticketId ?? 0

  return (
    <PageShell tier="content">
      <PageShell.Header>
        <ProposalDetailHeader />
      </PageShell.Header>

      <PageShell.Content spacing="none">
        <div className="pb-28 lg:grid lg:grid-cols-[1fr_380px] lg:items-start lg:gap-8 lg:py-8 lg:pb-8">
          {/* 좌측 / 모바일 본문 */}
          <div className="flex flex-col gap-4 pt-5 lg:pt-0">
            {data.expertInfo && <ProposalExpertCard expert={data.expertInfo} />}

            {/* 제안 정보 — 모바일에서는 본문에, 데스크탑에서는 사이드바에 노출 */}
            <div className="lg:hidden">
              <ProposalInfoCard proposal={data} />
            </div>

            {data.appeal && <ProposalAppeal appeal={data.appeal} />}

            {data.availableDates && data.availableDates.length > 0 && (
              <ProposalSchedule dates={data.availableDates} />
            )}
          </div>

          {/* 데스크탑 사이드바 */}
          <div className="hidden lg:block">
            <div className="sticky top-8 flex flex-col gap-4">
              <ProposalInfoCard proposal={data} />
              <ProposalAcceptButton
                proposalId={proposalId}
                ticketId={ticketId}
                status={data.status}
              />
            </div>
          </div>
        </div>
      </PageShell.Content>

      <PageShell.Footer>
        <ProposalDetailMobileBottomBar
          proposalId={proposalId}
          ticketId={ticketId}
          status={data.status}
        />
      </PageShell.Footer>
    </PageShell>
  )
}
