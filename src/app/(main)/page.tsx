import type { Category } from "@/entities/category/api/category.schema"
import type { ExpertSummary } from "@/entities/expert/api/expert.schema"
import type { TicketFeedItem } from "@/entities/ticket/api/ticket.schema"
import { getCategoriesOnServer } from "@/entities/category/api/category.server-service"
import { getPopularExpertsOnServer } from "@/entities/expert/api/expert.server-service"
import { getPopularTicketsOnServer } from "@/entities/ticket/api/ticket.server-service"
import { PageShell, PageShellContent, PageShellFooter } from "@/shared/ui/page-shell"
import { HomeCategoryGrid } from "@/app/(main)/_components/home-category-grid"
import { HomePopularTickets } from "@/app/(main)/_components/home-popular-tickets"
import { HomePopularExperts } from "@/app/(main)/_components/home-popular-experts"
import { HomeFooter } from "@/app/(main)/_components/home-footer"

export const dynamic = "force-dynamic"

async function fetchSafe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    console.error(`[fetchSafe] ${fn.name} failed:`, error)
    return fallback
  }
}

export default async function HomePage() {
  const [categories, popularTickets, popularExperts] = await Promise.all([
    fetchSafe<Category[]>(getCategoriesOnServer, []),
    fetchSafe<TicketFeedItem[]>(getPopularTicketsOnServer, []),
    fetchSafe<ExpertSummary[]>(getPopularExpertsOnServer, []),
  ])

  return (
    <PageShell tier="shell">
      <PageShellContent>
        <div className="flex flex-col gap-8 md:gap-10">
          <HomeCategoryGrid categories={categories} />
          <HomePopularTickets tickets={popularTickets} />
          <HomePopularExperts experts={popularExperts} />
        </div>
      </PageShellContent>
      <PageShellFooter>
        <HomeFooter />
      </PageShellFooter>
    </PageShell>
  )
}
