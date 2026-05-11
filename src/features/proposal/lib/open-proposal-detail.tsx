"use client"

import { overlay } from "overlay-kit"

import { ProposalDetailDialog } from "../ui/proposal-detail-dialog"

type Args = {
  proposalId: number
  ticketId: number
}

export function openProposalDetail({ proposalId, ticketId }: Args): Promise<void> {
  return new Promise((resolve) => {
    overlay.open(({ isOpen, close, unmount }) => (
      <ProposalDetailDialog
        isOpen={isOpen}
        proposalId={proposalId}
        ticketId={ticketId}
        onClose={() => {
          resolve()
          close()
          setTimeout(unmount, 300)
        }}
      />
    ))
  })
}
