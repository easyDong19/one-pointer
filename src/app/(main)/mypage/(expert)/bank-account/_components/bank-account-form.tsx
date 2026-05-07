"use client"

import { useState } from "react"
import { Info, Landmark, Loader2 } from "lucide-react"

import { BANK_CODES, getBankName } from "@/shared/data/bank-codes"
import { Input } from "@/shared/ui/input"
import { Button } from "@/shared/ui/button"
import { Text } from "@/shared/ui/text"
import { Badge } from "@/shared/ui/badge"
import { openAlert } from "@/shared/lib/open-alert"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select"
import { useMyExpertProfileQuery } from "@/features/mypage/expert-profile"
import { useUpdateBankAccountMutation } from "@/features/mypage/bank-account"
import type { MyExpertProfile } from "@/entities/user/api/user.schema"

function maskAccountNumber(num: string) {
  if (num.length <= 4) return num
  return "****" + num.slice(-4)
}

export function BankAccountForm() {
  const { data: profile, isLoading: isProfileLoading } = useMyExpertProfileQuery()

  if (isProfileLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="text-primary h-7 w-7 animate-spin" />
      </div>
    )
  }

  return <BankAccountFormInner bankAccount={profile?.bankAccount} />
}

function BankAccountFormInner({
  bankAccount,
}: {
  bankAccount: MyExpertProfile["bankAccount"]
}) {
  const mutation = useUpdateBankAccountMutation()

  const [bankCode, setBankCode] = useState(bankAccount?.bankCode ?? "")
  const [accountNumber, setAccountNumber] = useState(bankAccount?.accountNumber ?? "")
  const [accountHolder, setAccountHolder] = useState(bankAccount?.accountHolder ?? "")

  const hasExisting = !!(bankCode && accountNumber)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!bankCode) {
      openAlert({ variant: "warning", title: "은행을 선택해주세요." })
      return
    }
    if (!accountNumber.trim()) {
      openAlert({ variant: "warning", title: "계좌번호를 입력해주세요." })
      return
    }
    if (!/^\d+$/.test(accountNumber)) {
      openAlert({ variant: "warning", title: "계좌번호는 숫자만 입력해주세요." })
      return
    }
    if (!accountHolder.trim()) {
      openAlert({ variant: "warning", title: "예금주를 입력해주세요." })
      return
    }

    try {
      await mutation.mutateAsync({ bankCode, accountNumber, accountHolder })
      openAlert({ variant: "success", title: "정산계좌가 저장되었습니다." })
    } catch {
      openAlert({ variant: "warning", title: "저장에 실패했습니다." })
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* 안내 배너 */}
      <div className="bg-primary/5 border-primary/20 rounded-xl border p-4">
        <div className="mb-1.5 flex items-center gap-2">
          <Info className="text-primary h-4 w-4 shrink-0" />
          <Text typography="body3-bold" className="text-primary">
            정산 계좌 안내
          </Text>
        </div>
        <Text typography="caption1-medium" className="text-muted-foreground leading-relaxed">
          온라인 거래 완료 시, 아래 등록된 계좌로 정산 금액이 입금됩니다.
          정확한 정보를 입력해주세요.
        </Text>
      </div>

      {/* 미리보기 카드 */}
      <div className="bg-card border-border rounded-xl border p-5 shadow-sm">
        {hasExisting ? (
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <Text typography="body2-bold" className="text-foreground">
                {getBankName(bankCode)}
              </Text>
              <Text
                typography="caption1-medium"
                className="text-muted-foreground tabular-nums tracking-widest"
              >
                {maskAccountNumber(accountNumber)}
              </Text>
            </div>
            {accountHolder && (
              <Badge variant="secondary">{accountHolder}</Badge>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-4">
            <Landmark className="text-muted-foreground/40 h-8 w-8" />
            <Text typography="body3-medium" className="text-muted-foreground">
              등록된 계좌가 없습니다
            </Text>
          </div>
        )}
      </div>

      {/* 폼 섹션 */}
      <div className="bg-card border-border rounded-xl border p-5 shadow-sm">
        <Text typography="subtitle2-bold" className="text-foreground mb-4">
          계좌 정보 입력
        </Text>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Text as="label" typography="body3-medium">
              은행 <span className="text-destructive">*</span>
            </Text>
            <Select
              value={bankCode}
              onValueChange={setBankCode}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="은행을 선택해주세요" />
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
              placeholder="예금주명을 입력해주세요"
            />
          </div>

          <Button
            type="submit"
            size="lg"
            className="mt-2 w-full"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                저장 중...
              </>
            ) : (
              "저장하기"
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
