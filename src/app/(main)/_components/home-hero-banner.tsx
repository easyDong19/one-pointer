import Link from "next/link"
import { Text } from "@/shared/ui/text"

export function HomeHeroBanner() {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-primary md:rounded-3xl">
      {/* 배경 장식 — 소프트한 원형 블러 */}
      <div className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-white/5 blur-2xl md:h-80 md:w-80" />
      <div className="absolute -bottom-12 -left-12 h-44 w-44 rounded-full bg-white/5 blur-xl md:h-64 md:w-64" />
      <div className="absolute top-1/2 left-1/2 hidden h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/3 blur-3xl md:block md:h-72 md:w-72" />

      {/* 콘텐츠 */}
      <div className="relative z-10 flex flex-col gap-6 px-6 py-6 md:flex-row md:items-center md:justify-between md:px-12 md:py-14 lg:px-16 lg:py-16">
        {/* 텍스트 */}
        <div className="flex flex-col gap-1 md:gap-3">
          <Text as="h2" typography="body1-bold" className="text-primary-foreground md:h2-bold">
            쪽집게가 처음이신가요?
          </Text>
          <Text as="p" typography="body3-regular" className="text-primary-foreground/70 md:body1-regular">
            채팅이 리뷰가 되는 투명한 전문가 매칭
          </Text>
          {/* 데스크탑 설명 확장 */}
          <Text as="p" typography="body2-regular" className="mt-1 hidden text-primary-foreground/55 md:block">
            전문가의 실제 상담 채팅을 리뷰로 공개합니다. 광고 없이 실력으로 증명하세요.
          </Text>
        </div>

        {/* CTA */}
        <Link
          href="/about"
          className="w-fit shrink-0 rounded-full bg-white/20 px-5 py-2.5 backdrop-blur-sm transition-all hover:bg-white/30 hover:shadow-lg md:px-8 md:py-3"
        >
          <Text as="span" typography="body3-medium" className="text-primary-foreground md:body2-medium">
            알아보기
          </Text>
        </Link>
      </div>
    </section>
  )
}
