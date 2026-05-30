import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ProposalDetailContent } from "./_components/proposal-detail-content"

export const metadata: Metadata = {
  title: "제안서 상세",
}

type Props = {
  params: Promise<{ proposalId: string }>
}

export default async function ProposalDetailPage({ params }: Props) {
  const { proposalId } = await params
  const id = Number(proposalId)

  if (!Number.isInteger(id) || id <= 0) notFound()

  return <ProposalDetailContent proposalId={id} />
}
