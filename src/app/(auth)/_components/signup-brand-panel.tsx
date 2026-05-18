import { Sparkles } from "lucide-react"
import { cn } from "@/shared/lib/utils"
import { Text } from "@/shared/ui/text"

type SignupBrandPanelProps = {
  eyebrow?: string
  headline?: React.ReactNode
  subline?: React.ReactNode
  journeySteps?: ReadonlyArray<JourneyStep>
  activeStep?: number
}

type JourneyStep = {
  label: string
  description: string
}

const DEFAULT_STEPS: ReadonlyArray<JourneyStep> = [
  { label: "회원가입", description: "기본 정보 입력 · 약관 동의" },
  { label: "관심 전문가 찾기", description: "카테고리 · 지역별 1:1 매칭" },
  { label: "첫 의뢰 시작", description: "안전한 에스크로 결제로 진행" },
]

export function SignupBrandPanel({
  eyebrow = "JOIN ONE POINT",
  headline = (
    <>
      당신의 여정을
      <br />
      시작해보세요
    </>
  ),
  subline = (
    <>
      잠깐의 가입 절차 뒤에는
      <br />
      전문가와의 첫 만남이 기다리고 있어요.
    </>
  ),
  journeySteps = DEFAULT_STEPS,
  activeStep = 1,
}: SignupBrandPanelProps) {
  return (
    <div className="bg-primary-light relative hidden flex-col items-center justify-center overflow-hidden md:flex md:w-1/2 lg:w-[55%]">
      {/* 기하학적 장식: 회전된 사각형 */}
      <div className="bg-primary/[0.07] absolute -top-24 -left-24 h-72 w-72 rotate-12 rounded-[3rem]" />
      <div className="bg-primary/[0.05] absolute -right-20 -bottom-32 h-96 w-96 -rotate-12 rounded-[3rem]" />
      <div className="absolute top-1/4 right-12 h-28 w-28 rotate-[24deg] rounded-2xl bg-white/70 shadow-sm" />
      <div className="absolute bottom-[18%] left-10 h-20 w-20 -rotate-[18deg] rounded-2xl bg-white/85 shadow-sm" />
      <div className="bg-primary/10 absolute top-[18%] left-1/3 h-12 w-12 rotate-45 rounded-xl" />

      {/* 메인 콘텐츠 */}
      <div className="gap-op-2xl relative z-10 flex w-full max-w-md flex-col px-12">
        {/* Eyebrow */}
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-primary" />
          <Text
            as="span"
            typography="caption1-bold"
            className="text-primary tracking-[0.2em]"
          >
            {eyebrow}
          </Text>
        </div>

        {/* Headline + Subline */}
        <div className="gap-op-lg flex flex-col">
          <Text
            as="h1"
            typography="h1-bold"
            className="text-foreground leading-[1.2]"
          >
            {headline}
          </Text>
          <Text
            as="p"
            typography="body1-regular"
            className="text-muted-foreground leading-relaxed"
          >
            {subline}
          </Text>
        </div>

        {/* 가입 후 여정 카드 */}
        <div className="bg-card mt-op-md gap-op-lg flex flex-col rounded-3xl border p-6 shadow-xl shadow-primary/5">
          <div className="flex items-center justify-between">
            <Text
              as="span"
              typography="caption1-bold"
              className="text-muted-foreground tracking-wider"
            >
              YOUR JOURNEY
            </Text>
            <Text
              as="span"
              typography="caption1-medium"
              className="text-muted-foreground tabular-nums"
            >
              {activeStep} / {journeySteps.length}
            </Text>
          </div>

          <div className="flex flex-col gap-4">
            {journeySteps.map((step, idx) => {
              const stepNumber = idx + 1
              const isActive = stepNumber === activeStep
              const isUpcoming = stepNumber > activeStep
              return (
                <div key={step.label} className="flex items-start gap-3">
                  <div
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-xl transition-colors",
                      isActive && "bg-primary text-primary-foreground shadow-md shadow-primary/30",
                      !isActive && !isUpcoming && "bg-primary/15 text-primary",
                      isUpcoming && "bg-neutral-200/70 text-muted-foreground",
                    )}
                  >
                    <Text as="span" typography="body3-bold">
                      {stepNumber}
                    </Text>
                  </div>
                  <div className="flex flex-col gap-0.5 pt-1">
                    <Text
                      as="span"
                      typography="body2-medium"
                      className={cn(
                        isActive ? "text-foreground" : "text-foreground/80",
                      )}
                    >
                      {step.label}
                    </Text>
                    <Text
                      as="span"
                      typography="caption1-medium"
                      className="text-muted-foreground"
                    >
                      {step.description}
                    </Text>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
