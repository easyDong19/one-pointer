import Link from "next/link"
import { ArrowRight, Check, Shield, Coins, Lock } from "lucide-react"

import { PageShell, PageShellContent, PageShellFooter } from "@/shared/ui/page-shell"
import { Text } from "@/shared/ui/text"
import { HomeFooter } from "@/app/(main)/_components/home-footer"

export const metadata = {
  title: "숨은 수수료 ZERO — 쪽집게",
  description: "중개 수수료 0%, 합리적인 가격의 1:1 레슨 매칭. 전문가가 책정한 가격 그대로 결제하세요.",
}

export default function HiddenFeeLandingPage() {
  return (
    <PageShell tier="shell">
      <PageShellContent>
        <div className="flex flex-col gap-16 md:gap-28">
          <Hero />
          <PriceBreakdown />
          <FeeStructure />
          <TrustBadges />
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
    <section className="grid gap-8 pt-4 md:grid-cols-[1.1fr_1fr] md:items-center md:gap-12 md:pt-12">
      {/* 좌: 카피 */}
      <div className="flex flex-col gap-4 md:gap-6">
        <span className="w-fit rounded-full bg-emerald-50 px-3 py-1 ring-1 ring-emerald-100">
          <Text as="span" typography="caption1-medium" className="text-emerald-700">
            수수료 0% · 진짜 가격
          </Text>
        </span>
        <h1 className="text-[2rem] leading-[1.15] font-bold tracking-tight text-foreground md:text-[3.5rem]">
          같은 서비스인데
          <br />
          <span className="text-muted-foreground/60">왜 더 비쌌을까?</span>
        </h1>
        <Text as="p" typography="body1-regular" className="max-w-md text-muted-foreground">
          타 플랫폼은 중개 수수료를 가격에 숨겨 전가합니다. 쪽집게는 전문가가 책정한 가격
          그대로 결제하고, 그 돈은 전문가에게 갑니다.
        </Text>
      </div>

      {/* 우: 큰 숫자 발라드 */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-neutral-900 to-neutral-800 p-7 md:p-10">
        {/* 데코 그리드 */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-emerald-500/15 blur-3xl" />

        <div className="relative">
          <Text as="p" typography="caption1-medium" className="text-emerald-300/80">
            당신이 모르고 낸
          </Text>
          <p className="mt-1 text-[3.5rem] leading-none font-bold tracking-tight text-white md:text-[5.5rem]">
            ₩20,000
          </p>
          <Text as="p" typography="caption2-medium" className="mt-3 text-white/60">
            10만원 거래 기준 · 타 플랫폼 평균 숨은 수수료
          </Text>

          {/* 작은 divider + 부가 */}
          <div className="mt-7 h-px w-12 bg-white/15" />
          <div className="mt-5 flex items-baseline gap-2">
            <Text as="span" typography="caption1-medium" className="text-white/55">
              쪽집게에서는
            </Text>
            <span className="text-2xl font-bold text-emerald-300 md:text-3xl">₩0</span>
          </div>
        </div>
      </div>
    </section>
  )
}

function PriceBreakdown() {
  return (
    <section className="flex flex-col gap-8 md:gap-12">
      <div className="flex flex-col gap-3">
        <Text as="span" typography="caption1-medium" className="text-emerald-700">
          숨은 수수료의 구조
        </Text>
        <h2 className="text-[1.75rem] leading-tight font-bold tracking-tight text-foreground md:text-[2.5rem]">
          가격을 분해해서 보여드릴게요
        </h2>
      </div>

      <div className="grid gap-5 md:grid-cols-2 md:gap-8">
        {/* 타 플랫폼 */}
        <BreakdownCard
          tone="muted"
          label="타 플랫폼"
          total={120000}
          segments={[
            { label: "전문가 수령", amount: 100000, color: "bg-neutral-400" },
            { label: "중개 수수료", amount: 16000, color: "bg-rose-400" },
            { label: "광고비 전가", amount: 4000, color: "bg-rose-300" },
          ]}
          highlight={null}
        />
        {/* 쪽집게 */}
        <BreakdownCard
          tone="primary"
          label="쪽집게"
          total={103500}
          segments={[
            { label: "전문가 수령", amount: 100000, color: "bg-emerald-500" },
            { label: "PG 결제 수수료", amount: 3500, color: "bg-emerald-200" },
          ]}
          highlight="중개 수수료 0%"
        />
      </div>

      <Text as="p" typography="caption2-medium" className="text-muted-foreground">
        * 온라인 거래 시 PG사 결제 수수료 3.5% 만 차감됩니다. 오프라인 거래는 PG 수수료도 없습니다.
      </Text>
    </section>
  )
}

function BreakdownCard({
  tone,
  label,
  total,
  segments,
  highlight,
}: {
  tone: "muted" | "primary"
  label: string
  total: number
  segments: { label: string; amount: number; color: string }[]
  highlight: string | null
}) {
  const max = Math.max(120000, total)
  return (
    <div
      className={
        tone === "primary"
          ? "rounded-3xl border-2 border-emerald-200 bg-emerald-50/40 p-6 md:p-8"
          : "rounded-3xl border border-neutral-200 bg-neutral-50/60 p-6 md:p-8"
      }
    >
      <div className="flex items-baseline justify-between">
        <Text as="span" typography="subtitle2-bold" className="text-foreground">
          {label}
        </Text>
        <span className="text-2xl font-bold tabular-nums tracking-tight text-foreground md:text-3xl">
          ₩{total.toLocaleString()}
        </span>
      </div>

      {highlight && (
        <span className="mt-3 inline-block rounded-full bg-emerald-600 px-2.5 py-0.5 text-[0.7rem] font-medium text-white">
          {highlight}
        </span>
      )}

      {/* 가로 분해 바 */}
      <div className="mt-6 flex h-3 overflow-hidden rounded-full bg-neutral-100">
        {segments.map((seg) => (
          <div
            key={seg.label}
            className={seg.color}
            style={{ width: `${(seg.amount / max) * 100}%` }}
          />
        ))}
      </div>

      {/* 분해 라벨 */}
      <ul className="mt-5 flex flex-col gap-2.5">
        {segments.map((seg) => (
          <li key={seg.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className={`h-2.5 w-2.5 rounded-full ${seg.color}`} />
              <Text as="span" typography="body3-regular" className="text-foreground">
                {seg.label}
              </Text>
            </div>
            <span className="text-sm font-medium tabular-nums text-muted-foreground">
              ₩{seg.amount.toLocaleString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function FeeStructure() {
  const items = [
    {
      icon: Coins,
      title: "중개 수수료 0%",
      body: "전문가에게 부과되는 중개 수수료가 없습니다. 가격에 숨겨질 수수료도 없습니다.",
    },
    {
      icon: Lock,
      title: "원가 그대로",
      body: "전문가가 책정한 가격이 곧 결제 가격. 어떤 항목도 임의로 더해지지 않습니다.",
    },
    {
      icon: Shield,
      title: "안전한 결제",
      body: "에스크로 결제로 서비스 완료 전까지 결제 금액이 보호됩니다.",
    },
  ]
  return (
    <section className="flex flex-col gap-8 md:gap-10">
      <div className="flex max-w-2xl flex-col gap-3">
        <Text as="span" typography="caption1-medium" className="text-muted-foreground">
          쪽집게의 가격 구조
        </Text>
        <h2 className="text-[1.75rem] leading-tight font-bold tracking-tight text-foreground md:text-[2.5rem]">
          더하지 않습니다. 그게 전부입니다.
        </h2>
      </div>
      <div className="grid gap-4 md:grid-cols-3 md:gap-5">
        {items.map((it) => (
          <div
            key={it.title}
            className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-md md:p-7"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 ring-1 ring-emerald-100">
              <it.icon className="h-5 w-5 text-emerald-600" strokeWidth={2} />
            </div>
            <Text as="h3" typography="subtitle2-bold" className="mt-5 text-foreground">
              {it.title}
            </Text>
            <Text as="p" typography="body3-regular" className="mt-2 text-muted-foreground">
              {it.body}
            </Text>
          </div>
        ))}
      </div>
    </section>
  )
}

function TrustBadges() {
  const badges = ["숨은 비용 제로", "원가 그대로", "안전한 결제"]
  return (
    <section className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
      {badges.map((b) => (
        <div
          key={b}
          className="flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-2"
        >
          <Check className="h-4 w-4 text-emerald-600" strokeWidth={2.5} />
          <Text as="span" typography="caption1-medium" className="text-foreground">
            {b}
          </Text>
        </div>
      ))}
    </section>
  )
}

function Cta() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 p-8 text-center md:p-16">
      <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-white/15 blur-3xl" />
      <div className="absolute -bottom-12 -left-12 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
      <div className="relative flex flex-col items-center gap-6">
        <Text as="span" typography="caption1-medium" className="text-white/80">
          지금 바로 시작하세요
        </Text>
        <h2 className="text-[2rem] leading-tight font-bold tracking-tight text-white md:text-[3rem]">
          수수료 0%,
          <br className="md:hidden" />
          <span className="md:ml-3">합리적인 가격으로.</span>
        </h2>
        <Link
          href="/"
          className="group mt-2 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 transition-shadow hover:shadow-xl md:px-8 md:py-4"
        >
          <Text as="span" typography="body1-bold" className="text-emerald-700">
            시작하기
          </Text>
          <ArrowRight
            className="h-5 w-5 text-emerald-700 transition-transform group-hover:translate-x-1"
            strokeWidth={2.5}
          />
        </Link>
      </div>
    </section>
  )
}
