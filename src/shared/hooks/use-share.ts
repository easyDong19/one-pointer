"use client"

import { useCallback, useRef } from "react"
import { toast } from "sonner"

type ShareData = {
  /** 공유할 URL. 미지정 시 현재 페이지 URL */
  url?: string
  title?: string
  text?: string
}

/**
 * Web Share API 기반 공유 훅.
 *
 * - 진행 중 재호출을 ref 가드로 차단 → `InvalidStateError: An earlier share has
 *   not yet completed` (공유 시트가 떠 있는 동안 더블탭/연타) 방지
 * - Web Share 미지원 환경에서는 클립보드 복사 fallback + 토스트 피드백
 * - 사용자가 공유를 취소(AbortError)한 경우는 에러로 보지 않고 조용히 무시
 *
 * @example
 * const share = useShare()
 * <button onClick={() => share()}>공유</button>
 */
export function useShare() {
  const sharingRef = useRef(false)

  return useCallback(async (data?: ShareData) => {
    if (sharingRef.current) return
    sharingRef.current = true

    const url = data?.url ?? window.location.href

    try {
      if (navigator.share) {
        await navigator.share({ ...data, url })
      } else {
        await navigator.clipboard.writeText(url)
        toast.success("링크가 복사되었습니다")
      }
    } catch (error) {
      if ((error as Error)?.name !== "AbortError") {
        toast.error("공유에 실패했습니다")
      }
    } finally {
      sharingRef.current = false
    }
  }, [])
}
