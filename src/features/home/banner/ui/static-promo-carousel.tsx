"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import Autoplay from "embla-carousel-autoplay"
import useEmblaCarousel from "embla-carousel-react"
import { cn } from "@/shared/lib/utils"
import { Text } from "@/shared/ui/text"
import { PROMO_SLIDES, type PromoSlide } from "../model/static-promo-slides"

/**
 * 동적 배너가 0개일 때 fallback 으로 노출되는 정적 프로모 캐러셀.
 *
 * docs/detail/home-banner.md §3-B / landing-*.md 참조.
 * 슬라이드 3종: 숨은 수수료 / 채팅=리뷰 / 전문가 모집.
 */
export function StaticPromoCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start" },
    [
      Autoplay({
        delay: 6000,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
        stopOnFocusIn: true,
      }),
    ]
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

  return (
    <section
      aria-roledescription="carousel"
      aria-label="홈 프로모션 배너"
      className="relative"
    >
      <div ref={emblaRef} className="overflow-hidden rounded-2xl md:rounded-3xl">
        <div className="flex">
          {PROMO_SLIDES.map((slide, i) => (
            <div
              key={slide.key}
              className="min-w-0 flex-[0_0_100%]"
              aria-roledescription="slide"
              aria-label={`${i + 1} / ${PROMO_SLIDES.length} · ${slide.headline}`}
            >
              <PromoCard slide={slide} />
            </div>
          ))}
        </div>
      </div>

      {/* 인디케이터 도트 */}
      <div className="mt-3 flex items-center justify-center gap-1.5">
        {PROMO_SLIDES.map((slide, i) => (
          <button
            key={slide.key}
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
    </section>
  )
}

function PromoCard({ slide }: { slide: PromoSlide }) {
  return (
    <Link
      href={slide.href}
      className={cn(
        "group relative block aspect-[5/2] overflow-hidden bg-gradient-to-br md:aspect-[16/5]",
        slide.gradient
      )}
    >
      {/* 데코 — 슬라이드 톤별 변주 */}
      <Decoration tone={slide.decoTone} />

      {/* 우상단 큰 아이콘 (배경에 살짝 묻히는 톤) */}
      <div className="pointer-events-none absolute -right-6 -bottom-6 h-40 w-40 text-white/15 md:-right-4 md:-bottom-4 md:h-56 md:w-56">
        {slide.icon}
      </div>

      {/* 콘텐츠 */}
      <div className="relative z-10 flex h-full flex-col justify-between px-6 py-6 md:px-12 md:py-10 lg:px-16">
        <span className="w-fit rounded-full bg-white/20 px-3 py-0.5 backdrop-blur-sm">
          <Text as="span" typography="caption2-medium" className="text-white">
            {slide.label}
          </Text>
        </span>

        <div className="flex max-w-[88%] flex-col gap-1.5 md:max-w-[80%] md:gap-2.5">
          <Text
            as="h2"
            typography="subtitle1-bold"
            className="text-white md:h2-bold"
          >
            {slide.headline}
          </Text>
          <Text
            as="p"
            typography="body3-regular"
            className="text-white/80 md:body2-regular"
          >
            {slide.body}
          </Text>
        </div>
      </div>
    </Link>
  )
}

function Decoration({ tone }: { tone: PromoSlide["decoTone"] }) {
  if (tone === "warm") {
    return (
      <>
        <div className="absolute -top-12 -left-6 h-40 w-40 rounded-full bg-white/15 blur-2xl md:h-64 md:w-64" />
        <div className="absolute top-1/3 right-1/4 h-24 w-24 rounded-full bg-white/10 blur-xl" />
        <div className="absolute bottom-0 left-1/3 h-20 w-20 rotate-12 rounded-2xl border border-white/20" />
      </>
    )
  }
  if (tone === "cool") {
    return (
      <>
        <div className="absolute -top-16 right-1/4 h-48 w-48 rounded-full bg-white/10 blur-2xl md:h-72 md:w-72" />
        <div className="absolute top-1/2 -left-8 h-32 w-32 rounded-full bg-white/15 blur-xl" />
        <div className="absolute top-4 right-1/3 h-2 w-2 rounded-full bg-white/60" />
        <div className="absolute top-12 right-1/4 h-1 w-1 rounded-full bg-white/40" />
      </>
    )
  }
  // violet
  return (
    <>
      <div className="absolute -top-10 -right-10 h-48 w-48 rounded-full bg-white/10 blur-2xl md:h-72 md:w-72" />
      <div className="absolute bottom-0 -left-8 h-36 w-36 rounded-full bg-white/8 blur-xl md:h-56 md:w-56" />
      <div className="absolute top-1/2 left-1/2 hidden h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5 blur-3xl md:block" />
    </>
  )
}
