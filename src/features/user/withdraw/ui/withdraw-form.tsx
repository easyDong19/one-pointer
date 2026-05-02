"use client"

import { useState } from "react"
import { Ban, Calendar, Trash2, XCircle } from "lucide-react"
import { Button } from "@/shared/ui/button"
import { Text } from "@/shared/ui/text"
import { cn } from "@/shared/lib/utils"
import { isApiError } from "@/shared/api/http/api-error"
import { openAlert } from "@/shared/lib/open-alert"
import { openConfirm } from "@/shared/lib/open-confirm-dialog"
import { useWithdrawMutation } from "../model/use-withdraw-mutation"

/**
 * 회원 탈퇴 폼.
 * 모바일 WithdrawView 와 1:1 매핑. 사유는 client-side 만 수집(BE 미전송).
 *
 * 명세: docs/.claude/plans/... (회원 탈퇴 기능 구현)
 */

const NOTICES = [
  {
    icon: XCircle,
    title: "모집 중인 의뢰 자동 취소",
    description:
      "진행 전(OPEN/IN_REVIEW) 의뢰는 자동 취소되며, 사용된 쿠폰은 반환됩니다.",
  },
  {
    icon: Ban,
    title: "진행 중인 거래가 있으면 탈퇴 불가",
    description:
      "매칭된 의뢰, 미정산 결제, 분쟁, 환불 요청이 있으면 탈퇴할 수 없습니다.",
  },
  {
    icon: Calendar,
    title: "2주간 재가입 제한",
    description: "탈퇴 후 동일 이메일로 2주간 재가입이 불가합니다.",
  },
  {
    icon: Trash2,
    title: "데이터 삭제",
    description: "프로필, 전문가 정보, 리뷰 등 개인 데이터가 삭제됩니다.",
  },
] as const

const PRESET_REASONS = [
  "더 이상 사용하지 않아요",
  "원하는 전문가를 찾지 못했어요",
  "서비스가 불편해요",
  "다른 서비스를 이용할 예정이에요",
] as const

const CUSTOM_REASON_INDEX = PRESET_REASONS.length

export function WithdrawForm() {
  const mutation = useWithdrawMutation()
  const [selectedReasonIndex, setSelectedReasonIndex] = useState<number | null>(
    null,
  )
  const [customReason, setCustomReason] = useState("")

  const handleSubmit = async () => {
    const ok = await openConfirm({
      title: "정말 탈퇴하시겠습니까?",
      description:
        "탈퇴 후에는 되돌릴 수 없으며, 2주간 동일 이메일로 재가입이 불가합니다.",
      confirmLabel: "탈퇴하기",
      cancelLabel: "계속 이용하기",
      variant: "destructive",
    })
    if (!ok) return

    try {
      await mutation.mutateAsync()
      // 성공 시 mutation onSuccess 가 router.replace("/login") + store 정리.
      // 별도 alert 없이 화면 전환 자체가 완료 시그널.
    } catch (error) {
      if (isApiError(error) && error.status === 409) {
        openAlert({
          variant: "warning",
          title: "탈퇴할 수 없습니다",
          description: error.message,
        })
      } else {
        openAlert({
          variant: "warning",
          title: "탈퇴 처리 중 오류가 발생했습니다.",
          description: error instanceof Error ? error.message : undefined,
        })
      }
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {/* 헤더 */}
      <div className="flex flex-col gap-1.5">
        <Text as="h1" typography="h2-bold" className="text-foreground">
          정말 떠나시나요?
        </Text>
        <Text
          as="p"
          typography="body3-regular"
          className="text-muted-foreground"
        >
          탈퇴 전 아래 내용을 꼭 확인해주세요.
        </Text>
      </div>

      {/* Notice 섹션 */}
      <div className="border-destructive/15 bg-destructive/[0.04] flex flex-col gap-4 rounded-xl border p-5">
        {NOTICES.map((notice) => {
          const Icon = notice.icon
          return (
            <div key={notice.title} className="flex items-start gap-3">
              <div className="bg-destructive/10 flex size-8 shrink-0 items-center justify-center rounded-full">
                <Icon className="text-destructive size-4" />
              </div>
              <div className="flex flex-1 flex-col gap-0.5">
                <Text as="p" typography="body3-bold" className="text-foreground">
                  {notice.title}
                </Text>
                <Text
                  as="p"
                  typography="caption1-medium"
                  className="text-muted-foreground leading-[1.5]"
                >
                  {notice.description}
                </Text>
              </div>
            </div>
          )
        })}
      </div>

      {/* 사유 (선택) */}
      <div className="flex flex-col gap-3">
        <Text as="p" typography="body3-bold" className="text-foreground">
          탈퇴 사유 (선택)
        </Text>
        <div className="flex flex-col gap-2">
          {PRESET_REASONS.map((label, index) => (
            <ReasonOption
              key={label}
              label={label}
              selected={selectedReasonIndex === index}
              onSelect={() => setSelectedReasonIndex(index)}
            />
          ))}
          <ReasonOption
            label="직접 입력"
            selected={selectedReasonIndex === CUSTOM_REASON_INDEX}
            onSelect={() => setSelectedReasonIndex(CUSTOM_REASON_INDEX)}
          />
          {selectedReasonIndex === CUSTOM_REASON_INDEX && (
            <textarea
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              rows={3}
              placeholder="탈퇴 사유를 입력해주세요"
              className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 mt-1 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:ring-[3px]"
            />
          )}
        </div>
      </div>

      {/* 제출 */}
      <Button
        type="button"
        variant="destructive"
        size="lg"
        className="w-full"
        onClick={handleSubmit}
        disabled={mutation.isPending}
      >
        <Text as="span" typography="body3-medium">
          {mutation.isPending ? "처리 중..." : "회원탈퇴"}
        </Text>
      </Button>
    </div>
  )
}

function ReasonOption({
  label,
  selected,
  onSelect,
}: {
  label: string
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full items-center gap-3 rounded-md border px-4 py-3.5 text-left transition-colors",
        selected
          ? "border-destructive/40 bg-destructive/5"
          : "border-border bg-card hover:bg-muted/50",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "block size-5 shrink-0 rounded-full border-2",
          selected
            ? "border-destructive bg-destructive ring-background ring-2 ring-inset"
            : "border-neutral-300",
        )}
      />
      <Text
        as="span"
        typography="body3-medium"
        className={selected ? "text-destructive" : "text-foreground"}
      >
        {label}
      </Text>
    </button>
  )
}
