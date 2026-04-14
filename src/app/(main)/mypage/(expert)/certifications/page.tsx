"use client"

import { Text } from "@/shared/ui/text"
import { CertificationList } from "./_components/certification-list"

export default function CertificationsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Text as="h1" typography="h3-bold">
          자격증 관리
        </Text>
        <Text as="p" typography="body3-regular" className="mt-1 text-muted-foreground">
          보유한 자격증을 등록하고 관리하세요
        </Text>
      </div>

      <CertificationList />
    </div>
  )
}
