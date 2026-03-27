"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog"
import { Button } from "@/shared/ui/button"
import { Text } from "@/shared/ui/text"

type LoginPromptModalProps = {
  isOpen: boolean
  onLogin: () => void
  onGoHome: () => void
}

export function LoginPromptModal({ isOpen, onLogin, onGoHome }: LoginPromptModalProps) {
  return (
    <Dialog open={isOpen}>
      <DialogContent
        className="[&>button:last-child]:hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            <Text typography="subtitle1-bold">로그인이 필요합니다</Text>
          </DialogTitle>
          <DialogDescription>
            <Text typography="body2-regular" className="text-muted-foreground">
              이 페이지를 이용하려면 로그인해주세요.
            </Text>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onGoHome}>
            홈으로 가기
          </Button>
          <Button onClick={onLogin}>로그인하기</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
