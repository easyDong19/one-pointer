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

type CertificationFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  certification?: Certification
  onSubmit: (data: { name: string; issuer: string }) => void
  isPending: boolean
}

export function CertificationFormDialog({
  open,
  onOpenChange,
  certification,
  onSubmit,
  isPending,
}: CertificationFormDialogProps) {
  const [name, setName] = useState(certification?.name ?? "")
  const [issuer, setIssuer] = useState(certification?.issuer ?? "")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onSubmit({ name, issuer })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              취소
            </Button>
            <Button type="submit" disabled={isPending || !name.trim()}>
              {isPending ? "저장 중..." : "저장"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
