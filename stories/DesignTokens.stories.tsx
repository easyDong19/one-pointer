import type { Meta, StoryObj } from "@storybook/nextjs-vite"

const meta = {
  title: "Design/Tokens",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Spacing, Radius, Shadow 디자인 토큰. Tailwind v4 `@theme inline`에 `op-` infix prefix로 정의되어 기본 토큰과 충돌 없이 사용 가능하다.",
      },
    },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

// ── Spacing ──────────────────────────────────────────────────────
type SpacingToken = {
  name: string
  cssVar: string
  value: string
  themeUtility: string  // Tailwind auto-generated (op- prefix)
  aliasUtility?: string // @utility alias (user-friendly)
}

const SPACING_TOKENS: SpacingToken[] = [
  { name: "xs",  cssVar: "--spacing-op-xs",  value: "0.25rem (4px)",  themeUtility: "p-op-xs",  aliasUtility: "p-xs" },
  { name: "sm",  cssVar: "--spacing-op-sm",  value: "0.5rem (8px)",   themeUtility: "p-op-sm",  aliasUtility: "p-sm" },
  { name: "md",  cssVar: "--spacing-op-md",  value: "0.75rem (12px)", themeUtility: "p-op-md",  aliasUtility: "p-md" },
  { name: "lg",  cssVar: "--spacing-op-lg",  value: "1rem (16px)",    themeUtility: "p-op-lg",  aliasUtility: "p-lg" },
  { name: "xl",  cssVar: "--spacing-op-xl",  value: "1.25rem (20px)", themeUtility: "p-op-xl",  aliasUtility: "p-xl" },
  { name: "2xl", cssVar: "--spacing-op-2xl", value: "1.5rem (24px)",  themeUtility: "p-op-2xl" },
  { name: "3xl", cssVar: "--spacing-op-3xl", value: "2rem (32px)",    themeUtility: "p-op-3xl" },
  { name: "4xl", cssVar: "--spacing-op-4xl", value: "2.5rem (40px)",  themeUtility: "p-op-4xl" },
  { name: "5xl", cssVar: "--spacing-op-5xl", value: "3rem (48px)",    themeUtility: "p-op-5xl" },
]

// ── Radius ──────────────────────────────────────────────────────
type RadiusToken = {
  name: string
  cssVar: string
  value: string
  tailwindClass: string
}

const RADIUS_TOKENS: RadiusToken[] = [
  { name: "sm",   cssVar: "--radius-sm",  value: "0.375rem (6px)",   tailwindClass: "rounded-sm"  },
  { name: "md",   cssVar: "--radius-md",  value: "0.5rem (8px)",     tailwindClass: "rounded-md"  },
  { name: "lg",   cssVar: "--radius-lg",  value: "0.625rem (10px)",  tailwindClass: "rounded-lg"  },
  { name: "xl",   cssVar: "--radius-xl",  value: "0.875rem (14px)",  tailwindClass: "rounded-xl"  },
  { name: "2xl",  cssVar: "--radius-2xl", value: "1.125rem (18px)",  tailwindClass: "rounded-2xl" },
  { name: "3xl",  cssVar: "--radius-3xl", value: "1.375rem (22px)",  tailwindClass: "rounded-3xl" },
  { name: "4xl",  cssVar: "--radius-4xl", value: "1.625rem (26px)",  tailwindClass: "rounded-4xl" },
  { name: "full", cssVar: "—",            value: "9999px",           tailwindClass: "rounded-full"},
]

// ── Shadow ──────────────────────────────────────────────────────
type ShadowToken = {
  name: string
  cssVar: string
  tailwindClass: string
  description: string
}

const SHADOW_TOKENS: ShadowToken[] = [
  {
    name: "xs",
    cssVar: "--shadow-op-xs",
    tailwindClass: "shadow-op-xs",
    description: "0 1px 1px rgba(0,0,0,0.05)",
  },
  {
    name: "sm",
    cssVar: "--shadow-op-sm",
    tailwindClass: "shadow-op-sm",
    description: "0 1px 2px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.04)",
  },
]

// ── Section 래퍼 ──────────────────────────────────────────────
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-1 font-mono text-sm font-bold text-foreground">{children}</h2>
  )
}

