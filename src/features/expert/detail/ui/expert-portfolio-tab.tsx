"use client"

import { useState } from "react"
import Image from "next/image"
import BrokenImageOutlinedIcon from "@mui/icons-material/BrokenImageOutlined"
import PhotoLibraryOutlinedIcon from "@mui/icons-material/PhotoLibraryOutlined"
import { Text } from "@/shared/ui/text"
import type { ExpertDetail } from "@/entities/expert/api/expert.schema"

export function ExpertPortfolioTab({ expert }: { expert: ExpertDetail }) {
  const portfolios = expert.portfolios ?? []

  if (portfolios.length === 0) {
    return (
      <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 py-12">
        <PhotoLibraryOutlinedIcon className="text-muted-foreground/40" sx={{ fontSize: 48 }} />
        <Text as="p" typography="body2-regular" className="text-muted-foreground">
          등록된 포트폴리오가 없습니다
        </Text>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 px-4 py-6 lg:px-0">
      {portfolios.map((portfolio, idx) => (
        <div
          key={portfolio.id ?? idx}
          className="bg-card border-border overflow-hidden rounded-xl border"
        >
          <PortfolioImage
            src={portfolio.imageUrls[0]}
            alt={portfolio.description || `포트폴리오 ${idx + 1}`}
            imageCount={portfolio.imageUrls.length}
          />
          {portfolio.description && (
            <div className="p-4">
              <Text as="p" typography="body2-regular" className="text-foreground">
                {portfolio.description}
              </Text>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function PortfolioImage({
  src,
  alt,
  imageCount,
}: {
  src?: string
  alt: string
  imageCount: number
}) {
  const [hasError, setHasError] = useState(false)

  if (!src || hasError) {
    return (
      <div className="bg-muted flex aspect-video w-full items-center justify-center">
        <BrokenImageOutlinedIcon className="text-muted-foreground/30" sx={{ fontSize: 48 }} />
      </div>
    )
  }

  return (
    <div className="relative aspect-video w-full">
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        unoptimized
        onError={() => setHasError(true)}
      />
      {imageCount > 1 && (
        <span className="bg-foreground/60 text-background absolute bottom-3 right-3 rounded-full px-2.5 py-0.5">
          <Text as="span" typography="caption1-medium">
            {imageCount}장
          </Text>
        </span>
      )}
    </div>
  )
}
