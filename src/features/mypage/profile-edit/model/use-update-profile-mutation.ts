"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updateMyProfile } from "@/entities/user/api/user.service"
import { uploadImage } from "@/entities/media/api/media.service"
import { authQueryKeys } from "@/entities/auth/model/auth.query-keys"

type UpdateProfileInput = {
  nickname: string
  profileImageUrl: string | null
  profileImageFile: File | null
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: UpdateProfileInput) => {
      let imageUrl = input.profileImageUrl ?? undefined

      if (input.profileImageFile) {
        imageUrl = await uploadImage(input.profileImageFile, "PROFILE")
      }

      return updateMyProfile({
        nickname: input.nickname,
        profileImageUrl: imageUrl,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authQueryKeys.me })
    },
  })
}
