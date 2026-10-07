import { assetHandlers } from "../lib/assets"
import { authHandlers } from "./auth"
import { categoryHandlers } from "./category"
import { chatGroupHandlers } from "./chat"
import { expertGroupHandlers } from "./expert"
import { reviewGroupHandlers } from "./review"
import { ticketGroupHandlers } from "./ticket"

/**
 * 순서 주의: MSW 는 먼저 등록된 핸들러가 우선한다.
 * 고정 경로(`/ticket/my`)가 파라미터 경로(`/ticket/:ticketId`)보다 앞에 오도록 도메인 파일 안에서 정렬한다.
 */
export const handlers = [
  ...assetHandlers,
  ...authHandlers,
  ...categoryHandlers,
  ...ticketGroupHandlers,
  ...expertGroupHandlers,
  ...chatGroupHandlers,
  ...reviewGroupHandlers,
]
