"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { toggleMessageVisibility } from "@/entities/review/api/review.service"
import { reviewQueryKeys } from "@/entities/review/model/review.query-keys"
import type {
  ToggleMessageVisibilityRequest,
} from "@/entities/review/api/review.service"

type Variables = {
  messageId: number
  payload: ToggleMessageVisibilityRequest
}

/**
 * PATCH /v1/api/review/{reviewId}/messages/{messageId}/visibility
 * 성공 시 해당 review 의 filtering 캐시 invalidate.
 */
export function useToggleVisibilityMutation(reviewId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ messageId, payload }: Variables) =>
      toggleMessageVisibility(reviewId, messageId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewQueryKeys.filtering(reviewId) })
    },
  })
}
