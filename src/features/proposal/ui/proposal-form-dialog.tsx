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
import { cn } from "@/shared/lib/utils"

import { formatPrice, parsePrice } from "@/features/agreement/lib/format-price"
import { useCreateProposalMutation } from "../model/use-create-proposal-mutation"
import {
  METHOD_LABEL,
  PROPOSED_DURATION_OPTIONS,
} from "../lib/proposal.constants"

type Method = "OFFLINE" | "ONLINE" | "BOTH"

type Props = {
  isOpen: boolean
  ticketId: number
  /** 의뢰의 ticketType 에 맞춘 기본값 */
  defaultMethod?: Method
  onClose: () => void
}

export function ProposalFormDialog({
  isOpen,
  ticketId,
  defaultMethod = "OFFLINE",
  onClose,
}: Props) {
  const createMutation = useCreateProposalMutation(ticketId)

  const [priceText, setPriceText] = useState("")
  const [proposedDuration, setProposedDuration] = useState<string>("")
  const [method, setMethod] = useState<Method>(defaultMethod)
  const [locationProposal, setLocationProposal] = useState("")
  const [onlineTool, setOnlineTool] = useState("")
  const [appeal, setAppeal] = useState("")

  const price = parsePrice(priceText)
  const isSubmitting = createMutation.isPending
  const showLocation = method === "OFFLINE" || method === "BOTH"
  const showOnlineTool = method === "ONLINE" || method === "BOTH"
  const canSubmit =
    price > 0 &&
    !isSubmitting &&
    (showLocation ? locationProposal.trim().length > 0 : true) &&
    (showOnlineTool ? onlineTool.trim().length > 0 : true)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return

    await createMutation.mutateAsync({
      ticketId,
      price,
      proposedDuration: proposedDuration ? (proposedDuration as never) : undefined,
      locationProposal: showLocation ? locationProposal.trim() : undefined,
      onlineTool: showOnlineTool ? onlineTool.trim() : undefined,
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

          <Field label="진행 방식" required>
            <div className="flex gap-2">
              {(["OFFLINE", "ONLINE", "BOTH"] as Method[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMethod(m)}
                  className={cn(
                    "flex-1 rounded-md border px-3 py-2 text-sm transition-colors",
                    method === m
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-input text-muted-foreground hover:bg-muted",
                  )}
                >
                  {METHOD_LABEL[m]}
                </button>
              ))}
            </div>
          </Field>

          {showLocation && (
            <Field label="장소 제안" required>
              <Input
                value={locationProposal}
                onChange={(e) => setLocationProposal(e.target.value)}
                placeholder="예: 강남역 인근 카페"
              />
            </Field>
          )}

          {showOnlineTool && (
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
