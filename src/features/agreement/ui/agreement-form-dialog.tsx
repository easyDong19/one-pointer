"use client"

import { useState } from "react"
import { CalendarIcon } from "lucide-react"
import { useParams } from "next/navigation"

import { Button } from "@/shared/ui/button"
import { Calendar } from "@/shared/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog"
import { Input } from "@/shared/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover"
import { Text } from "@/shared/ui/text"
import { cn } from "@/shared/lib/utils"

import { formatPrice, parsePrice } from "../lib/format-price"
import {
  formatDeadlineKR,
  parseServerDeadline,
  toServerDeadline,
} from "../lib/format-deadline"
import { useAgreementByTicketQuery } from "../model/use-agreement-by-ticket-query"
import { useCreateAgreementMutation } from "../model/use-create-agreement-mutation"
import { useReproposeAgreementMutation } from "../model/use-repropose-agreement-mutation"

type Props = {
  isOpen: boolean
  ticketId: number
  mode: "create" | "repropose"
  /** repropose 모드에서 거절된 이전 합의서 id */
  agreementId?: number
  onClose: () => void
}

const today = (() => {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
})()

/**
 * 합의서 작성·재제안 공용 폼 다이얼로그.
 *
 * `mode === "repropose"` 일 때 마운트 시 `getAgreementByTicket` 으로 이전 안 prefill
 * (한 번만 — 사용자 입력 덮지 않음).
 */
export function AgreementFormDialog({
  isOpen,
  ticketId,
  mode,
  agreementId,
  onClose,
}: Props) {
  const params = useParams<{ roomId: string }>()
  const roomId = params.roomId

  const prefillQuery = useAgreementByTicketQuery(
    mode === "repropose" ? ticketId : null,
  )
  const createMutation = useCreateAgreementMutation(roomId)
  const reproposeMutation = useReproposeAgreementMutation(roomId)

  const [priceText, setPriceText] = useState("")
  const [deadline, setDeadline] = useState<Date | undefined>(undefined)
  const [scope, setScope] = useState("")
  const [maxRevisions, setMaxRevisions] = useState("2")
  const [deliveryFormat, setDeliveryFormat] = useState("")
  const [isPrefilled, setIsPrefilled] = useState(false)

  // repropose 모드에서 기존 합의서 데이터 도착 시 폼을 1회 prefill.
  // effect 대신 렌더 중 가드 패턴 사용 — isPrefilled 로 1회만 실행되며 즉시 수렴한다.
  if (mode === "repropose" && !isPrefilled && prefillQuery.data) {
    const data = prefillQuery.data
    if (data.finalPrice != null) setPriceText(formatPrice(data.finalPrice))
    if (data.workDeadline) setDeadline(parseServerDeadline(data.workDeadline))
    if (data.scope) setScope(data.scope)
    if (data.maxRevisions != null) setMaxRevisions(String(data.maxRevisions))
    if (data.deliveryFormat) setDeliveryFormat(data.deliveryFormat)
    setIsPrefilled(true)
  }

  const finalPrice = parsePrice(priceText)
  const isSubmitting = createMutation.isPending || reproposeMutation.isPending
  const canSubmit = finalPrice > 0 && deadline != null && !isSubmitting
  const isLoadingPrefill = mode === "repropose" && prefillQuery.isLoading

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPriceText(formatPrice(e.target.value))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit || !deadline) return

    const baseInput = {
      finalPrice,
      workDeadline: toServerDeadline(deadline),
      scope: scope.trim() || undefined,
      maxRevisions: maxRevisions ? Number(maxRevisions) : undefined,
      deliveryFormat: deliveryFormat.trim() || undefined,
    }

    if (mode === "repropose") {
      if (agreementId == null) {
        console.error("[agreement-form] repropose without agreementId")
        return
      }
      await reproposeMutation.mutateAsync({ id: agreementId, input: baseInput })
    } else {
      await createMutation.mutateAsync({ ticketId, ...baseInput })
    }
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl md:p-8">
        <DialogHeader>
          <DialogTitle>
            {mode === "repropose" ? "합의서 재제안" : "합의서 작성"}
          </DialogTitle>
        </DialogHeader>

        {isLoadingPrefill ? (
          <div className="flex flex-col gap-4 py-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-muted h-10 animate-pulse rounded-md" />
            ))}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Field label="최종 금액" required>
              <div className="flex items-center gap-2">
                <Input
                  value={priceText}
                  onChange={handlePriceChange}
                  inputMode="numeric"
                  placeholder="0"
                  className="tabular-nums"
                />
                <Text typography="caption1-medium" className="text-muted-foreground shrink-0">
                  원
                </Text>
              </div>
            </Field>

            <Field label="작업 마감일" required>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !deadline && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {deadline ? formatDeadlineKR(deadline) : "날짜 선택"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={deadline}
                    onSelect={setDeadline}
                    disabled={(d) => d < today}
                  />
                </PopoverContent>
              </Popover>
            </Field>

            <Field label="작업 범위">
              <textarea
                value={scope}
                onChange={(e) => setScope(e.target.value)}
                rows={3}
                placeholder="작업 범위를 적어주세요"
                className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:ring-[3px]"
              />
            </Field>

            <Field label="수정 가능 횟수">
              <Input
                type="number"
                min={0}
                value={maxRevisions}
                onChange={(e) => setMaxRevisions(e.target.value)}
                className="tabular-nums"
              />
            </Field>

            <Field label="납품 형식">
              <Input
                value={deliveryFormat}
                onChange={(e) => setDeliveryFormat(e.target.value)}
                placeholder="예: PDF, ZIP"
              />
            </Field>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                취소
              </Button>
              <Button type="submit" disabled={!canSubmit}>
                {isSubmitting
                  ? "전송 중..."
                  : mode === "repropose"
                    ? "재제안"
                    : "작성 완료"}
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
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Text as="label" typography="caption2-medium">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Text>
      {children}
    </div>
  )
}
