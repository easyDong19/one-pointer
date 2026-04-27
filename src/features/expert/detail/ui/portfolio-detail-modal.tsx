"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react"
import { useMediaQuery } from "@/shared/hooks/use-media-query"
import { cn } from "@/shared/lib/utils"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/shared/ui/carousel"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/shared/ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/shared/ui/sheet"
import type { z } from "zod/v4"
import type { expertPortfolioSchema } from "@/entities/expert/api/expert.schema"

type Portfolio = z.infer<typeof expertPortfolioSchema>

type PortfolioDetailModalProps = {
  isOpen: boolean
  portfolio: Portfolio
  onClose: () => void
}

/**
 * 전문가 포트폴리오 상세 read-only 모달.
 * Editorial Gallery 톤 — 모노스페이스 메타, hairline 구분선, 인덱스 카운터.
 * 명세: docs/domain/expert/PORTFOLIO_DETAIL_MODAL.md
 */
export function PortfolioDetailModal({
  isOpen,
  portfolio,
  onClose,
}: PortfolioDetailModalProps) {
  const isDesktop = useMediaQuery("(min-width: 1024px)")

  const type = portfolio.type?.trim() || null
  const description = portfolio.description?.trim() || null
  const a11yDescription = description
    ? description.length > 80
      ? description.slice(0, 80) + "…"
      : description
    : "전문가의 포트폴리오 이미지와 설명"

  const images = portfolio.imageUrls ?? []
  const altPrefix = type ?? "포트폴리오"

  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent
          className={cn(
            "bg-card flex max-h-[90vh] flex-col gap-0 overflow-hidden border-none p-0 sm:max-w-3xl lg:max-w-5xl",
            // 기본 X 버튼 위치 미세 조정
            "[&>button]:top-5 [&>button]:right-5 [&>button]:opacity-60 hover:[&>button]:opacity-100",
          )}
        >
          {/* Header strip */}
          <div className="border-border/60 flex h-16 items-center border-b px-7 lg:h-[68px] lg:px-10">
            <DialogTitle className="text-foreground flex items-center gap-2.5 text-lg font-semibold tracking-tight lg:text-xl">
              <span
                aria-hidden
                className="bg-foreground/30 inline-block size-1 shrink-0 rounded-full"
              />
              {type ?? "포트폴리오"}
            </DialogTitle>
          </div>
          <DialogDescription className="sr-only">
            {a11yDescription}
          </DialogDescription>

          {/* Image stage */}
          <div className="px-7 pt-6 pb-5 lg:px-10 lg:pt-8 lg:pb-6">
            <PortfolioCarousel
              imageUrls={images}
              altPrefix={altPrefix}
              variant="desktop"
            />
          </div>

          {/* Description — 매거진 본문 톤 */}
          {description && (
            <div className="border-border/60 flex-1 overflow-y-auto border-t px-7 py-5 lg:px-10 lg:py-6">
              <PortfolioDescription description={description} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="bottom"
        className={cn(
          "bg-card flex max-h-[92dvh] flex-col gap-0 rounded-t-2xl border-none p-0",
          // 기본 X 버튼: drag handle 옆으로 살짝 이동
          "[&>button]:top-3.5 [&>button]:right-4 [&>button]:opacity-60 hover:[&>button]:opacity-100",
        )}
      >
        {/* Drag handle (시각 단서) */}
        <div className="flex justify-center pt-3 pb-1">
          <span
            aria-hidden
            className="bg-muted-foreground/25 block h-1 w-10 rounded-full"
          />
        </div>

        {/* Title */}
        <div className="px-5 pt-2 pb-3">
          <SheetTitle className="text-foreground flex items-center gap-2.5 text-lg font-semibold tracking-tight">
            <span
              aria-hidden
              className="bg-foreground/30 inline-block size-1 shrink-0 rounded-full"
            />
            {type ?? "포트폴리오"}
          </SheetTitle>
        </div>
        <SheetDescription className="sr-only">
          {a11yDescription}
        </SheetDescription>

        {/* Image stage — full bleed */}
        <PortfolioCarousel
          imageUrls={images}
          altPrefix={altPrefix}
          variant="mobile"
        />

        {/* Description */}
        {description && (
          <div className="border-border/60 flex-1 overflow-y-auto border-t px-5 py-4 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)]">
            <PortfolioDescription description={description} />
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

/**
 * 설명 본문 — 6줄 초과 시 line-clamp 후 "더 보기" 토글.
 * scrollHeight vs clientHeight 측정으로 실제 클램핑 여부 감지.
 */
function PortfolioDescription({ description }: { description: string }) {
  const ref = useRef<HTMLParagraphElement>(null)
  const [isClamped, setIsClamped] = useState(false)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || expanded) return
    // 클램핑 감지: 1px 버퍼로 반올림 방지
    setIsClamped(el.scrollHeight > el.clientHeight + 1)
  }, [description, expanded])

  return (
    <>
      <p
        ref={ref}
        className={cn(
          "text-foreground/90 text-[15px] leading-[1.7] whitespace-pre-wrap",
          !expanded && "line-clamp-6",
        )}
      >
        {description}
      </p>
      {(isClamped || expanded) && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="text-primary hover:text-primary-hover focus-visible:ring-ring mt-3 text-[13px] font-medium transition-colors hover:underline focus-visible:ring-2 focus-visible:rounded-sm focus-visible:outline-none"
        >
          {expanded ? "접기" : "더 보기"}
        </button>
      )}
    </>
  )
}

/**
 * 캐러셀 + index counter("01 / 07") + hover nav arrows(데스크탑).
 * 빈 imageUrls 처리 포함.
 */
function PortfolioCarousel({
  imageUrls,
  altPrefix,
  variant,
}: {
  imageUrls: string[]
  altPrefix: string
  variant: "desktop" | "mobile"
}) {
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!api) return
    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap())
    api.on("select", () => setCurrent(api.selectedScrollSnap()))
  }, [api])

  if (imageUrls.length === 0) {
    return <EmptyImage variant={variant} />
  }

  const isDesktop = variant === "desktop"

  return (
    <div className="group relative">
      <Carousel setApi={setApi} className="w-full">
        <CarouselContent>
          {imageUrls.map((url, idx) => (
            <CarouselItem key={`${url}-${idx}`}>
              <PortfolioSlide
                src={url}
                alt={`${altPrefix} 이미지 ${idx + 1}/${imageUrls.length}`}
                framed={isDesktop}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Hover nav arrows (데스크탑 + 다중 이미지) */}
      {isDesktop && imageUrls.length > 1 && (
        <>
          <NavButton direction="prev" onClick={() => api?.scrollPrev()} />
          <NavButton direction="next" onClick={() => api?.scrollNext()} />
        </>
      )}

      {/* Index counter chip */}
      {count > 1 && (
        <div
          className={cn(
            "ring-border/40 bg-background/85 absolute z-10 flex items-center rounded-full px-3 py-1 ring-1 backdrop-blur-md",
            isDesktop ? "right-3 bottom-3" : "right-3 bottom-3",
          )}
        >
          <span className="text-foreground/85 text-[11px] font-medium tabular-nums">
            {String(current + 1).padStart(2, "0")}
            <span className="text-foreground/30 mx-1.5">/</span>
            {String(count).padStart(2, "0")}
          </span>
        </div>
      )}
    </div>
  )
}

function NavButton({
  direction,
  onClick,
}: {
  direction: "prev" | "next"
  onClick: () => void
}) {
  const Icon = direction === "prev" ? ChevronLeft : ChevronRight
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction === "prev" ? "이전 이미지" : "다음 이미지"}
      className={cn(
        "ring-border/40 bg-background/80 hover:bg-background absolute top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full opacity-0 ring-1 backdrop-blur-md transition-all duration-200",
        "group-hover:opacity-100 hover:scale-105 focus-visible:opacity-100 focus-visible:outline-none",
        direction === "prev" ? "left-3" : "right-3",
      )}
    >
      <Icon className="text-foreground/70 size-4" />
    </button>
  )
}

function PortfolioSlide({
  src,
  alt,
  framed,
}: {
  src: string
  alt: string
  framed: boolean
}) {
  const [hasError, setHasError] = useState(false)

  if (hasError) {
    return (
      <div
        className={cn(
          "bg-muted flex aspect-[16/9] w-full items-center justify-center",
          framed && "ring-foreground/[0.06] rounded-lg ring-1",
        )}
      >
        <ImageOff className="text-muted-foreground/30" size={48} />
      </div>
    )
  }

  return (
    <div
      className={cn(
        "bg-muted relative aspect-[16/9] w-full overflow-hidden",
        framed && "ring-foreground/[0.06] rounded-lg ring-1",
      )}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        unoptimized
        onError={() => setHasError(true)}
      />
    </div>
  )
}

function EmptyImage({ variant }: { variant: "desktop" | "mobile" }) {
  return (
    <div
      className={cn(
        "bg-muted flex aspect-[16/9] w-full items-center justify-center",
        variant === "desktop" && "ring-foreground/[0.06] rounded-lg ring-1",
      )}
    >
      <ImageOff className="text-muted-foreground/30" size={48} />
    </div>
  )
}
