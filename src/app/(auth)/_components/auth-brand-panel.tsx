import { Target, MessageCircle, Lock } from "lucide-react"
import { Text } from "@/shared/ui/text"

type AuthBrandPanelProps = {
  headline?: string
  subline?: React.ReactNode
}

const FEATURES = [
  { icon: <Target size={20} />, label: "정확한 전문가 매칭" },
  { icon: <MessageCircle size={20} />, label: "실시간 1:1 채팅" },
  { icon: <Lock size={20} />, label: "안전한 에스크로 결제" },
] as const

export function AuthBrandPanel({
  headline = "원포인트",
  subline = (
    <>
      전문가와 의뢰인을 연결하는
      <br />
      1:1 매칭 플랫폼
    </>
  ),
}: AuthBrandPanelProps) {
  return (
    <div className="bg-primary relative hidden flex-col items-center justify-center overflow-hidden md:flex md:w-1/2 lg:w-[55%]">
      <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-white/5" />
      <div className="absolute -right-16 -bottom-24 h-80 w-80 rounded-full bg-white/5" />
      <div className="absolute top-1/3 right-8 h-48 w-48 rounded-full bg-white/5" />
      <div className="absolute bottom-1/3 left-8 h-32 w-32 rounded-full bg-white/10" />

      <div className="gap-op-3xl relative z-10 flex max-w-lg flex-col items-center px-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 shadow-lg backdrop-blur-sm">
          <span className="text-primary-foreground text-3xl font-bold">1P</span>
        </div>

        <div className="gap-op-lg flex flex-col">
          <Text as="h1" typography="h1-bold" className="text-primary-foreground leading-tight">
            {headline}
          </Text>
          <Text
            as="p"
            typography="body1-regular"
            className="text-primary-foreground/75 leading-relaxed"
          >
            {subline}
          </Text>
        </div>

        <div className="mt-op-lg gap-op-md flex w-full flex-col">
          {FEATURES.map((item) => (
            <div
              key={item.label}
              className="gap-op-md px-op-xl py-op-md flex items-center rounded-xl bg-white/10 text-left backdrop-blur-sm"
            >
              <span className="text-primary-foreground/90">{item.icon}</span>
              <Text
                as="span"
                typography="body2-medium"
                className="text-primary-foreground/90"
              >
                {item.label}
              </Text>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
