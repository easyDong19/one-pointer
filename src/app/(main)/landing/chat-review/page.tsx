import Link from "next/link"
import { ArrowRight, ShieldCheck, MessageSquare, EyeOff, Zap, Heart, X } from "lucide-react"

import { PageShell, PageShellContent, PageShellFooter } from "@/shared/ui/page-shell"
import { Text } from "@/shared/ui/text"
import { HomeFooter } from "@/app/(main)/_components/home-footer"

export const metadata = {
  title: "채팅이 곧 리뷰 — 쪽집게",
  description: "별점이 아닌 실제 대화로 전문가의 진짜 실력을 확인하세요. 조작 불가, 자동 보호.",
}

export default function ChatReviewLandingPage() {
  return (
    <PageShell tier="shell">
      <PageShellContent>
        <div className="flex flex-col gap-16 md:gap-28">
          <Hero />
          <HowItWorks />
          <Compare />
          <Benefits />
          <Cta />
        </div>
      </PageShellContent>
      <PageShellFooter>
        <HomeFooter />
      </PageShellFooter>
    </PageShell>
  )
}

function Hero() {
  return (
    <section className="grid gap-10 pt-4 md:grid-cols-2 md:items-center md:gap-16 md:pt-12">
      {/* 좌: 카피 */}
      <div className="flex flex-col gap-5 md:gap-7">
        <span className="w-fit rounded-full bg-primary/10 px-3 py-1">
          <Text as="span" typography="caption1-medium" className="text-primary">
            투명한 리뷰
          </Text>
        </span>
        <h1 className="text-[2rem] leading-[1.15] font-bold tracking-tight text-foreground md:text-[3.5rem]">
          별점 5점,
          <br />
          진짜 믿으셨나요?
        </h1>
        <Text as="p" typography="body1-regular" className="max-w-md text-muted-foreground">
          작성 리뷰는 전문가를 자세히 알 수 없어요. 쪽집게는 별점이 아닌 실제 대화로
          전문가의 실력을 보여드립니다.
        </Text>
      </div>

      {/* 우: 가짜 리뷰 카드 (취소선 처리) */}
      <div className="relative">
        <div className="absolute -inset-4 -rotate-1 rounded-3xl bg-rose-50/50" />
        <div className="relative rotate-1 rounded-2xl border border-rose-200 bg-white p-5 shadow-sm md:p-7">
          <div className="absolute -top-3 -right-3 flex h-9 items-center gap-1.5 rounded-full bg-rose-500 px-3 text-white">
            <X className="h-3.5 w-3.5" strokeWidth={3} />
            <Text as="span" typography="caption2-medium" className="text-white">
              확인 불가
            </Text>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-neutral-200" />
            <div className="flex flex-col">
              <Text as="span" typography="body3-medium" className="text-foreground line-through decoration-rose-400">
                익명 사용자
              </Text>
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-rose-400 line-through decoration-rose-500">
                    ★
                  </span>
                ))}
              </div>
            </div>
          </div>
          <Text
            as="p"
            typography="body3-regular"
            className="mt-4 text-muted-foreground line-through decoration-rose-400"
          >
            &ldquo;정말 친절하고 좋아요! 강추!&rdquo;
          </Text>
          <div className="mt-5 grid grid-cols-3 gap-2 border-t border-rose-100 pt-4">
            {["작성자", "실제 거래", "대화 내용"].map((label) => (
              <div key={label} className="flex flex-col gap-1">
                <Text as="span" typography="caption2-medium" className="text-muted-foreground/70">
                  {label}
                </Text>
                <Text as="span" typography="caption2-medium" className="text-rose-500">
                  알 수 없음
                </Text>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function HowItWorks() {
  return (
    <section className="grid gap-10 md:grid-cols-2 md:items-center md:gap-16">
      {/* 채팅 mockup */}
      <div className="order-2 md:order-1">
        <ChatMockup />
      </div>

      {/* 카피 */}
      <div className="order-1 flex flex-col gap-5 md:order-2 md:gap-7">
        <Text as="span" typography="caption1-medium" className="text-primary">
          쪽집게의 방식
        </Text>
        <h2 className="text-[1.75rem] leading-tight font-bold tracking-tight text-foreground md:text-[2.5rem]">
          대화 자체가
          <br />
          리뷰입니다.
        </h2>
        <Text as="p" typography="body1-regular" className="text-muted-foreground">
          전문가와 나눈 실제 대화를 다음 의뢰인이 볼 수 있어요. 별점은 거짓말을 할 수 있어도,
          쌓인 대화는 거짓말을 할 수 없습니다.
        </Text>
        <ul className="mt-2 flex flex-col gap-3">
          {[
            ["개인정보 자동 마스킹", "전화번호 · 계좌 · 주소 자동 가림"],
            ["비공개 메시지 선택", "특정 메시지는 비공개로 전환 가능"],
            ["거래 완료 건만 공개", "실제 서비스가 이뤄진 경우만 노출"],
          ].map(([title, sub]) => (
            <li key={title} className="flex items-start gap-3">
              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <span className="block h-1.5 w-1.5 rounded-full bg-primary" />
              </div>
              <div className="flex flex-col">
                <Text as="span" typography="body3-medium" className="text-foreground">
                  {title}
                </Text>
                <Text as="span" typography="caption1-medium" className="text-muted-foreground">
                  {sub}
                </Text>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function ChatMockup() {
  return (
    <div className="relative">
      <div className="absolute -top-4 -right-4 z-10 flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 shadow-lg md:-top-5 md:-right-5">
        <ShieldCheck className="h-3.5 w-3.5 text-primary-foreground" strokeWidth={2.5} />
        <Text as="span" typography="caption2-medium" className="text-primary-foreground">
          대화가 리뷰로 공개
        </Text>
      </div>

      <div className="rounded-3xl border border-border bg-neutral-50 p-5 md:p-7">
        <div className="mb-4 flex items-center gap-2 border-b border-neutral-200 pb-3">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <Text as="span" typography="caption2-medium" className="text-muted-foreground">
            촬영 의뢰 · 완료
          </Text>
        </div>

        <div className="flex flex-col gap-3">
          <Bubble side="left">예시 작품 보내드릴까요? 원하시는 톤이 있으실까요?</Bubble>
          <Bubble side="right">
            네! 자연광 위주의 따뜻한 톤이 좋아요. 야외 촬영 가능하신가요?
          </Bubble>
          <Bubble side="left">
            가능합니다. 일요일 오전 10시 한강공원 어떠세요? 비 예보 있으면 다음 주로 미루는 옵션도 드릴게요.
          </Bubble>
          <Bubble side="right">완벽해요. 그럼 일요일로 갑시다!</Bubble>
        </div>
      </div>
    </div>
  )
}

function Bubble({ side, children }: { side: "left" | "right"; children: React.ReactNode }) {
  return (
    <div className={`flex ${side === "right" ? "justify-end" : "justify-start"}`}>
      <div
        className={
          side === "right"
            ? "max-w-[78%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-primary-foreground"
            : "max-w-[78%] rounded-2xl rounded-bl-md bg-white px-4 py-2.5 text-foreground ring-1 ring-border"
        }
      >
        <Text as="span" typography="body3-regular">
          {children}
        </Text>
      </div>
    </div>
  )
}

function Compare() {
  return (
    <section className="grid gap-5 md:grid-cols-2 md:gap-6">
      <div className="rounded-3xl border border-border bg-neutral-50/50 p-7 md:p-9">
        <Text as="span" typography="caption1-medium" className="text-muted-foreground">
          기존 리뷰
        </Text>
        <h3 className="mt-3 text-2xl font-bold tracking-tight text-muted-foreground/80 md:text-3xl">
          별점과 짧은 텍스트
        </h3>
        <ul className="mt-6 flex flex-col gap-3">
          {["작성 조작 가능", "맥락 부족", "거래 여부 불확실"].map((t) => (
            <li key={t} className="flex items-center gap-2.5">
              <X className="h-4 w-4 text-rose-400" strokeWidth={2.5} />
              <Text as="span" typography="body3-regular" className="text-muted-foreground">
                {t}
              </Text>
            </li>
          ))}
        </ul>
      </div>

      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary-hover p-7 text-primary-foreground md:p-9">
        <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <Text as="span" typography="caption1-medium" className="text-primary-foreground/70">
          쪽집게의 채팅 리뷰
        </Text>
        <h3 className="mt-3 text-2xl font-bold tracking-tight text-white md:text-3xl">
          실제 대화 전문 공개
        </h3>
        <ul className="mt-6 flex flex-col gap-3">
          {["조작 불가능", "맥락 풍부", "거래 완료 건 한정"].map((t) => (
            <li key={t} className="flex items-center gap-2.5">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/25">
                <span className="h-1.5 w-1.5 rounded-full bg-white" />
              </span>
              <Text as="span" typography="body3-medium" className="text-primary-foreground">
                {t}
              </Text>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function Benefits() {
  const items = [
    { icon: MessageSquare, title: "실제 소통 방식", body: "전문가가 어떻게 말하고 듣는지 그대로 확인하세요." },
    { icon: Zap, title: "응답 속도와 성실함", body: "메시지 간격이 곧 응대 품질입니다. 가려지지 않습니다." },
    { icon: Heart, title: "다른 의뢰인의 만족", body: "결정 직전의 대화에서 진짜 만족도가 드러납니다." },
    { icon: EyeOff, title: "자동 개인정보 보호", body: "전화번호 · 주소 등 민감 정보는 자동으로 가립니다." },
  ]
  return (
    <section className="flex flex-col gap-8 md:gap-10">
      <div className="flex max-w-2xl flex-col gap-3">
        <Text as="span" typography="caption1-medium" className="text-primary">
          대화에서 확인할 수 있는 것
        </Text>
        <h2 className="text-[1.75rem] leading-tight font-bold tracking-tight text-foreground md:text-[2.5rem]">
          별점으로는 보이지 않는 4가지.
        </h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 md:gap-5">
        {items.map((it) => (
          <div
            key={it.title}
            className="group flex items-start gap-4 rounded-2xl border border-border bg-card p-5 transition-shadow hover:shadow-md md:p-6"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <it.icon className="h-5 w-5 text-primary" strokeWidth={2} />
            </div>
            <div className="flex flex-col gap-1">
              <Text as="h3" typography="subtitle2-bold" className="text-foreground">
                {it.title}
              </Text>
              <Text as="p" typography="body3-regular" className="text-muted-foreground">
                {it.body}
              </Text>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function Cta() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary-hover p-8 text-center md:p-16">
      <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-white/15 blur-3xl" />
      <div className="absolute -bottom-12 -left-12 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
      <div className="relative flex flex-col items-center gap-6">
        <Text as="span" typography="caption1-medium" className="text-primary-foreground/80">
          진짜 실력을 확인하세요
        </Text>
        <h2 className="text-[2rem] leading-tight font-bold tracking-tight text-primary-foreground md:text-[3rem]">
          리뷰를 읽지 말고,
          <br />
          대화를 읽으세요.
        </h2>
        <Link
          href="/"
          className="group mt-2 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 transition-shadow hover:shadow-xl md:px-8 md:py-4"
        >
          <Text as="span" typography="body1-bold" className="text-primary">
            채팅 리뷰 확인하기
          </Text>
          <ArrowRight
            className="h-5 w-5 text-primary transition-transform group-hover:translate-x-1"
            strokeWidth={2.5}
          />
        </Link>
      </div>
    </section>
  )
}
