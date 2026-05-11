"use client"

import { overlay } from "overlay-kit"

import { MyProposalDetailDialog } from "../ui/my-proposal-detail-dialog"

type Args = {
  proposalId: number
}

export function openMyProposalDetail({ proposalId }: Args): Promise<void> {
  return new Promise((resolve) => {
    overlay.open(({ isOpen, close, unmount }) => (
      <MyProposalDetailDialog
        isOpen={isOpen}
        proposalId={proposalId}
        onClose={() => {
          resolve()
          close()
          setTimeout(unmount, 300)
        }}
      />
    ))
  })
}
