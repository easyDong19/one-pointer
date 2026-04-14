import { PenLine, Mail, Handshake, Target } from "lucide-react"
import { Text } from "@/shared/ui/text"

const STEPS = [
  {
    step: 1,
    title: "의뢰 등록",
    description: "내용 확인",
    icon: <PenLine size={20} />,
  },
  {
    step: 2,
    title: "제안서 확인",
    description: "전문가 비교",
    icon: <Mail size={20} />,
  },
  {
    step: 3,
    title: "전문가 선택",
    description: "비교 후 선택",
    icon: <Handshake size={20} />,
  },
  {
    step: 4,
    title: "서비스 진행",
    description: "온·오프라인 수업",
    icon: <Target size={20} />,
  },
]

export function HomeHowItWorks() {
  return (
    <section className="flex flex-col gap-4">
      <Text as="h2" typography="subtitle1-bold" className="text-foreground">
        의뢰는 이렇게 진행돼요!
      </Text>

      {/* 모바일: 가로 스크롤 카드 / 데스크탑: 4열 그리드 with 커넥터 라인 */}
      <div className="flex gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-4 md:gap-0 md:overflow-visible md:pb-0">
        {STEPS.map((item, i) => (
          <div key={item.step} className="relative flex min-w-[140px] flex-1 md:min-w-0">
            {/* 데스크탑: 스텝 간 커넥터 라인 */}
            {i < STEPS.length - 1 ? (
              <div className="absolute top-7 right-0 z-0 hidden h-0.5 w-1/2 bg-primary/20 md:block" />
            ) : null}
            {i > 0 ? (
              <div className="absolute top-7 left-0 z-0 hidden h-0.5 w-1/2 bg-primary/20 md:block" />
            ) : null}

            <div className="relative z-10 flex w-full flex-col items-start gap-2 rounded-2xl bg-gradient-to-br from-primary/85 to-primary px-5 py-5 md:mx-1.5 md:items-center md:bg-none md:from-transparent md:to-transparent md:px-3 md:py-4">
              {/* 스텝 넘버 */}
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 md:h-14 md:w-14 md:bg-primary md:shadow-md">
                <Text as="span" typography="body3-bold" className="text-primary-foreground md:body1-bold">
                  {item.step}
                </Text>
              </div>

              <Text as="h3" typography="body2-bold" className="mt-1 text-primary-foreground md:text-center md:text-foreground">
                {item.title}
              </Text>
              <Text as="p" typography="caption1-medium" className="text-primary-foreground/70 md:text-center md:text-muted-foreground">
                {item.description}
              </Text>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
