"use client"

import { Text } from "@/shared/ui/text"
import { ExpertRegisterForm } from "./_components/expert-register-form"

export default function ExpertRegisterPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Text as="h1" typography="h3-bold">
          전문가 등록
        </Text>
        <Text as="p" typography="body3-regular" className="mt-1 text-muted-foreground">
          전문가로 등록하고 의뢰를 받아보세요
        </Text>
      </div>

      <ExpertRegisterForm />
    </div>
  )
}
