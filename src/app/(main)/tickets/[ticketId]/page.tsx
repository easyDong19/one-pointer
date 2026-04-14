import { TicketDetailContent } from "./_components/ticket-detail-content"

type Props = {
  params: Promise<{ ticketId: string }>
}

export default async function TicketDetailPage({ params }: Props) {
  const { ticketId } = await params

  return <TicketDetailContent ticketId={Number(ticketId)} />
}
