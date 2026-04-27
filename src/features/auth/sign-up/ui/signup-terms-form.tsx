"use client"

import Link from "next/link"
import type { UseFormReturn } from "react-hook-form"
import { ChevronRight } from "lucide-react"
import { Button } from "@/shared/ui/button"
import { Checkbox } from "@/shared/ui/checkbox"
import { Separator } from "@/shared/ui/separator"
import { Text } from "@/shared/ui/text"
import type { SignupFormData } from "@/entities/auth/api/auth.schema"

type SignupTermsFormProps = {
  form: UseFormReturn<SignupFormData>
  isPending: boolean
}

const TERMS_ITEMS = [
  { key: "termsOfService" as const, label: "서비스 이용약관 동의", required: true, href: "/terms" },
  { key: "privacyPolicy" as const, label: "개인정보 수집 및 이용 동의", required: true, href: "/privacy" },
  { key: "chatReviewAgreed" as const, label: "채팅 내역 리뷰 활용 동의", required: true, href: "/policies/chat-review" },
  { key: "marketingConsent" as const, label: "마케팅 정보 수신 동의", required: false, href: "/policies/marketing" },
] as const

type TermsKey = (typeof TERMS_ITEMS)[number]["key"]

export function SignupTermsForm({ form, isPending }: SignupTermsFormProps) {
  const { watch, setValue } = form

  const termsValues = watch([
    "termsOfService",
    "privacyPolicy",
    "chatReviewAgreed",
    "marketingConsent",
  ])

  const allChecked = termsValues.every(Boolean)

  const handleToggleAll = () => {
    const next = !allChecked
    TERMS_ITEMS.forEach((item) => setValue(item.key, next))
  }

  const handleToggleItem = (key: TermsKey) => {
    setValue(key, !watch(key))
  }

  const requiredChecked = TERMS_ITEMS.filter((item) => item.required).every(
    (item) => watch(item.key),
  )

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Text as="h2" typography="h2-bold">
          서비스 이용을 위해
        </Text>
        <Text as="h2" typography="h2-bold">
          약관에 동의해주세요.
        </Text>
      </div>

      {/* 전체 동의 */}
      <div className="flex flex-col gap-4">
        <div
          role="button"
          tabIndex={0}
          onClick={handleToggleAll}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleToggleAll() }}
          className="bg-neutral-50 flex cursor-pointer items-center gap-3 rounded-xl px-4 py-4"
        >
          <Checkbox
            checked={allChecked}
            onCheckedChange={handleToggleAll}
            className="size-6 rounded-full"
          />
          <Text as="span" typography="subtitle1-bold">
            전체 동의
          </Text>
        </div>

        <Separator />

        {/* 개별 약관 */}
        <div className="flex flex-col gap-3">
          {TERMS_ITEMS.map((item) => (
            <div key={item.key} className="flex items-center justify-between">
              <div
                role="button"
                tabIndex={0}
                onClick={() => handleToggleItem(item.key)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleToggleItem(item.key) }}
                className="flex cursor-pointer items-center gap-3"
              >
                <Checkbox
                  checked={watch(item.key)}
                  onCheckedChange={() => handleToggleItem(item.key)}
                  className="size-6 rounded-full"
                />
                <Text as="span" typography="body2-regular">
                  {item.label}{" "}
                  <span className={item.required ? "text-primary" : "text-muted-foreground"}>
                    ({item.required ? "필수" : "선택"})
                  </span>
                </Text>
              </div>
              <Link
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${item.label} 보기 (새 탭)`}
                className="text-muted-foreground hover:text-foreground p-1 transition-colors"
              >
                <ChevronRight size={20} />
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* 가입하기 버튼 */}
      <Button
        type="submit"
        className="mt-4 h-14 w-full rounded-2xl text-base font-medium"
        disabled={!requiredChecked || isPending}
      >
        {isPending ? "가입 중..." : "가입하기"}
      </Button>
    </div>
  )
}
