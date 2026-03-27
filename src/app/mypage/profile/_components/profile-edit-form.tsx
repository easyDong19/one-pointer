"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/shared/ui/button"
import { Text } from "@/shared/ui/text"
import { ResponsiveAlert } from "@/shared/ui/responsive-alert"
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

  const [alertOpen, setAlertOpen] = useState(false)
  const [alertConfig, setAlertConfig] = useState<{
    variant: "success" | "warning"
    title: string
    description?: string
  }>({ variant: "success", title: "" })

  const handleFileSelect = (file: File) => {
    setProfileImageFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const handleRemoveImage = () => {
    setProfileImageFile(null)
    setPreviewUrl(null)
    setProfileImageUrl(null)
  }

  const handleNicknameCheckedChange = useCallback((checked: boolean) => {
    setNicknameChecked(checked)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (nickname.length < 2) {
      setAlertConfig({
        variant: "warning",
        title: "닉네임은 2자 이상이어야 합니다.",
      })
      setAlertOpen(true)
      return
    }

    if (!nicknameChecked) {
      setAlertConfig({
        variant: "warning",
        title: "닉네임 중복확인을 해주세요.",
      })
      setAlertOpen(true)
      return
    }

    try {
      await updateMutation.mutateAsync({
        nickname,
        profileImageUrl,
        profileImageFile,
      })

      setAlertConfig({
        variant: "success",
        title: "프로필이 수정되었습니다.",
      })
      setAlertOpen(true)
    } catch (error) {
      console.error("[ProfileEdit] 저장 실패:", error)
      setAlertConfig({
        variant: "warning",
        title: "프로필 수정에 실패했습니다.",
        description: error instanceof Error ? error.message : "다시 시도해주세요.",
      })
      setAlertOpen(true)
    }
  }

  const handleAlertClose = (open: boolean) => {
    setAlertOpen(open)
    if (!open && alertConfig.variant === "success") {
      router.push("/mypage")
    }
  }

  return (
    <>
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

      <ResponsiveAlert
        open={alertOpen}
        onOpenChange={handleAlertClose}
        variant={alertConfig.variant}
        title={alertConfig.title}
        description={alertConfig.description}
      />
    </>
  )
}
