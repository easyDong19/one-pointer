import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Separator } from "@/shared/ui/separator"
import { PageShell, PageShellHeader, PageShellContent, PageShellFooter } from "@/shared/ui/page-shell"
import { getExpertDetailOnServer } from "@/entities/expert/api/expert.server-service"
import { ExpertDetailHeader } from "@/features/expert/detail/ui/expert-detail-header"
import { ExpertProfileHero } from "@/features/expert/detail/ui/expert-profile-hero"
import { ExpertProfileCard } from "@/features/expert/detail/ui/expert-profile-card"
import { ExpertStatsBar } from "@/features/expert/detail/ui/expert-stats-bar"
import { ExpertTabContent } from "@/features/expert/detail/ui/expert-tab-content"
import { ExpertDesktopSidebar } from "@/features/expert/detail/ui/expert-desktop-sidebar"
import { ExpertMobileBottomBar } from "@/features/expert/detail/ui/expert-mobile-bottom-bar"

export const dynamic = "force-dynamic"

type Props = {
  params: Promise<{ expertProfileId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { expertProfileId } = await params
  const id = Number(expertProfileId)
  if (!Number.isInteger(id) || id <= 0) return {}

  try {
    const expert = await getExpertDetailOnServer(id)
    return {
      title: `${expert.nickname} - 전문가 프로필`,
      description: expert.introduction ?? `${expert.nickname} 전문가의 프로필을 확인하세요.`,
      openGraph: {
        title: `${expert.nickname} - 전문가 프로필`,
        description: expert.introduction ?? undefined,
        images: expert.profileImageUrl ? [expert.profileImageUrl] : undefined,
      },
    }
  } catch {
    return {}
  }
}

export default async function ExpertDetailPage({ params }: Props) {
  const { expertProfileId } = await params
  const id = Number(expertProfileId)

  if (!Number.isInteger(id) || id <= 0) notFound()

  let expert
  try {
    expert = await getExpertDetailOnServer(id)
  } catch {
    notFound()
  }

  return (
    <PageShell tier="content">
      <PageShellHeader>
        <ExpertDetailHeader />
      </PageShellHeader>

      <PageShellContent spacing="none">
        <div className="lg:grid lg:grid-cols-[1fr_380px] lg:items-start lg:gap-8 lg:py-8">
          <div>
            <ExpertProfileHero expert={expert} />
            <div className="mt-5 lg:mt-6">
              <ExpertProfileCard expert={expert} />
            </div>

            <div className="py-4">
              <ExpertStatsBar expert={expert} />
            </div>

            <Separator className="lg:hidden" />

            <ExpertTabContent expert={expert} />
          </div>

          <div className="hidden lg:block">
            <ExpertDesktopSidebar expert={expert} />
          </div>
        </div>
      </PageShellContent>

      <PageShellFooter>
        <ExpertMobileBottomBar />
      </PageShellFooter>
    </PageShell>
  )
}
