import type { Banner } from "@/entities/banner/api/banner.schema"
import { DynamicBannerCarousel } from "./dynamic-banner-carousel"
import { StaticPromoCarousel } from "./static-promo-carousel"

/**
 * 홈 최상단 배너 섹션 — 진입점.
 *
 * 정책 (docs/detail/home-banner.md §3, §9):
 * - 동적 배너가 1개 이상이면 동적 캐러셀만 노출
 * - 동적 배너가 0개 / API 실패면 정적 프로모 캐러셀 fallback
 */
export function HomeBannerSection({ banners }: { banners: Banner[] }) {
  if (banners.length > 0) {
    return <DynamicBannerCarousel banners={banners} />
  }
  return <StaticPromoCarousel />
}
