"use client"

import { ImageIcon, Pencil, Trash2 } from "lucide-react"
import { Text } from "@/shared/ui/text"
import type { z } from "zod/v4"
import type { portfolioSchema } from "@/entities/user/api/user.schema"

type Portfolio = z.infer<typeof portfolioSchema>

type PortfolioCardProps = {
  portfolio: Portfolio
  onEdit: () => void
  onDelete: () => void
}

export function PortfolioCard({ portfolio, onEdit, onDelete }: PortfolioCardProps) {
  const thumbnailUrl = portfolio.imageUrls[0]

  return (
    <div className="flex gap-4 rounded-xl border p-4 shadow-sm">
      {/* 썸네일 */}
      <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={portfolio.description}
            className="size-full object-cover"
          />
        ) : (
          <ImageIcon className="size-8 text-muted-foreground" />
        )}
      </div>

      {/* 내용 */}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {portfolio.type && (
          <Text as="span" typography="caption2-medium" className="text-muted-foreground">
            {portfolio.type}
          </Text>
        )}
        <Text as="p" typography="body3-medium" className="line-clamp-2">
          {portfolio.description}
        </Text>
        {portfolio.imageUrls.length > 0 && (
          <Text as="span" typography="caption2-medium" className="text-muted-foreground">
            이미지 {portfolio.imageUrls.length}장
          </Text>
        )}
      </div>

      {/* 액션 */}
      <div className="flex shrink-0 flex-col gap-1">
        <button
          type="button"
          onClick={onEdit}
          className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <Pencil className="size-4" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="size-4" />
        </button>
      </div>
    </div>
  )
}
