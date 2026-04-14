"use client"

import { Text } from "@/shared/ui/text"
import { BankAccountForm } from "./_components/bank-account-form"

export default function BankAccountPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Text as="h1" typography="h3-bold">
          정산계좌 관리
        </Text>
        <Text as="p" typography="body3-regular" className="mt-1 text-muted-foreground">
          수익 정산에 사용할 계좌 정보를 관리하세요
        </Text>
      </div>

      <BankAccountForm />
    </div>
  )
}
