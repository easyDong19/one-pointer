import * as React from "react"
import { MessageCircle, Globe, Apple } from "lucide-react"
import { cn } from "@/shared/lib/utils"

type SocialProvider = "kakao" | "google" | "apple"

const SOCIAL_CONFIG: Record<
  SocialProvider,
  { label: string; icon: React.ReactNode; className: string }
> = {
  kakao: {
    label: "카카오로 계속하기",
    icon: <MessageCircle size={18} />,
    className: "bg-(--color-kakao-bg) text-(--color-kakao-fg) hover:brightness-95",
  },
  google: {
    label: "Google로 계속하기",
    icon: <Globe size={18} />,
    className: "bg-(--color-google-bg) text-(--color-google-fg) border border-(--color-google-border) hover:bg-neutral-50",
  },
  apple: {
    label: "Apple로 계속하기",
    icon: <Apple size={18} />,
    className: "bg-(--color-apple-bg) text-(--color-apple-fg) hover:brightness-110",
  },
}

type SocialLoginButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  provider: SocialProvider
}

function SocialLoginButton({ provider, className, ...props }: SocialLoginButtonProps) {
  const config = SOCIAL_CONFIG[provider]

  return (
    <button
      type="button"
      className={cn(
        "flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
        config.className,
        className,
      )}
      {...props}
    >
      {config.icon ? <span className="flex items-center">{config.icon}</span> : null}
      <span>{config.label}</span>
    </button>
  )
}

export { SocialLoginButton, type SocialProvider }
