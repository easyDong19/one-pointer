"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/shared/ui/carousel"
import { cn } from "@/shared/lib/utils"
import type { TicketImage } from "@/entities/ticket/api/ticket.schema"

export function TicketImageCarousel({ images }: { images: TicketImage[] }) {
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!api) return
    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap())

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap())
    })
  }, [api])

  const sortedImages = [...images].sort((a, b) => a.displayOrder - b.displayOrder)

  if (sortedImages.length === 0) {
    return (
      <div className="relative">
        <div className="bg-muted aspect-[16/9] w-full lg:rounded-xl" />
      </div>
    )
  }

  return (
    <div className="relative">
      <Carousel setApi={setApi} className="w-full">
        <CarouselContent>
          {sortedImages.map((img) => (
            <CarouselItem key={img.id}>
              <div className="bg-muted relative aspect-[16/9] w-full overflow-hidden lg:rounded-xl">
                <Image
                  src={img.imageUrl}
                  alt={`의뢰 이미지 ${img.displayOrder}`}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Dot indicators */}
      {count > 1 && (
        <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
          {Array.from({ length: count }).map((_, idx) => (
            <span
              key={idx}
              className={cn(
                "h-1.5 rounded-full transition-all",
                current === idx ? "w-4 bg-white" : "w-1.5 bg-white/50",
              )}
            />
          ))}
        </div>
      )}
    </div>
  )
}
