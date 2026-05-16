"use client"

import { Text } from "@/shared/ui/text"
import { ExpertProfileEditForm } from "./_components/expert-profile-edit-form"

export default function ExpertProfileEditPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Text as="h1" typography="h3-bold">
          전문가 프로필
        </Text>
        <Text as="p" typography="body3-regular" className="mt-1 text-muted-foreground">
          전문가 정보를 수정할 수 있어요
        </Text>
      </div>

      <ExpertProfileEditForm />
    </div>
  )
}
