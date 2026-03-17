import type { Category } from "@/entities/category/api/category.schema"
import type { ExpertSummary } from "@/entities/expert/api/expert.schema"
import type { TicketFeedItem } from "@/entities/ticket/api/ticket.schema"
import { getCategoriesOnServer } from "@/entities/category/api/category.server-service"
import { getPopularExpertsOnServer } from "@/entities/expert/api/expert.server-service"
import { getPopularTicketsOnServer } from "@/entities/ticket/api/ticket.server-service"
import { HomeHeader } from "@/app/_components/home-header"
import { HomeSearchBar } from "@/app/_components/home-search-bar"
import { HomeCategoryGrid } from "@/app/_components/home-category-grid"
import { HomePopularTickets } from "@/app/_components/home-popular-tickets"
import { HomePopularExperts } from "@/app/_components/home-popular-experts"
import { HomeHowItWorks } from "@/app/_components/home-how-it-works"
import { HomeFooter } from "@/app/_components/home-footer"
import { HomeBottomNav } from "@/app/_components/home-bottom-nav"

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
    <div className="bg-background flex min-h-dvh flex-col">
      <HomeHeader />

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-5 py-6 pb-24 md:gap-10 md:px-10 md:pb-10 lg:px-16">
        <HomeSearchBar />
        <HomeCategoryGrid categories={categories} />
        <HomePopularTickets tickets={popularTickets} />
        <HomePopularExperts experts={popularExperts} />
        <HomeHowItWorks />
      </main>

      <HomeFooter />
      <HomeBottomNav />
    </div>
  )
}
