"use client"

import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"

import { uploadImages } from "@/entities/media/api/media.service"
import {
  createTicket,
  type CreateTicketRequest,
} from "@/entities/ticket/api/ticket.service"

export type SubmitTicketInput = Omit<CreateTicketRequest, "imageUrls"> & {
  /** 로컬 File 배열 — mutation 내부에서 uploadImages(TICKET) 후 imageUrls 동봉 */
  localImages: File[]
}

/**
 * `POST /v1/api/ticket` — 모바일 controller.submit 흐름과 동일:
 * 1. localImages 가 있으면 uploadImages(TICKET) 으로 S3 업로드 → URL 배열 획득
 * 2. createTicket 에 imageUrls 동봉해 호출
 *
 * 응답에 chatRoomId 가 포함되지 않음 (매칭 비동기). 호출처에서 ticket.id 로
 * `/tickets/[id]` redirect + 토스트.
 */
export function useCreateTicketMutation() {
  return useMutation({
    mutationFn: async ({ localImages, ...rest }: SubmitTicketInput) => {
      let imageUrls: string[] | undefined
      if (localImages.length > 0) {
        imageUrls = await uploadImages(localImages, "TICKET")
        if (imageUrls.length !== localImages.length) {
          throw new Error("일부 이미지 업로드에 실패했어요. 다시 시도해주세요.")
        }
      }
      return createTicket({ ...rest, imageUrls })
    },
    onError: (error) => {
      console.error("[create-ticket]", error)
      toast.error(
        error instanceof Error ? error.message : "의뢰 등록에 실패했어요",
      )
    },
  })
}
