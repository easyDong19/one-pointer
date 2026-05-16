"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { uploadImages } from "@/entities/media/api/media.service"
import { updateTicket } from "@/entities/ticket/api/ticket.service"
import { ticketQueryKeys } from "@/entities/ticket/model/ticket.query-keys"

import type { SubmitUpdateInput } from "../lib/build-update-payload"

/**
 * `PUT /v1/api/ticket/{ticketId}` — 모바일 controller.submit (edit branch) 동치:
 * 1. localImages 가 있으면 uploadImages(TICKET) 으로 S3 업로드 → URL 배열 획득
 * 2. 유지된 existingImageUrls + 신규 업로드 URL 합쳐 최종 imageUrls 구성
 * 3. updateTicket 호출
 *
 * 호출처에서 mutation 성공 후 router.push(`/tickets/{id}`) + reset() 처리.
 */
export function useUpdateTicketMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      ticketId,
      localImages,
      existingImageUrls,
      ...rest
    }: SubmitUpdateInput) => {
      let newUrls: string[] = []
      if (localImages.length > 0) {
        newUrls = await uploadImages(localImages, "TICKET")
        if (newUrls.length !== localImages.length) {
          throw new Error("일부 이미지 업로드에 실패했어요. 다시 시도해주세요.")
        }
      }
      const imageUrls = [...existingImageUrls, ...newUrls]
      return updateTicket(ticketId, { ...rest, imageUrls })
    },
    onSuccess: (ticket) => {
      queryClient.invalidateQueries({ queryKey: ticketQueryKeys.detail(ticket.id) })
      queryClient.invalidateQueries({ queryKey: ticketQueryKeys.my() })
      queryClient.invalidateQueries({ queryKey: ticketQueryKeys.myInProgress() })
      queryClient.invalidateQueries({ queryKey: ticketQueryKeys.myCompleted() })
    },
    onError: (error) => {
      console.error("[update-ticket]", error)
      toast.error(
        error instanceof Error ? error.message : "의뢰 수정에 실패했어요",
      )
    },
  })
}
