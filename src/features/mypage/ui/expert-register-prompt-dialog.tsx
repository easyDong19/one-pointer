"use client"

import { Button } from "@/shared/ui/button"
import { Text } from "@/shared/ui/text"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/ui/dialog"

type ExpertRegisterPromptDialogProps = {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ExpertRegisterPromptDialog({
  isOpen,
  onConfirm,
  onCancel,
}: ExpertRegisterPromptDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent showCloseButton={false} className="max-w-sm">
        <DialogHeader>
          <DialogTitle>
            <Text as="span" typography="subtitle1-bold">
              전문가 등록이 필요합니다
            </Text>
          </DialogTitle>
          <DialogDescription>
            전문가로 활동하려면 먼저 전문가 등록을 완료해주세요.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            취소
          </Button>
          <Button onClick={onConfirm}>전문가 등록하기</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
