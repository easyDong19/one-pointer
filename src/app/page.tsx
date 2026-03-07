import type { Category } from "@/entities/category/api/category.schema"
import type { PopularExpertItem } from "@/entities/expert/api/expert.schema"
import { getCategoriesOnServer } from "@/entities/category/api/category.server-service"
import { getPopularExpertsOnServer } from "@/entities/expert/api/expert.server-service"
import { HomeHeader } from "@/app/_components/home-header"
import { HomeHeroBanner } from "@/app/_components/home-hero-banner"
import { HomeCategoryGrid } from "@/app/_components/home-category-grid"
import { HomeCtaBanner } from "@/app/_components/home-cta-banner"
import { HomePopularExperts } from "@/app/_components/home-popular-experts"
import { HomeHowItWorks } from "@/app/_components/home-how-it-works"
import { HomeFooter } from "@/app/_components/home-footer"
import { HomeBottomNav } from "@/app/_components/home-bottom-nav"

export const dynamic = "force-dynamic"

async function fetchSafe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn()
  } catch {
    return fallback
  }
}

export default async function HomePage() {
  const [categories, popularExperts] = await Promise.all([
    fetchSafe<Category[]>(getCategoriesOnServer, []),
    fetchSafe<PopularExpertItem[]>(getPopularExpertsOnServer, []),
  ])

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <HomeHeader />

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-5 py-6 pb-24 md:gap-10 md:px-10 md:pb-10 lg:px-16">
        <HomeHeroBanner />
        <HomeCategoryGrid categories={categories} />
        <HomeCtaBanner />
        <HomePopularExperts experts={popularExperts} />
        <HomeHowItWorks />
      </main>

      <HomeFooter />
      <HomeBottomNav />
    </div>
  )
}