// ── Spacing Story ─────────────────────────────────────────────
export const Spacing: Story = {
  name: "Spacing",
  render: () => (
    <div className="max-w-2xl py-6">
      <div className="mb-8">
        <h1 className="mb-1 text-2xl font-bold">Spacing Tokens</h1>
        <p className="text-sm text-muted-foreground">
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">--spacing-op-*</code>로
          정의. <code className="font-mono text-xs">p-op-xs</code> 등 prefixed 유틸리티 자동 생성.
          xs~xl은 <code className="font-mono text-xs">p-xs</code> 형태의 alias도 제공.
        </p>
      </div>

      <div className="space-y-3">
        {SPACING_TOKENS.map((t) => (
          <div key={t.name} className="grid grid-cols-[8rem_1fr_auto] items-center gap-4">
            {/* Bar */}
            <div className="flex items-center gap-2">
              <div
                className="h-5 rounded-sm bg-primary/70"
                style={{ width: t.value.split(" ")[0] }}
              />
              <span className="font-mono text-xs text-muted-foreground">{t.value}</span>
            </div>

            {/* Utility classes */}
            <div className="flex flex-wrap gap-1.5">
              <code className="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-[11px] text-primary">
                {t.themeUtility}
              </code>
              {t.aliasUtility && (
                <code className="rounded bg-accent/10 px-1.5 py-0.5 font-mono text-[11px] text-accent-foreground">
                  {t.aliasUtility} ✦ alias
                </code>
              )}
            </div>

            {/* CSS var */}
            <code className="whitespace-nowrap font-mono text-[10px] text-muted-foreground/60">
              {t.cssVar}
            </code>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-8 flex gap-4 rounded-lg border border-border bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
        <span>
          <code className="rounded bg-primary/10 px-1 font-mono text-primary">p-op-xs</code>{" "}
          — Tailwind 자동 생성 (prefix, 모든 spacing 속성)
        </span>
        <span>
          <code className="rounded bg-accent/10 px-1 font-mono text-accent-foreground">p-xs</code>{" "}
          — @utility alias (padding만, xs~xl 범위)
        </span>
      </div>
    </div>
  ),
}

// ── Radius Story ──────────────────────────────────────────────
export const Radius: Story = {
  name: "Border Radius",
  render: () => (
    <div className="max-w-2xl py-6">
      <div className="mb-8">
        <h1 className="mb-1 text-2xl font-bold">Border Radius Tokens</h1>
        <p className="text-sm text-muted-foreground">
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">@theme inline</code>에{" "}
          <code className="font-mono text-xs">--radius-*</code>로 정의 (고정값).{" "}
          Tailwind의 <code className="font-mono text-xs">rounded-*</code> 유틸리티를 design system 값으로 override.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {RADIUS_TOKENS.map((t) => (
          <div key={t.name} className="flex flex-col items-center gap-3">
            <div
              className={`h-16 w-full border-2 border-primary/40 bg-primary/10 ${t.tailwindClass}`}
            />
            <div className="text-center">
              <code className="block font-mono text-xs font-bold text-foreground">
                {t.tailwindClass}
              </code>
              <span className="block text-[11px] text-muted-foreground">{t.value}</span>
              {t.cssVar !== "—" && (
                <span className="block font-mono text-[10px] text-muted-foreground/60">
                  {t.cssVar}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-lg border border-border bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
        radius 토큰은 <code className="font-mono">op-</code> prefix 없이 사용 — Tailwind 기본
        rounded-* 값을 design system 고정값으로 의도적으로 교체.
      </div>
    </div>
  ),
}

// ── Shadow Story ──────────────────────────────────────────────
export const Shadow: Story = {
  name: "Shadow",
  render: () => (
    <div className="max-w-xl py-6">
      <div className="mb-8">
        <h1 className="mb-1 text-2xl font-bold">Shadow Tokens</h1>
        <p className="text-sm text-muted-foreground">
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">--shadow-op-*</code>로
          정의. <code className="font-mono text-xs">shadow-op-xs</code>,{" "}
          <code className="font-mono text-xs">shadow-op-sm</code> 유틸리티로 사용.
        </p>
      </div>

      <div className="space-y-8">
        {/* None (baseline) */}
        <div className="flex items-center gap-6">
          <div className="h-20 w-36 rounded-lg border border-border bg-card" />
          <div>
            <code className="block font-mono text-xs font-bold text-muted-foreground">
              shadow-none (기준)
            </code>
            <span className="text-xs text-muted-foreground">그림자 없음</span>
          </div>
        </div>

        {SHADOW_TOKENS.map((t) => (
          <div key={t.name} className="flex items-center gap-6">
            <div
              className={`h-20 w-36 rounded-lg border border-border bg-card ${t.tailwindClass}`}
            />
            <div>
              <code className="block font-mono text-xs font-bold text-primary">
                {t.tailwindClass}
              </code>
              <span className="block font-mono text-[11px] text-muted-foreground/80">
                {t.cssVar}
              </span>
              <span className="mt-1 block text-[11px] text-muted-foreground">
                {t.description}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
}

// ── All Tokens Overview ───────────────────────────────────────
export const Overview: Story = {
  name: "Overview",
  render: () => (
    <div className="max-w-2xl space-y-10 py-6">
      <div>
        <h1 className="mb-2 text-2xl font-bold">Design Token System</h1>
        <p className="text-sm text-muted-foreground">
          One Pointer 프로젝트의 디자인 토큰 구조. Tailwind v4{" "}
          <code className="font-mono text-xs">@theme inline</code> 기반.
        </p>
      </div>

      {/* Spacing preview */}
      <div>
        <SectionTitle>Spacing (op- prefix)</SectionTitle>
        <p className="mb-3 text-[13px] text-muted-foreground">
          CSS var: <code className="font-mono text-xs">--spacing-op-xs</code> →{" "}
          TW utility: <code className="font-mono text-xs">p-op-xs / w-op-xs / ...</code> →{" "}
          alias: <code className="font-mono text-xs">p-xs</code>
        </p>
        <div className="flex items-end gap-2">
          {SPACING_TOKENS.map((t) => (
            <div key={t.name} className="flex flex-col items-center gap-1">
              <div
                className="rounded-sm bg-primary/60"
                style={{ width: "1.5rem", height: t.value.split(" ")[0] }}
              />
              <span className="font-mono text-[10px] text-muted-foreground">{t.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Radius preview */}
      <div>
        <SectionTitle>Border Radius (no prefix — intentional override)</SectionTitle>
        <p className="mb-3 text-[13px] text-muted-foreground">
          CSS var: <code className="font-mono text-xs">--radius-sm</code> →{" "}
          TW utility: <code className="font-mono text-xs">rounded-sm</code> (Tailwind 기본값 교체)
        </p>
        <div className="flex gap-3">
          {RADIUS_TOKENS.slice(0, 6).map((t) => (
            <div key={t.name} className="flex flex-col items-center gap-1">
              <div
                className={`h-10 w-10 border-2 border-primary/40 bg-primary/10 ${t.tailwindClass}`}
              />
              <span className="font-mono text-[10px] text-muted-foreground">{t.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Shadow preview */}
      <div>
        <SectionTitle>Shadow (op- prefix)</SectionTitle>
        <p className="mb-3 text-[13px] text-muted-foreground">
          CSS var: <code className="font-mono text-xs">--shadow-op-xs</code> →{" "}
          TW utility: <code className="font-mono text-xs">shadow-op-xs</code>
        </p>
        <div className="flex gap-6">
          {SHADOW_TOKENS.map((t) => (
            <div key={t.name} className="flex flex-col items-center gap-2">
              <div className={`h-12 w-20 rounded-lg border border-border bg-card ${t.tailwindClass}`} />
              <code className="font-mono text-[10px] text-muted-foreground">{t.tailwindClass}</code>
            </div>
          ))}
        </div>
      </div>

      {/* Prefix strategy */}
      <div className="rounded-xl border border-border bg-muted/30 p-5">
        <p className="mb-2 font-mono text-xs font-bold text-foreground">Prefix 전략</p>
        <div className="grid grid-cols-3 gap-4 text-[12px] text-muted-foreground">
          <div>
            <p className="mb-1 font-semibold text-foreground">spacing / text / shadow</p>
            <p>
              <code className="font-mono text-primary">op-</code> infix prefix 사용.
              <br />
              <code className="font-mono text-xs">--spacing-op-md</code> →{" "}
              <code className="font-mono text-xs">p-op-md</code>
              <br />
              Tailwind 기본 유틸리티와 충돌 없음.
            </p>
          </div>
          <div>
            <p className="mb-1 font-semibold text-foreground">radius</p>
            <p>
              prefix 없이 <code className="font-mono text-primary">--radius-*</code>.
              <br />
              Tailwind의 <code className="font-mono text-xs">rounded-sm</code> 등을
              design system 값으로 의도적 override.
            </p>
          </div>
          <div>
            <p className="mb-1 font-semibold text-foreground">@utility alias</p>
            <p>
              <code className="font-mono text-accent-foreground">p-xs</code>,{" "}
              <code className="font-mono text-accent-foreground">text-body1</code> 등
              단축 alias 제공 (xs~xl 범위).
            </p>
          </div>
        </div>
      </div>
    </div>
  ),
}
