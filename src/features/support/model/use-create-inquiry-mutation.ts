"use client"

import { useMutation } from "@tanstack/react-query"
import { createInquiry } from "@/entities/inquiry/api/inquiry.service"
import { uploadImages } from "@/entities/media/api/media.service"

type CreateInquiryInput = {
  contactEmail: string
  content: string
  images: File[]
}

/**
 * 고객센터 문의 등록 — 이미지 업로드 + createInquiry 결합.
 * 명세: docs/domain/inquiry/INQUIRY_FORM.md
 */
export function useCreateInquiryMutation() {
  return useMutation({
    mutationFn: async (input: CreateInquiryInput) => {
      const imageUrls =
        input.images.length > 0
          ? await uploadImages(input.images, "INQUIRY")
          : undefined

      return createInquiry({
        contactEmail: input.contactEmail,
        content: input.content,
        imageUrls,
      })
    },
  })
}
