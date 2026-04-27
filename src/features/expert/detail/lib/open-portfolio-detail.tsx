"use client"

import { overlay } from "overlay-kit"
import type { z } from "zod/v4"
import type { expertPortfolioSchema } from "@/entities/expert/api/expert.schema"
import { PortfolioDetailModal } from "../ui/portfolio-detail-modal"

type Portfolio = z.infer<typeof expertPortfolioSchema>

/**
 * 전문가 상세 페이지의 포트폴리오 카드 클릭 시 read-only 상세 모달을 연다.
 * 단순 viewer 라 결과 반환 없음.
 *
 * @example
 * <button onClick={() => openPortfolioDetail(portfolio)}>...</button>
 *
 * 명세: docs/domain/expert/PORTFOLIO_DETAIL_MODAL.md
 */
export function openPortfolioDetail(portfolio: Portfolio): Promise<void> {
  return new Promise((resolve) => {
    overlay.open(({ isOpen, close, unmount }) => (
      <PortfolioDetailModal
        isOpen={isOpen}
        portfolio={portfolio}
        onClose={() => {
          resolve()
          close()
          setTimeout(unmount, 300)
        }}
      />
    ))
  })
}
