"use client"

import { Loader2 } from "lucide-react"

import { Text } from "@/shared/ui/text"

import { useProposalsByTicketQuery } from "../model/use-proposals-by-ticket-query"
import { openProposalDetail } from "../lib/open-proposal-detail"
import { ProposalCard } from "./proposal-card"

type Props = {
  ticketId: number
  /** 의뢰인 본인 시점일 때만 마운트 (호출처에서 권한 체크) */
}

/**
 * 의뢰 상세 하단 — 받은 제안 목록 (의뢰인 본인 시점에서만 노출).
 */
export function TicketProposalsSection({ ticketId }: Props) {
  const { data, isLoading, error } = useProposalsByTicketQuery(ticketId)

  return (
    <section className="flex flex-col gap-4 pt-4">
      <Text as="h2" typography="subtitle1-bold" className="text-foreground">
        받은 제안
      </Text>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="text-muted-foreground size-5 animate-spin" />
        </div>
      ) : error ? (
        <Text typography="body2-medium" className="text-muted-foreground py-6 text-center">
          제안 목록을 불러올 수 없어요
        </Text>
      ) : !data || data.length === 0 ? (
        <div className="bg-muted/50 rounded-xl py-10 text-center">
          <Text typography="body2-medium" className="text-muted-foreground">
            아직 받은 제안이 없어요
          </Text>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {data.map((proposal) => (
            <li key={proposal.id}>
              <ProposalCard
                proposal={proposal}
                onClick={() =>
                  openProposalDetail({ proposalId: proposal.id, ticketId })
                }
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
