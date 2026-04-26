"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/shared/ui/button"
import { Text } from "@/shared/ui/text"
import { openAlert } from "@/shared/lib/open-alert"
import { useMyProfileQuery } from "@/features/auth/me/model/use-my-profile-query"
import { useUpdateProfileMutation } from "@/features/mypage/profile-edit"
import { ProfileImageUpload } from "./profile-image-upload"
import { NicknameInput } from "./nickname-input"

export function ProfileEditForm() {
  const router = useRouter()
  const { data: user } = useMyProfileQuery()
  const updateMutation = useUpdateProfileMutation()

  const [nickname, setNickname] = useState(user?.nickname ?? "")
  const [nicknameChecked, setNicknameChecked] = useState(true)
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(
    user?.profileImageUrl ?? null,
  )
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  // preview blob URL 메모리 누수 방지: 새 파일 선택/제거 시 이전 URL revoke,
  // 언마운트 시에도 revoke.
  const previewUrlRef = useRef<string | null>(null)
  previewUrlRef.current = previewUrl
  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current)
    }
  }, [])

  const handleFileSelect = (file: File) => {
    setProfileImageFile(file)
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return URL.createObjectURL(file)
    })
  }

  const handleRemoveImage = () => {
    setProfileImageFile(null)
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
    setProfileImageUrl(null)
  }

  const handleNicknameCheckedChange = useCallback((checked: boolean) => {
    setNicknameChecked(checked)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (nickname.length < 2) {
      openAlert({ variant: "warning", title: "닉네임은 2자 이상이어야 합니다." })
      return
    }

    if (!nicknameChecked) {
      openAlert({ variant: "warning", title: "닉네임 중복확인을 해주세요." })
      return
    }

    try {
      await updateMutation.mutateAsync({
        nickname,
        profileImageUrl,
        profileImageFile,
      })

      await openAlert({ variant: "success", title: "프로필이 수정되었습니다." })
      router.push("/mypage")
    } catch (error) {
      console.error("[ProfileEdit] 저장 실패:", error)
      openAlert({
        variant: "warning",
        title: "프로필 수정에 실패했습니다.",
        description: error instanceof Error ? error.message : "다시 시도해주세요.",
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <ProfileImageUpload
        currentImageUrl={profileImageUrl}
        previewUrl={previewUrl}
        nickname={nickname}
        onFileSelect={handleFileSelect}
        onRemove={handleRemoveImage}
      />

      <NicknameInput
        value={nickname}
        originalNickname={user?.nickname ?? ""}
        onChange={setNickname}
        onCheckedChange={handleNicknameCheckedChange}
      />

      <Button
        type="submit"
        className="w-full"
        disabled={updateMutation.isPending}
      >
        <Text as="span" typography="body3-medium">
          {updateMutation.isPending ? "저장 중..." : "저장"}
        </Text>
      </Button>
    </form>
  )
}
