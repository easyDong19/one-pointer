"use client"

import { useState } from "react"
import { Input } from "@/shared/ui/input"
import { Button } from "@/shared/ui/button"
import { Text } from "@/shared/ui/text"
import { ResponsiveAlert } from "@/shared/ui/responsive-alert"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select"
import { BANK_CODES } from "@/shared/data/bank-codes"
import { useMyExpertProfileQuery } from "@/features/mypage/expert-profile"
import { useUpdateBankAccountMutation } from "@/features/mypage/bank-account"

export function BankAccountForm() {
  const { data: profile } = useMyExpertProfileQuery()
  const mutation = useUpdateBankAccountMutation()

  // Expert profile에 bankCode 등이 있을 수 있으므로 as로 접근
  const expertData = profile as Record<string, unknown> | undefined
  const [bankCode, setBankCode] = useState((expertData?.bankCode as string) ?? "")
  const [accountNumber, setAccountNumber] = useState(
    (expertData?.accountNumber as string) ?? "",
  )
  const [accountHolder, setAccountHolder] = useState(
    (expertData?.accountHolder as string) ?? "",
  )

  const [alertOpen, setAlertOpen] = useState(false)
  const [alertConfig, setAlertConfig] = useState<{
    variant: "success" | "warning"
    title: string
    description?: string
  }>({ variant: "success", title: "" })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!bankCode) {
      setAlertConfig({ variant: "warning", title: "은행을 선택해주세요." })
      setAlertOpen(true)
      return
    }
    if (!accountNumber.trim()) {
      setAlertConfig({ variant: "warning", title: "계좌번호를 입력해주세요." })
      setAlertOpen(true)
      return
    }
    if (!/^\d+$/.test(accountNumber)) {
      setAlertConfig({ variant: "warning", title: "계좌번호는 숫자만 입력해주세요." })
      setAlertOpen(true)
      return
    }
    if (!accountHolder.trim()) {
      setAlertConfig({ variant: "warning", title: "예금주를 입력해주세요." })
      setAlertOpen(true)
      return
    }

    try {
      await mutation.mutateAsync({ bankCode, accountNumber, accountHolder })
      setAlertConfig({ variant: "success", title: "정산계좌가 저장되었습니다." })
      setAlertOpen(true)
    } catch {
      setAlertConfig({ variant: "warning", title: "저장에 실패했습니다." })
      setAlertOpen(true)
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <Text as="label" typography="body3-medium">
            은행 <span className="text-destructive">*</span>
          </Text>
          <Select value={bankCode} onValueChange={setBankCode}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="은행 선택" />
            </SelectTrigger>
            <SelectContent>
              {BANK_CODES.map((bank) => (
                <SelectItem key={bank.code} value={bank.code}>
                  {bank.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Text as="label" typography="body3-medium">
            계좌번호 <span className="text-destructive">*</span>
          </Text>
          <Input
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            inputMode="numeric"
            placeholder="- 없이 숫자만 입력"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Text as="label" typography="body3-medium">
            예금주 <span className="text-destructive">*</span>
          </Text>
          <Input
            value={accountHolder}
            onChange={(e) => setAccountHolder(e.target.value)}
            placeholder="예금주명"
          />
        </div>

        <Button type="submit" className="w-full" disabled={mutation.isPending}>
          <Text as="span" typography="body3-medium">
            {mutation.isPending ? "저장 중..." : "저장하기"}
          </Text>
        </Button>
      </form>

      <ResponsiveAlert
        open={alertOpen}
        onOpenChange={setAlertOpen}
        variant={alertConfig.variant}
        title={alertConfig.title}
        description={alertConfig.description}
      />
    </>
  )
}
