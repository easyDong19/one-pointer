"use client"

import { useState } from "react"
import { Check } from "lucide-react"
import { Input } from "@/shared/ui/input"
import { Button } from "@/shared/ui/button"
import { Text } from "@/shared/ui/text"
import { useCheckNicknameMutation } from "@/features/mypage/profile-edit"

type NicknameInputProps = {
  value: string
  originalNickname: string
  onChange: (value: string) => void
  onCheckedChange: (checked: boolean) => void
  error?: string
}

export function NicknameInput({
  value,
  originalNickname,
  onChange,
  onCheckedChange,
  error,
}: NicknameInputProps) {
  const [checkStatus, setCheckStatus] = useState<"idle" | "available" | "duplicated">("idle")
  const checkMutation = useCheckNicknameMutation()

  const isUnchanged = value === originalNickname

  const handleChange = (newValue: string) => {
    onChange(newValue)
    setCheckStatus("idle")
    onCheckedChange(newValue === originalNickname)
  }

  const handleCheck = async () => {
    if (!value || value.length < 2) return

    try {
      const response = await checkMutation.mutateAsync(value)
      const isDuplicated = Object.values(response.data)[0]

      if (isDuplicated) {
        setCheckStatus("duplicated")
        onCheckedChange(false)
      } else {
        setCheckStatus("available")
        onCheckedChange(true)
      }
    } catch {
      setCheckStatus("idle")
      onCheckedChange(false)
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Text as="label" typography="body3-medium">
        닉네임
      </Text>
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="닉네임을 입력하세요"
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleCheck}
          disabled={checkMutation.isPending || isUnchanged || value.length < 2}
        >
          {checkMutation.isPending ? "확인중..." : "중복확인"}
        </Button>
      </div>

      {error && (
        <Text as="p" typography="caption2-medium" className="text-destructive">
          {error}
        </Text>
      )}

      {checkStatus === "available" && (
        <div className="flex items-center gap-1 text-emerald-600">
          <Check className="size-3.5" />
          <Text as="p" typography="caption2-medium">
            사용 가능한 닉네임입니다
          </Text>
        </div>
      )}

      {checkStatus === "duplicated" && (
        <Text as="p" typography="caption2-medium" className="text-destructive">
          이미 사용 중인 닉네임입니다
        </Text>
      )}
    </div>
  )
}
