"use client"

import { useState } from "react"

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

import { formatPrice, parsePrice } from "@/features/agreement/lib/format-price"
import { useCreateProposalMutation } from "../model/use-create-proposal-mutation"
import { PROPOSED_DURATION_OPTIONS } from "../lib/proposal.constants"

type Props = {
  isOpen: boolean
  ticketId: number
  /**
   * 의뢰의 ticketType. 노출 필드와 검증 규칙이 이 값으로 결정된다.
   *
   * - `ONLINE` → `onlineTool` 만 노출 (필수)
   * - `OFFLINE` → `locationProposal` 만 노출 (선택)
   *
   * 모바일(ProposalCreateController) 과 동일한 도메인 규칙. 제안자가 별도로 진행
   * 방식을 선택하는 자유도는 없다 — 의뢰의 ticketType 으로 완전히 결정된다.
   * 자세한 경위는 `docs/bug-fix/proposal-form-method-picker.md` 참조.
   */
  ticketType: "OFFLINE" | "ONLINE"
  onClose: () => void
}

export function ProposalFormDialog({
  isOpen,
  ticketId,
  ticketType,
  onClose,
}: Props) {
  const createMutation = useCreateProposalMutation(ticketId)

  const [priceText, setPriceText] = useState("")
  const [proposedDuration, setProposedDuration] = useState<string>("")
  const [locationProposal, setLocationProposal] = useState("")
  const [onlineTool, setOnlineTool] = useState("")
  const [appeal, setAppeal] = useState("")

  const isOnline = ticketType === "ONLINE"
  const isOffline = ticketType === "OFFLINE"
  const price = parsePrice(priceText)
  const isSubmitting = createMutation.isPending
  const canSubmit =
    price > 0 &&
    !isSubmitting &&
    // ONLINE 의뢰면 onlineTool 필수, OFFLINE 의뢰면 locationProposal 은 선택사항
    (isOnline ? onlineTool.trim().length > 0 : true)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return

    await createMutation.mutateAsync({
      ticketId,
      price,
      proposedDuration: proposedDuration ? (proposedDuration as never) : undefined,
      locationProposal:
        isOffline && locationProposal.trim().length > 0
          ? locationProposal.trim()
          : undefined,
      onlineTool:
        isOnline && onlineTool.trim().length > 0 ? onlineTool.trim() : undefined,
      appeal: appeal.trim() || undefined,
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl md:p-8">
        <DialogHeader>
          <DialogTitle>제안서 작성</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="제안 금액" required>
            <div className="flex items-center gap-2">
              <Input
                value={priceText}
                onChange={(e) => setPriceText(formatPrice(e.target.value))}
                inputMode="numeric"
                placeholder="0"
                className="tabular-nums"
              />
              <Text typography="caption1-medium" className="text-muted-foreground shrink-0">
                원
              </Text>
            </div>
          </Field>

          <Field label="소요 시간">
            <Select value={proposedDuration} onValueChange={setProposedDuration}>
              <SelectTrigger>
                <SelectValue placeholder="소요 시간을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {PROPOSED_DURATION_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          {isOffline && (
            <Field label="장소 제안">
              <Input
                value={locationProposal}
                onChange={(e) => setLocationProposal(e.target.value)}
                placeholder="예: 강남역 인근 카페"
              />
            </Field>
          )}

          {isOnline && (
            <Field label="온라인 도구" required>
              <Input
                value={onlineTool}
                onChange={(e) => setOnlineTool(e.target.value)}
                placeholder="예: Zoom, Google Meet"
              />
            </Field>
          )}

          <Field label="자기 어필">
            <textarea
              value={appeal}
              onChange={(e) => setAppeal(e.target.value)}
              rows={4}
              placeholder="이 의뢰에 적합한 이유, 경력, 강점 등을 적어주세요"
              className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:ring-[3px]"
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
              {isSubmitting ? "전송 중..." : "제안서 보내기"}
            </Button>
          </DialogFooter>
        </form>
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
