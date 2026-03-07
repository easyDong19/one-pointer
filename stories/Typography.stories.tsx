import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Text } from "@/shared/ui/text"
import type { TypographyToken } from "@/shared/ui/text"

const meta = {
  title: "Design/Typography",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "디자인 시스템 타이포그래피 토큰. `@utility` compound class로 정의되며 `Text` 컴포넌트의 `typography` prop으로 사용한다.",
      },
    },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

// ── 토큰 메타 정보 ──────────────────────────────────────────────
type TokenInfo = {
  token: TypographyToken
  cssVar: string
  size: string
  weight: string
  lineHeight: string
  extra?: string
}

const HEADING_TOKENS: TokenInfo[] = [
  { token: "h0-bold",    cssVar: "—",                  size: "2.5rem (40px)", weight: "Bold 700",   lineHeight: "136%" },
  { token: "h1-bold",    cssVar: "--text-op-h0",        size: "2rem (32px)",   weight: "Bold 700",   lineHeight: "136%" },
  { token: "h2-bold",    cssVar: "--text-op-h1",        size: "1.75rem (28px)",weight: "Bold 700",   lineHeight: "136%" },
  { token: "h3-bold",    cssVar: "--text-op-h2",        size: "1.5rem (24px)", weight: "Bold 700",   lineHeight: "136%" },
  { token: "title-bold", cssVar: "--text-op-h3",        size: "1.375rem (22px)",weight: "Bold 700",  lineHeight: "136%" },
]

const SUBTITLE_TOKENS: TokenInfo[] = [
  { token: "subtitle1-bold",   cssVar: "--text-op-title",     size: "1.25rem (20px)",  weight: "Bold 700",   lineHeight: "136%" },
  { token: "subtitle2-bold",   cssVar: "--text-op-subtitle1", size: "1.125rem (18px)", weight: "Bold 700",   lineHeight: "136%" },
  { token: "subtitle2-medium", cssVar: "--text-op-subtitle1", size: "1.125rem (18px)", weight: "Medium 500", lineHeight: "136%" },
]

const BODY_TOKENS: TokenInfo[] = [
  { token: "body1-bold",    cssVar: "--text-op-body1", size: "1rem (16px)",     weight: "Bold 700",    lineHeight: "136%" },
  { token: "body1-medium",  cssVar: "--text-op-body1", size: "1rem (16px)",     weight: "Medium 500",  lineHeight: "136%" },
  { token: "body1-regular", cssVar: "--text-op-body1", size: "1rem (16px)",     weight: "Regular 400", lineHeight: "136%" },
  { token: "body2-bold",    cssVar: "--text-op-body2", size: "0.9375rem (15px)",weight: "Bold 700",    lineHeight: "136%" },
  { token: "body2-medium",  cssVar: "--text-op-body2", size: "0.9375rem (15px)",weight: "Medium 500",  lineHeight: "136%" },
  { token: "body2-regular", cssVar: "--text-op-body2", size: "0.9375rem (15px)",weight: "Regular 400", lineHeight: "136%" },
  { token: "body3-bold",    cssVar: "--text-op-body3", size: "0.875rem (14px)", weight: "Bold 700",    lineHeight: "130%" },
  { token: "body3-medium",  cssVar: "--text-op-body3", size: "0.875rem (14px)", weight: "Medium 500",  lineHeight: "130%" },
  { token: "body3-regular", cssVar: "--text-op-body3", size: "0.875rem (14px)", weight: "Regular 400", lineHeight: "130%" },
]

const CAPTION_TOKENS: TokenInfo[] = [
  { token: "caption1-bold",   cssVar: "--text-op-caption1", size: "0.8125rem (13px)", weight: "Bold 700",   lineHeight: "136%" },
  { token: "caption1-medium", cssVar: "--text-op-caption1", size: "0.8125rem (13px)", weight: "Medium 500", lineHeight: "136%" },
  { token: "caption2-bold",   cssVar: "--text-op-caption2", size: "0.75rem (12px)",   weight: "Bold 700",   lineHeight: "136%" },
  { token: "caption2-medium", cssVar: "--text-op-caption2", size: "0.75rem (12px)",   weight: "Medium 500", lineHeight: "136%" },
  { token: "caption3-bold",   cssVar: "--text-op-caption3", size: "0.6875rem (11px)", weight: "Bold 700",   lineHeight: "136%", extra: "tracking: -0.006875rem" },
]

