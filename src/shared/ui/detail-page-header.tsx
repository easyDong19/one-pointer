"use client"

import { useRouter } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import { cn } from "@/shared/lib/utils"
import { Text } from "@/shared/ui/text"

interface DetailPageHeaderProps {
  title: string
  /** 우측 액션 영역. 미지정 시 빈 공간으로 좌우 균형 유지 */
  rightAction?: React.ReactNode
  /** 뒤로가기 동작 오버라이드. 미지정 시 router.back() */
  onBack?: () => void
  /** 추가 className (예: 데스크탑에서도 표시하려면 lg:hidden 제거 필요) */
  className?: string
}

export function DetailPageHeader({
  title,
  rightAction,
  onBack,
  className,
}: DetailPageHeaderProps) {
  const router = useRouter()

  return (
    <header className={cn("bg-background border-border sticky top-0 z-40 flex items-center justify-between border-b px-4 py-3 lg:hidden", className)}>
      <button
        onClick={onBack ?? (() => router.back())}
        className="flex h-9 w-9 items-center justify-center"
      >
        <ChevronLeft className="text-foreground h-5 w-5" />
      </button>
      <Text as="h1" typography="body1-bold" className="text-foreground">
        {title}
      </Text>
      {rightAction ?? <div className="w-9" />}
    </header>
  )
}
