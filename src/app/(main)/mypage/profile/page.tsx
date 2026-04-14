"use client"

import { Text } from "@/shared/ui/text"
import { ProfileEditForm } from "./_components/profile-edit-form"

export default function ProfileEditPage() {
  return (
    <div className="mx-auto max-w-lg">
      <Text as="h1" typography="title-bold" className="mb-6">
        프로필 수정
      </Text>
      <ProfileEditForm />
    </div>
  )
}
