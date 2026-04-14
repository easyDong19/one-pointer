"use client"

import { useRouter } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import { cn } from "@/shared/lib/utils"
import { Text } from "@/shared/ui/text"

/* ─── Root ─────────────────────────────────────────────────────────────────── */

function MobileHeaderRoot({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 flex items-center justify-between border-b border-border bg-background px-4 py-3 md:hidden",
        className,
      )}
    >
      {children}
    </header>
  )
}

/* ─── BackButton ──────────────────────────────────────────────────────────── */

function BackButton({ onBack }: { onBack?: () => void }) {
  const router = useRouter()

  return (
    <button
      onClick={onBack ?? (() => router.back())}
      className="flex h-9 w-9 items-center justify-center"
    >
      <ChevronLeft className="h-5 w-5 text-foreground" />
    </button>
  )
}

/* ─── Title ───────────────────────────────────────────────────────────────── */

function Title({ children }: { children: React.ReactNode }) {
  return (
    <Text as="h1" typography="body1-bold" className="text-foreground">
      {children}
    </Text>
  )
}

/* ─── Action ──────────────────────────────────────────────────────────────── */

function Action({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

/* ─── Spacer (좌우 균형용 빈 div) ─────────────────────────────────────────── */

function Spacer() {
  return <div className="w-9" />
}

/* ─── Export ───────────────────────────────────────────────────────────────── */

export const MobileHeader = Object.assign(MobileHeaderRoot, {
  BackButton,
  Title,
  Action,
  Spacer,
})
