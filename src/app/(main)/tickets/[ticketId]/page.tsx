import { notFound } from "next/navigation"
import { TicketDetailContent } from "./_components/ticket-detail-content"

type Props = {
  params: Promise<{ ticketId: string }>
}

export default async function TicketDetailPage({ params }: Props) {
  const { ticketId } = await params
  const id = Number(ticketId)

  if (!Number.isInteger(id) || id <= 0) notFound()

  return <TicketDetailContent ticketId={id} />
}
