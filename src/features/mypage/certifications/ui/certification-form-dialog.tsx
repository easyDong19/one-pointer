"use client"

import { useState } from "react"
import { Input } from "@/shared/ui/input"
import { Button } from "@/shared/ui/button"
import { Text } from "@/shared/ui/text"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/ui/dialog"
import type { z } from "zod/v4"
import type { expertCertificationSchema } from "@/entities/expert/api/expert.schema"

type Certification = z.infer<typeof expertCertificationSchema>

export type CertificationFormData = {
  name: string
  issuer: string
}

type CertificationFormDialogProps = {
  isOpen: boolean
  certification?: Certification
  onSubmit: (data: CertificationFormData) => void
  onClose: () => void
}

/**
 * 자격증 추가/편집 다이얼로그.
 * 직접 마운트하지 말고 `@/features/mypage/certifications` 의 `openCertificationForm()` 으로 호출한다.
 */
export function CertificationFormDialog({
  isOpen,
  certification,
  onSubmit,
  onClose,
}: CertificationFormDialogProps) {
  const [name, setName] = useState(certification?.name ?? "")
  const [issuer, setIssuer] = useState(certification?.issuer ?? "")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onSubmit({ name, issuer })
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {certification ? "자격증 편집" : "자격증 추가"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Text as="label" typography="caption2-medium">
              자격증명 <span className="text-destructive">*</span>
            </Text>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 정보처리기사"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Text as="label" typography="caption2-medium">
              발급기관
            </Text>
            <Input
              value={issuer}
              onChange={(e) => setIssuer(e.target.value)}
              placeholder="예: 한국산업인력공단"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              저장
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
