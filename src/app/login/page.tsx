"use client"

import { useState } from "react"
import { Target, MessageCircle, Lock } from "lucide-react"
import { LoginForm } from "@/features/auth/sign-in/ui/login-form"
import { resolveNextPath } from "@/shared/lib/redirect"
import { Text } from "@/shared/ui/text"

export default function LoginPage() {
  const [nextPath] = useState(() => {
    if (typeof window === "undefined") return "/"
    const params = new URLSearchParams(window.location.search)
    return resolveNextPath(params.get("next"))
  })

  return (
    <main className="flex min-h-dvh flex-col md:flex-row">
      {/* 데스크탑 전용: 좌측 브랜드 패널 */}
      <div className="hidden md:flex md:w-1/2 lg:w-[55%] relative flex-col items-center justify-center overflow-hidden bg-primary">
        {/* 배경 장식 원 */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute -bottom-24 -right-16 w-80 h-80 rounded-full bg-white/5" />
        <div className="absolute top-1/3 right-8 w-48 h-48 rounded-full bg-white/5" />
        <div className="absolute bottom-1/3 left-8 w-32 h-32 rounded-full bg-white/10" />

        {/* 메인 콘텐츠 */}
        <div className="relative z-10 flex flex-col items-center gap-op-3xl px-12 text-center max-w-lg">
          {/* 로고 자리 */}
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm shadow-lg">
            <span className="text-3xl text-primary-foreground font-bold">1P</span>
          </div>

          <div className="flex flex-col gap-op-lg">
            <Text as="h1" typography="h1-bold" className="text-primary-foreground leading-tight">
              원포인트
            </Text>
            <Text as="p" typography="body1-regular" className="text-primary-foreground/75 leading-relaxed">
              전문가와 의뢰인을 연결하는<br />
              1:1 매칭 플랫폼
            </Text>
          </div>

          {/* 피처 리스트 */}
          <div className="mt-op-lg flex flex-col gap-op-md w-full">
            {[
              { icon: <Target size={20} />, label: "정확한 전문가 매칭" },
              { icon: <MessageCircle size={20} />, label: "실시간 1:1 채팅" },
              { icon: <Lock size={20} />, label: "안전한 에스크로 결제" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-op-md rounded-xl bg-white/10 px-op-xl py-op-md text-left backdrop-blur-sm"
              >
                <span className="text-primary-foreground/90">{item.icon}</span>
                <Text as="span" typography="body2-medium" className="text-primary-foreground/90">
                  {item.label}
                </Text>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 폼 영역: 모바일 전체 / 데스크탑 우측 */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 md:w-1/2 lg:w-[45%] md:px-12 lg:px-16">
        <div className="w-full max-w-sm md:max-w-md">
          <LoginForm nextPath={nextPath} />
        </div>
      </div>
    </main>
  )
}
