"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import Autoplay from "embla-carousel-autoplay"
import useEmblaCarousel from "embla-carousel-react"

import type { Banner } from "@/entities/banner/api/banner.schema"
import { cn } from "@/shared/lib/utils"
import { resolveBannerLink } from "../lib/resolve-banner-link"

/**
 * 운영자 등록 동적 배너 캐러셀.
 *
 * docs/detail/home-banner.md §3-A / §6 참조.
 * - 자동 슬라이드 4초, hover/touch 시 일시정지
 * - 슬라이드 1개면 인디케이터 숨김
 * - 5:2 비율 (모바일/데스크탑 공통, 데스크탑에서만 약간 와이드)
 *
 * imageUrl 도메인이 next.config 의 remotePatterns 에 미등록될 가능성이 있어
 * v1 에서는 plain <img> 로 안전하게 렌더한다 (오픈 이슈 #5 참조).
 */
export function DynamicBannerCarousel({ banners }: { banners: Banner[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: banners.length > 1, align: "start" },
    banners.length > 1
      ? [
          Autoplay({
            delay: 5000,
            stopOnInteraction: false,
            stopOnMouseEnter: true,
            stopOnFocusIn: true,
          }),
        ]
      : []
  )
  const [selected, setSelected] = useState(0)

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelected(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on("select", onSelect)
    emblaApi.on("reInit", onSelect)
  }, [emblaApi, onSelect])

  if (banners.length === 0) return null

  return (
    <section
      aria-roledescription="carousel"
      aria-label="홈 프로모션 배너"
      className="relative"
    >
      <div ref={emblaRef} className="overflow-hidden rounded-2xl md:rounded-3xl">
        <div className="flex">
          {banners.map((banner, i) => (
            <div
              key={banner.id}
              className="min-w-0 flex-[0_0_100%]"
              aria-roledescription="slide"
              aria-label={`${i + 1} / ${banners.length}`}
            >
              <BannerSlide banner={banner} />
            </div>
          ))}
        </div>
      </div>

      {banners.length > 1 && (
        <div className="mt-3 flex items-center justify-center gap-1.5">
          {banners.map((banner, i) => (
            <button
              key={banner.id}
              type="button"
              aria-label={`${i + 1}번 슬라이드로 이동`}
              aria-current={selected === i}
              onClick={() => emblaApi?.scrollTo(i)}
              className={cn(
                "h-1.5 rounded-full transition-all",
                selected === i
                  ? "w-6 bg-foreground"
                  : "w-1.5 bg-foreground/25 hover:bg-foreground/40"
              )}
            />
          ))}
        </div>
      )}
    </section>
  )
}

function BannerSlide({ banner }: { banner: Banner }) {
  const link = resolveBannerLink(banner.linkUrl)
  const inner = (
    <div className="relative aspect-[5/2] w-full overflow-hidden bg-muted md:aspect-[16/5]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={banner.imageUrl}
        alt=""
        className="h-full w-full object-cover"
        loading="eager"
        decoding="async"
      />
    </div>
  )

  if (link.kind === "internal") {
    return (
      <Link href={link.href} className="block">
        {inner}
      </Link>
    )
  }
  if (link.kind === "external") {
    return (
      <a
        href={link.href}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        {inner}
      </a>
    )
  }
  return inner
}