// ── 공통 행 컴포넌트 ──────────────────────────────────────────────
function TokenRow({ info }: { info: TokenInfo }) {
  return (
    <div className="grid grid-cols-[1fr_auto] items-baseline gap-x-8 border-b border-border py-3 last:border-0">
      <Text as="p" typography={info.token}>
        안녕하세요, One Pointer — The quick brown fox
      </Text>
      <div className="flex shrink-0 flex-col items-end gap-0.5 text-right">
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-primary">
          {info.token}
        </code>
        <span className="font-mono text-[11px] text-muted-foreground">
          {info.size} · {info.weight} · lh {info.lineHeight}
          {info.extra ? ` · ${info.extra}` : ""}
        </span>
        {info.cssVar !== "—" && (
          <span className="font-mono text-[10px] text-muted-foreground/60">
            {info.cssVar}
          </span>
        )}
      </div>
    </div>
  )
}

// ── 섹션 컴포넌트 ──────────────────────────────────────────────
function Section({ title, description, tokens }: { title: string; description: string; tokens: TokenInfo[] }) {
  return (
    <div className="mb-10">
      <div className="mb-4">
        <h2 className="mb-1 font-mono text-sm font-bold text-foreground">{title}</h2>
        <p className="text-[13px] text-muted-foreground">{description}</p>
      </div>
      <div className="rounded-xl border border-border bg-card px-6">
        {tokens.map((info) => (
          <TokenRow key={info.token} info={info} />
        ))}
      </div>
    </div>
  )
}

// ── Stories ──────────────────────────────────────────────────────
export const AllTokens: Story = {
  name: "All Typography Tokens",
  render: () => (
    <div className="mx-auto max-w-3xl py-8">
      <div className="mb-10">
        <h1 className="mb-2 text-2xl font-bold text-foreground">Typography System</h1>
        <p className="text-sm text-muted-foreground">
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{"<Text typography=\"{token}\" />"}</code>{" "}
          prop으로 사용. 각 토큰은{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">@utility</code>로
          정의된 compound CSS class이며 <code className="font-mono text-xs">font-size</code>,{" "}
          <code className="font-mono text-xs">line-height</code>,{" "}
          <code className="font-mono text-xs">font-weight</code>를 포함한다.
        </p>
      </div>

      <Section
        title="Headings"
        description="페이지/섹션 제목. h0-bold는 CSS 변수 없이 2.5rem 고정값 사용."
        tokens={HEADING_TOKENS}
      />
      <Section
        title="Subtitles"
        description="카드 타이틀, 그룹 헤더 등 중간 강조 레벨."
        tokens={SUBTITLE_TOKENS}
      />
      <Section
        title="Body"
        description="일반 본문 텍스트. regular/medium/bold 세 가지 weight."
        tokens={BODY_TOKENS}
      />
      <Section
        title="Caption"
        description="보조 정보, 메타 데이터, 레이블 등 소형 텍스트."
        tokens={CAPTION_TOKENS}
      />
    </div>
  ),
}

export const Headings: Story = {
  name: "Headings",
  render: () => (
    <div className="space-y-6 py-4">
      {HEADING_TOKENS.map((info) => (
        <div key={info.token}>
          <Text as="p" typography={info.token}>
            페이지 타이틀 예시 — Page Title
          </Text>
          <code className="mt-1 block font-mono text-[11px] text-muted-foreground">
            typography="{info.token}" · {info.size}
          </code>
        </div>
      ))}
    </div>
  ),
}

export const BodyText: Story = {
  name: "Body Text",
  render: () => (
    <div className="max-w-xl space-y-8 py-4">
      {(["body1", "body2", "body3"] as const).map((level) => (
        <div key={level} className="space-y-2">
          <p className="font-mono text-xs text-muted-foreground">{level}</p>
          {(["bold", "medium", "regular"] as const).map((weight) => {
            const token = `${level}-${weight}` as TypographyToken
            return (
              <Text key={token} as="p" typography={token}>
                한글 본문 텍스트 예시입니다. 서비스의 주요 설명 및 안내 문구에 사용합니다. The quick brown fox jumps over the lazy dog.
              </Text>
            )
          })}
        </div>
      ))}
    </div>
  ),
}

export const Usage: Story = {
  name: "Usage Example",
  render: () => (
    <div className="max-w-sm rounded-xl border border-border bg-card p-6 shadow-sm">
      <Text as="h2" typography="subtitle1-bold" className="mb-1 text-foreground">
        카드 타이틀
      </Text>
      <Text as="p" typography="body2-regular" className="mb-4 text-muted-foreground">
        카드 본문 설명입니다. body2-regular로 작성된 보조 설명 텍스트입니다.
      </Text>
      <div className="flex items-center justify-between">
        <Text as="span" typography="caption1-medium" className="text-muted-foreground">
          2026년 3월 7일
        </Text>
        <Text as="span" typography="body3-bold" className="text-primary">
          자세히 보기
        </Text>
      </div>
    </div>
  ),
}
