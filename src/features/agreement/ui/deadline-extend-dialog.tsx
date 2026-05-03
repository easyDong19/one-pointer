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
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover"
import { Text } from "@/shared/ui/text"
import { cn } from "@/shared/lib/utils"

import {
  formatDeadlineKR,
  parseServerDeadline,
  toServerDeadline,
} from "../lib/format-deadline"
import { useAgreementByTicketQuery } from "../model/use-agreement-by-ticket-query"
import { useUpdateAgreementDeadlineMutation } from "../model/use-update-agreement-deadline-mutation"

type Props = {
  isOpen: boolean
  ticketId: number
  onClose: () => void
}

/**
 * docs/app/chat.md §7.6 — DEADLINE_OVERDUE_CLIENT 의 "마감 연장" 버튼 진입.
 *
 * 합의서를 1회 fetch 해서 현재 마감일 표시 + 그 이후 날짜만 선택 가능 (§9.10 정신).
 */
export function DeadlineExtendDialog({ isOpen, ticketId, onClose }: Props) {
  const params = useParams<{ roomId: string }>()
  const roomId = params.roomId

  const query = useAgreementByTicketQuery(ticketId)
  const mutation = useUpdateAgreementDeadlineMutation(roomId)

  const [newDeadline, setNewDeadline] = useState<Date | undefined>(undefined)

  const agreement = query.data
  const currentDeadline = agreement?.workDeadline
    ? parseServerDeadline(agreement.workDeadline)
    : null

  // 새 마감일은 현재 마감일 이후만 선택 가능
  const minDate = currentDeadline ?? new Date()

  const canSubmit =
    newDeadline != null && agreement != null && !mutation.isPending

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit || !newDeadline || !agreement) return
    await mutation.mutateAsync({
      id: agreement.id,
      input: { workDeadline: toServerDeadline(newDeadline) },
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md md:p-8">
        <DialogHeader>
          <DialogTitle>마감일 연장</DialogTitle>
        </DialogHeader>

        {query.isLoading ? (
          <div className="flex flex-col gap-3 py-6">
            <div className="bg-muted h-8 animate-pulse rounded-md" />
            <div className="bg-muted h-32 animate-pulse rounded-md" />
          </div>
        ) : query.isError || !agreement ? (
          <div className="py-6 text-center">
            <Text typography="body2-medium" className="text-muted-foreground">
              합의서 정보를 불러오지 못했어요.
            </Text>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {currentDeadline && (
              <div className="flex flex-col gap-1.5">
                <Text typography="caption2-medium" className="text-muted-foreground">
                  현재 마감일
                </Text>
                <Text typography="body2-medium">
                  {formatDeadlineKR(currentDeadline)}
                </Text>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <Text as="label" typography="caption2-medium">
                새 마감일 <span className="text-destructive">*</span>
              </Text>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !newDeadline && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newDeadline ? formatDeadlineKR(newDeadline) : "날짜 선택"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={newDeadline}
                    onSelect={setNewDeadline}
                    disabled={(d) => d <= minDate}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={mutation.isPending}
              >
                취소
              </Button>
              <Button type="submit" disabled={!canSubmit}>
                {mutation.isPending ? "변경 중..." : "변경"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
