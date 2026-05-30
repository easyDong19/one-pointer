import type { Metadata } from "next"
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query"
import { notFound } from "next/navigation"
import { getTicketDetailOnServer } from "@/entities/ticket/api/ticket.server-service"
import { ticketQueryKeys } from "@/entities/ticket/model/ticket.query-keys"
import { TicketDetailContent } from "./_components/ticket-detail-content"

type Props = {
  params: Promise<{ ticketId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticketId } = await params
  const id = Number(ticketId)
  if (!Number.isInteger(id) || id <= 0) return {}

  try {
    // 동일 요청 내에서 page 의 fetch 와 Next 가 자동 dedupe.
    const ticket = await getTicketDetailOnServer(id)
    const description = ticket.content?.slice(0, 120)
    const ogImage = ticket.images?.[0]?.imageUrl
    return {
      title: `${ticket.title} - 의뢰`,
      description,
      openGraph: {
        title: ticket.title,
        description,
        images: ogImage ? [ogImage] : undefined,
      },
    }
  } catch {
    return {}
  }
}

export default async function TicketDetailPage({ params }: Props) {
  const { ticketId } = await params
  const id = Number(ticketId)

  if (!Number.isInteger(id) || id <= 0) notFound()

  // 서버에서 의뢰 상세를 미리 받아 React Query 캐시에 시드 → 클라이언트 워터폴 제거.
  // 클라이언트 useTicketDetailQuery 가 동일 쿼리키로 hydration 캐시에 적중한다.
  const queryClient = new QueryClient()
  try {
    const ticket = await getTicketDetailOnServer(id)
    queryClient.setQueryData(ticketQueryKeys.detail(id), ticket)
  } catch {
    notFound()
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TicketDetailContent ticketId={id} />
    </HydrationBoundary>
  )
}
