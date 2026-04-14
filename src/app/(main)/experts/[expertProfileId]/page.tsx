import { ExpertDetailContent } from "./_components/expert-detail-content"

type Props = {
  params: Promise<{ expertProfileId: string }>
}

export default async function ExpertDetailPage({ params }: Props) {
  const { expertProfileId } = await params
  return <ExpertDetailContent expertProfileId={Number(expertProfileId)} />
}
