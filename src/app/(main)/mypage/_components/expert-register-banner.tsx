"use client"

import Link from "next/link"
import { Sparkles } from "lucide-react"
import { Text } from "@/shared/ui/text"
import { Button } from "@/shared/ui/button"
import { useRoleStore } from "@/entities/user/model/role-store"
import { useExpertExistsQuery } from "@/features/mypage"

export function ExpertRegisterBanner() {
  const role = useRoleStore((s) => s.role)
  const { data: expertExists, isLoading } = useExpertExistsQuery()

  if (role !== "expert" || isLoading || expertExists) return null

  return (
    <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 to-chart-2/5 p-5">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="size-5 text-primary" />
          <Text as="p" typography="subtitle2-bold">
            전문가로 활동을 시작해보세요!
          </Text>
        </div>
        <Text as="p" typography="body3-regular" className="text-muted-foreground">
          지금 등록하면 의뢰를 받을 수 있어요
        </Text>
        <Button asChild size="sm" className="w-fit">
          <Link href="/mypage/expert-register">전문가 등록하기</Link>
        </Button>
      </div>
    </div>
  )
}
