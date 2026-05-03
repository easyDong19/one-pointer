"use client"

import { useState } from "react"
import { useParams } from "next/navigation"

import { Button } from "@/shared/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog"
import { Input } from "@/shared/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select"
import { Text } from "@/shared/ui/text"

import { useCreateDisputeMutation } from "../model/use-create-dispute-mutation"
import { useEscrowPaymentByTicketQuery } from "../model/use-escrow-payment-by-ticket-query"

type Props = {
  isOpen: boolean
  ticketId: number
  onClose: () => void
}

const REASON_OPTIONS: ReadonlyArray<{ value: string; label: string }> = [
  { value: "WORK_NOT_STARTED", label: "작업 미시작" },
  { value: "WORK_INCOMPLETE", label: "작업 미완료" },
  { value: "WORK_QUALITY_ISSUE", label: "작업 품질 문제" },
  { value: "DEADLINE_EXCEEDED", label: "마감 초과" },
  { value: "COMMUNICATION_ISSUE", label: "소통 문제" },
  { value: "SCOPE_CHANGE", label: "범위 변경" },
  { value: "UNREASONABLE_REVISION", label: "부당한 수정요청" },
  { value: "OTHER", label: "기타" },
]

const MIN_DESCRIPTION_LEN = 20
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * docs/app/chat.md §7.5 — 분쟁 신청 다이얼로그.
 *
 * escrowPaymentId 는 마운트 시 getEscrowPaymentByTicket 으로 도출.
 * 증거 첨부 (evidences) 는 wave-3b 범위 밖 — 추후 PDF 업로드 통합 시 추가.
 */
export function DisputeCreateDialog({ isOpen, ticketId, onClose }: Props) {
  const params = useParams<{ roomId: string }>()
  const roomId = params.roomId

  const escrowQuery = useEscrowPaymentByTicketQuery(ticketId)
  const mutation = useCreateDisputeMutation(roomId)

  const [reasonCategory, setReasonCategory] = useState<string>("")
  const [description, setDescription] = useState("")
  const [contactEmail, setContactEmail] = useState("")

  const trimmedDesc = description.trim()
  const isEmailValid = EMAIL_RE.test(contactEmail.trim())
  const escrowPaymentId = escrowQuery.data?.id

  const canSubmit =
    !!reasonCategory &&
    trimmedDesc.length >= MIN_DESCRIPTION_LEN &&
    isEmailValid &&
    escrowPaymentId != null &&
    !mutation.isPending

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit || escrowPaymentId == null) return
    await mutation.mutateAsync({
      escrowPaymentId,
      reasonCategory,
      description: trimmedDesc,
      contactEmail: contactEmail.trim(),
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl md:p-8">
        <DialogHeader>
          <DialogTitle>분쟁 신청</DialogTitle>
        </DialogHeader>

        {escrowQuery.isLoading ? (
          <div className="flex flex-col gap-3 py-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-muted h-10 animate-pulse rounded-md" />
            ))}
          </div>
        ) : escrowQuery.isError || !escrowQuery.data ? (
          <div className="flex flex-col gap-4 py-6">
            <Text typography="body2-medium" className="text-muted-foreground text-center">
              결제 정보를 불러오지 못했어요. 잠시 후 다시 시도해주세요.
            </Text>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                닫기
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Field label="분쟁 사유" required>
              <Select value={reasonCategory} onValueChange={setReasonCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="사유 선택" />
                </SelectTrigger>
                <SelectContent>
                  {REASON_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field
              label="진술서"
              required
              hint={`${trimmedDesc.length}/${MIN_DESCRIPTION_LEN}자 이상`}
            >
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                placeholder="분쟁 상황과 사실관계를 자세히 적어주세요"
                className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:ring-[3px]"
              />
            </Field>

            <Field label="연락 이메일" required>
              <Input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="example@email.com"
                aria-invalid={
                  contactEmail.length > 0 && !isEmailValid ? true : undefined
                }
              />
            </Field>

            <Text typography="caption2-medium" className="text-muted-foreground">
              증거 자료 첨부는 운영팀 검토 단계에서 별도 안내드릴게요.
            </Text>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={mutation.isPending}
              >
                취소
              </Button>
              <Button type="submit" variant="destructive" disabled={!canSubmit}>
                {mutation.isPending ? "신청 중..." : "분쟁 신청"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string
  required?: boolean
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Text as="label" typography="caption2-medium">
        {label}
        {required && <span className="text-destructive"> *</span>}
        {hint && <span className="text-muted-foreground ml-1">({hint})</span>}
      </Text>
      {children}
    </div>
  )
}
