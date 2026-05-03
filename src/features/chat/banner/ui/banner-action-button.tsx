"use client"

import { Slot } from "radix-ui"
import { toast } from "sonner"

import { cn } from "@/shared/lib/utils"

import { STUB_TOAST_MESSAGE, type BannerTone } from "../lib/banner.constants"

type Props = {
  tone: BannerTone
  children: React.ReactNode
  onClick?: () => void
  /**
   * true 면 Slot 으로 children 에 props 위임 — `<Link>` 같은 anchor 시멘틱이 필요할 때.
   * stub toast 자동 주입은 button 모드에서만 동작.
   */
  asChild?: boolean
}

export function BannerActionButton({
  tone,
  children,
  onClick,
  asChild = false,
}: Props) {
  const Comp = asChild ? Slot.Root : "button"
  const handleClick = asChild
    ? onClick
    : (onClick ?? (() => toast.info(STUB_TOAST_MESSAGE)))

  return (
    <Comp
      type="button"
      onClick={handleClick}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-md font-semibold transition-colors",
        "h-8 px-3 text-xs md:h-10 md:px-5 md:text-sm",
        TONE_CLASSES[tone],
      )}
    >
      {children}
    </Comp>
  )
}

const TONE_CLASSES: Record<BannerTone, string> = {
  primary: "bg-primary text-primary-foreground hover:bg-primary-hover",
  destructive: "bg-destructive text-destructive-foreground hover:opacity-90",
  warning: "bg-warning text-warning-foreground hover:opacity-90",
  info: "bg-muted text-muted-foreground hover:bg-muted/80",
}
