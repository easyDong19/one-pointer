import { Quote, Check } from "lucide-react"

import { PageShell, PageShellContent, PageShellFooter } from "@/shared/ui/page-shell"
import { Text } from "@/shared/ui/text"
import { RecruitmentCtaButton } from "@/features/landing/expert-recruitment/ui/recruitment-cta-button"
import { HomeFooter } from "@/app/(main)/_components/home-footer"

export const metadata = {
  title: "전문가 모집 — 수수료 0%, 쪽집게",
  description: "중개 수수료 0%, 무료 제안서, 무료 프로필 등록. 일한 만큼 다 가져가세요.",
}

export default function ExpertRecruitmentLandingPage() {
  return (
    <PageShell tier="shell">
      <PageShellContent spacing="none">
        <div className="flex flex-col gap-16 md:gap-24">
          <Hero />
          <div className="flex flex-col gap-16 md:gap-24">
            <WhySection />
            <FreeFeatures />
          </div>
          <Philosophy />
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
    <section className="relative -mx-4 overflow-hidden rounded-b-[2rem] bg-gradient-to-br from-primary via-primary to-primary-hover text-primary-foreground md:-mx-0 md:rounded-3xl">
      {/* 그리드 텍스처 */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      {/* 데코 */}
      <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-white/8 blur-2xl" />
      <div className="absolute top-1/3 right-1/4 h-16 w-16 rotate-12 rounded-2xl border border-white/15" />
      <div className="absolute right-12 bottom-12 hidden h-10 w-10 -rotate-6 rounded-lg border border-white/20 md:block" />

      <div className="relative px-6 pt-14 pb-12 md:px-14 md:pt-24 md:pb-20 lg:px-20">
        <div className="grid gap-10 md:grid-cols-[1.3fr_1fr] md:items-center md:gap-14">
          <div className="flex flex-col gap-5 md:gap-7">
            <span className="w-fit rounded-full bg-white/15 px-3 py-1 backdrop-blur-sm">
              <Text as="span" typography="caption1-medium" className="text-primary-foreground">
                전문가 집중 모집중
              </Text>
            </span>
            <h1 className="text-[2.25rem] leading-[1.1] font-bold tracking-tight text-white md:text-[4rem]">
              전문가를
              <br />
              전문가답게,
              <br />
              <span className="text-white/75">일한만큼 다.</span>
            </h1>
            <Text
              as="p"
              typography="body1-regular"
              className="max-w-md text-primary-foreground/80"
            >
              쪽집게는 전문가의 노력에 정당한 대가를 믿습니다. 수수료 걱정 없이 온전히
              실력으로 승부하세요.
            </Text>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {["중개수수료 0%", "제안서 무료", "프로필 무료"].map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-white/15 px-3 py-1 backdrop-blur-sm"
                >
                  <Text
                    as="span"
                    typography="caption2-medium"
                    className="text-primary-foreground"
                  >
                    {t}
                  </Text>
                </span>
              ))}
            </div>
          </div>

          {/* 우: 거대한 0% */}
          <div className="relative flex h-full items-center justify-center">
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[12rem] leading-none font-bold tracking-tighter text-white/8 md:text-[20rem]">
                0%
              </span>
            </div>
            <div className="relative flex flex-col items-center gap-2 rounded-3xl bg-white/10 px-8 py-10 ring-1 ring-white/15 backdrop-blur-md md:px-12 md:py-14">
              <Text as="span" typography="caption1-medium" className="text-primary-foreground/75">
                중개 수수료
              </Text>
              <span className="text-[5rem] leading-none font-bold tracking-tight text-white md:text-[7rem]">
                0<span className="text-white/70">%</span>
              </span>
              <Text as="span" typography="caption2-medium" className="text-primary-foreground/60">
                다른 어떤 항목도 더해지지 않습니다
              </Text>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function WhySection() {
  const rows = [
    { label: "중개 수수료", other: "10~20%", ours: "0%" },
    { label: "제안서 비용", other: "건당 과금", ours: "무료" },
    { label: "프로필 등록", other: "유료 플랜", ours: "무료" },
  ]
  return (
    <section className="px-4 md:px-0">
      <div className="flex max-w-2xl flex-col gap-3">
        <Text as="span" typography="caption1-medium" className="text-primary">
          왜 쪽집게인가
        </Text>
        <h2 className="text-[1.75rem] leading-tight font-bold tracking-tight text-foreground md:text-[2.5rem]">
          비교해보면 명확합니다.
        </h2>
      </div>

      <div className="mt-8 overflow-hidden rounded-3xl border border-border md:mt-12">
        <div className="grid grid-cols-[1.2fr_1fr_1fr] bg-neutral-50">
          <div className="px-5 py-4 md:px-8 md:py-5">
            <Text as="span" typography="caption1-medium" className="text-muted-foreground">
              항목
            </Text>
          </div>
          <div className="border-l border-border px-5 py-4 md:px-8 md:py-5">
            <Text as="span" typography="caption1-medium" className="text-muted-foreground">
              타 플랫폼
            </Text>
          </div>
          <div className="border-l border-border bg-primary px-5 py-4 md:px-8 md:py-5">
            <Text as="span" typography="caption1-medium" className="text-primary-foreground">
              쪽집게
            </Text>
          </div>
        </div>
        {rows.map((row, i) => (
          <div
            key={row.label}
            className={`grid grid-cols-[1.2fr_1fr_1fr] ${i > 0 ? "border-t border-border" : ""}`}
          >
            <div className="px-5 py-5 md:px-8 md:py-6">
              <Text as="span" typography="body3-medium" className="text-foreground">
                {row.label}
              </Text>
            </div>
            <div className="border-l border-border px-5 py-5 md:px-8 md:py-6">
              <Text
                as="span"
                typography="body2-regular"
                className="text-muted-foreground line-through decoration-rose-300"
              >
                {row.other}
              </Text>
            </div>
            <div className="border-l border-border bg-primary/5 px-5 py-5 md:px-8 md:py-6">
              <span className="text-lg font-bold tracking-tight text-primary md:text-xl">
                {row.ours}
              </span>
            </div>
          </div>
        ))}
      </div>

      <Text
        as="p"
        typography="caption2-medium"
        className="mt-4 text-muted-foreground"
      >
        * 온라인 거래 시 PG사 결제 수수료 3.5% 만 차감됩니다.
      </Text>
    </section>
  )
}

function FreeFeatures() {
  const items = [
    {
      label: "제안서 전송",
      headline: "보낼 때마다 0원",
      body: "의뢰에 제안할 때 어떤 비용도 차감되지 않습니다. 부담 없이 제안하세요.",
    },
    {
      label: "중개 수수료",
      headline: "거래해도 0원",
      body: "거래가 성사돼도 중개 수수료는 부과되지 않습니다. 전문가 수령액 그대로.",
    },
    {
      label: "프로필 등록",
      headline: "노출도 0원",
      body: "프리미엄 플랜 같은 노출 과금이 없습니다. 모든 전문가가 동일하게 보입니다.",
    },
  ]
  return (
    <section className="px-4 md:px-0">
      <div className="flex max-w-2xl flex-col gap-3">
        <Text as="span" typography="caption1-medium" className="text-primary">
          전부 무료입니다
        </Text>
        <h2 className="text-[1.75rem] leading-tight font-bold tracking-tight text-foreground md:text-[2.5rem]">
          가입에서 거래까지, 0원.
        </h2>
      </div>
      <div className="mt-8 grid gap-4 md:mt-12 md:grid-cols-3 md:gap-5">
        {items.map((it) => (
          <div
            key={it.label}
            className="group relative overflow-hidden rounded-3xl border border-border bg-card p-7 transition-shadow hover:shadow-md md:p-8"
          >
            {/* 큰 0원 배경 글자 */}
            <span className="pointer-events-none absolute -right-4 -bottom-8 text-[7rem] leading-none font-bold tracking-tighter text-primary/5 md:text-[9rem]">
              0원
            </span>

            <div className="relative">
              <Text as="span" typography="caption1-medium" className="text-muted-foreground">
                {it.label}
              </Text>
              <h3 className="mt-2 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                {it.headline}
              </h3>
              <Text as="p" typography="body3-regular" className="mt-3 max-w-[16rem] text-muted-foreground">
                {it.body}
              </Text>

              <div className="mt-6 flex items-center gap-2 border-t border-border pt-4">
                <Check className="h-4 w-4 text-primary" strokeWidth={2.5} />
                <Text as="span" typography="caption1-medium" className="text-primary">
                  추가 비용 없음
                </Text>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function Philosophy() {
  return (
    <section className="relative -mx-4 overflow-hidden rounded-3xl bg-neutral-900 px-6 py-16 text-white md:-mx-0 md:px-14 md:py-24">
      <div className="absolute inset-y-0 left-0 w-1 bg-primary md:w-1.5" />
      <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />

      <div className="relative max-w-3xl">
        <Quote className="h-9 w-9 text-primary md:h-12 md:w-12" strokeWidth={1.5} />
        <p className="mt-6 text-[1.75rem] leading-[1.35] font-bold tracking-tight text-white md:text-[2.5rem]">
          전문가가 실력으로만 평가받고,
          <br />
          일한 만큼 가져가는 경험.
        </p>
        <Text
          as="p"
          typography="body1-regular"
          className="mt-5 text-white/65"
        >
          쪽집게가 만들어가고 싶은 전문가 경험입니다.
        </Text>
      </div>
    </section>
  )
}

function Cta() {
  return (
    <section className="px-4 pb-4 md:px-0 md:pb-0">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 md:p-14">
        <div className="absolute top-0 right-0 h-full w-1/2 opacity-[0.04]">
          <span className="absolute top-1/2 right-0 -translate-y-1/2 text-[14rem] leading-none font-bold tracking-tighter text-primary md:text-[20rem]">
            0%
          </span>
        </div>
        <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-3">
            <Text as="span" typography="caption1-medium" className="text-primary">
              지금 시작하세요
            </Text>
            <h2 className="text-[1.75rem] leading-tight font-bold tracking-tight text-foreground md:text-[2.75rem]">
              실력으로만 평가받는 곳,
              <br />
              쪽집게.
            </h2>
            <Text as="p" typography="body2-regular" className="text-muted-foreground">
              회원가입과 프로필 등록까지 5분이면 충분합니다.
            </Text>
          </div>
          <RecruitmentCtaButton />
        </div>
      </div>
    </section>
  )
}
