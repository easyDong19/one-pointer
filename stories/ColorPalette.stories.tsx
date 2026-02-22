import type { Meta, StoryObj } from "@storybook/nextjs-vite"

type Swatch = {
  name: string
  token: string
  tailwindClass: string
  swatchClass: string
  lightHex: string
  darkHex: string
}

type ForegroundPair = {
  name: string
  backgroundToken: string
  foregroundToken: string
  backgroundClass: string
  foregroundClass: string
  lightBackgroundHex: string
  lightForegroundHex: string
  darkBackgroundHex: string
  darkForegroundHex: string
  sampleText: string
}

const brandSwatches: Swatch[] = [
  {
    name: "Primary",
    token: "--primary",
    tailwindClass: "bg-primary",
    swatchClass: "bg-primary",
    lightHex: "#6C5CE7",
    darkHex: "#6C5CE7",
  },
  {
    name: "Primary Hover",
    token: "--primary-hover",
    tailwindClass: "bg-primary-hover",
    swatchClass: "bg-primary-hover",
    lightHex: "#5B4BD6",
    darkHex: "#7A6CF2",
  },
  {
    name: "Primary Light (Background)",
    token: "--primary-light",
    tailwindClass: "bg-primary-light",
    swatchClass: "bg-primary-light",
    lightHex: "#F1EEFF",
    darkHex: "#2A2450",
  },
  {
    name: "Secondary",
    token: "--secondary",
    tailwindClass: "bg-secondary",
    swatchClass: "bg-secondary",
    lightHex: "#334155",
    darkHex: "#1F2937",
  },
  {
    name: "Accent",
    token: "--accent",
    tailwindClass: "bg-accent",
    swatchClass: "bg-accent",
    lightHex: "#14B8A6",
    darkHex: "#2DD4BF",
  },
  {
    name: "Success",
    token: "--success",
    tailwindClass: "bg-success",
    swatchClass: "bg-success",
    lightHex: "#16A34A",
    darkHex: "#22C55E",
  },
  {
    name: "Warning",
    token: "--warning",
    tailwindClass: "bg-warning",
    swatchClass: "bg-warning",
    lightHex: "#D97706",
    darkHex: "#F59E0B",
  },
  {
    name: "Destructive",
    token: "--destructive",
    tailwindClass: "bg-destructive",
    swatchClass: "bg-destructive",
    lightHex: "#DC2626",
    darkHex: "#F87171",
  },
]

const neutralSwatches: Swatch[] = [
  {
    name: "Neutral 50",
    token: "--neutral-50",
    tailwindClass: "bg-neutral-50",
    swatchClass: "bg-neutral-50",
    lightHex: "#F8FAFC",
    darkHex: "#F8FAFC",
  },
  {
    name: "Neutral 100",
    token: "--neutral-100",
    tailwindClass: "bg-neutral-100",
    swatchClass: "bg-neutral-100",
    lightHex: "#F1F5F9",
    darkHex: "#F1F5F9",
  },
  {
    name: "Neutral 200",
    token: "--neutral-200",
    tailwindClass: "bg-neutral-200",
    swatchClass: "bg-neutral-200",
    lightHex: "#E2E8F0",
    darkHex: "#E2E8F0",
  },
  {
    name: "Neutral 300",
    token: "--neutral-300",
    tailwindClass: "bg-neutral-300",
    swatchClass: "bg-neutral-300",
    lightHex: "#CBD5E1",
    darkHex: "#CBD5E1",
  },
  {
    name: "Neutral 400",
    token: "--neutral-400",
    tailwindClass: "bg-neutral-400",
    swatchClass: "bg-neutral-400",
    lightHex: "#94A3B8",
    darkHex: "#94A3B8",
  },
  {
    name: "Neutral 500",
    token: "--neutral-500",
    tailwindClass: "bg-neutral-500",
    swatchClass: "bg-neutral-500",
    lightHex: "#64748B",
    darkHex: "#64748B",
  },
  {
    name: "Neutral 600",
    token: "--neutral-600",
    tailwindClass: "bg-neutral-600",
    swatchClass: "bg-neutral-600",
    lightHex: "#475569",
    darkHex: "#475569",
  },
  {
    name: "Neutral 700",
    token: "--neutral-700",
    tailwindClass: "bg-neutral-700",
    swatchClass: "bg-neutral-700",
    lightHex: "#334155",
    darkHex: "#334155",
  },
  {
    name: "Neutral 800",
    token: "--neutral-800",
    tailwindClass: "bg-neutral-800",
    swatchClass: "bg-neutral-800",
    lightHex: "#1E293B",
    darkHex: "#1E293B",
  },
  {
    name: "Neutral 900",
    token: "--neutral-900",
    tailwindClass: "bg-neutral-900",
    swatchClass: "bg-neutral-900",
    lightHex: "#0F172A",
    darkHex: "#0F172A",
  },
]

const foregroundPairs: ForegroundPair[] = [
  {
    name: "Base Page Text",
    backgroundToken: "--background",
    foregroundToken: "--foreground",
    backgroundClass: "bg-background",
    foregroundClass: "text-foreground",
    lightBackgroundHex: "#FCFCFE",
    lightForegroundHex: "#111827",
    darkBackgroundHex: "#0F1221",
    darkForegroundHex: "#E2E8F0",
    sampleText: "Readable default body text",
  },
  {
    name: "Muted Text",
    backgroundToken: "--muted",
    foregroundToken: "--muted-foreground",
    backgroundClass: "bg-muted",
    foregroundClass: "text-muted-foreground",
    lightBackgroundHex: "#F1F5F9",
    lightForegroundHex: "#475569",
    darkBackgroundHex: "#1E293B",
    darkForegroundHex: "#94A3B8",
    sampleText: "Secondary information or helper text",
  },
  {
    name: "Card Text",
    backgroundToken: "--card",
    foregroundToken: "--card-foreground",
    backgroundClass: "bg-card",
    foregroundClass: "text-card-foreground",
    lightBackgroundHex: "#FFFFFF",
    lightForegroundHex: "#111827",
    darkBackgroundHex: "#171C32",
    darkForegroundHex: "#E2E8F0",
    sampleText: "Content inside cards and panels",
  },
  {
    name: "Primary Action",
    backgroundToken: "--primary",
    foregroundToken: "--primary-foreground",
    backgroundClass: "bg-primary",
    foregroundClass: "text-primary-foreground",
    lightBackgroundHex: "#6C5CE7",
    lightForegroundHex: "#FFFFFF",
    darkBackgroundHex: "#6C5CE7",
    darkForegroundHex: "#F8F7FF",
    sampleText: "Main CTA text",
  },
  {
    name: "Secondary Action",
    backgroundToken: "--secondary",
    foregroundToken: "--secondary-foreground",
    backgroundClass: "bg-secondary",
    foregroundClass: "text-secondary-foreground",
    lightBackgroundHex: "#334155",
    lightForegroundHex: "#F8FAFC",
    darkBackgroundHex: "#1F2937",
    darkForegroundHex: "#F8FAFC",
    sampleText: "Secondary button or chip text",
  },
  {
    name: "Accent Highlight",
    backgroundToken: "--accent",
    foregroundToken: "--accent-foreground",
    backgroundClass: "bg-accent",
    foregroundClass: "text-accent-foreground",
    lightBackgroundHex: "#14B8A6",
    lightForegroundHex: "#042F2E",
    darkBackgroundHex: "#2DD4BF",
    darkForegroundHex: "#042F2E",
    sampleText: "Highlighted interactive surface",
  },
  {
    name: "Success State",
    backgroundToken: "--success",
    foregroundToken: "--success-foreground",
    backgroundClass: "bg-success",
    foregroundClass: "text-success-foreground",
    lightBackgroundHex: "#16A34A",
    lightForegroundHex: "#052E16",
    darkBackgroundHex: "#22C55E",
    darkForegroundHex: "#052E16",
    sampleText: "Completion and positive status",
  },
  {
    name: "Warning State",
    backgroundToken: "--warning",
    foregroundToken: "--warning-foreground",
    backgroundClass: "bg-warning",
    foregroundClass: "text-warning-foreground",
    lightBackgroundHex: "#D97706",
    lightForegroundHex: "#1F2937",
    darkBackgroundHex: "#F59E0B",
    darkForegroundHex: "#1F2937",
    sampleText: "Caution and non-destructive alerts",
  },
  {
    name: "Destructive State",
    backgroundToken: "--destructive",
    foregroundToken: "--destructive-foreground",
    backgroundClass: "bg-destructive",
    foregroundClass: "text-destructive-foreground",
    lightBackgroundHex: "#DC2626",
    lightForegroundHex: "#FFFFFF",
    darkBackgroundHex: "#F87171",
    darkForegroundHex: "#1F2937",
    sampleText: "Danger actions and errors",
  },
]

const meta = {
  title: "Design/Color Palette",
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

function SwatchCard({ swatch, isDark }: { swatch: Swatch; isDark: boolean }) {
  return (
    <div className="border-border bg-card space-y-3 rounded-xl border p-3">
      <div className={`border-border h-16 rounded-md border ${swatch.swatchClass}`} />
      <div className="space-y-1">
        <p className="text-card-foreground text-sm font-semibold">{swatch.name}</p>
        <p className="text-muted-foreground text-xs">
          {swatch.token} / {swatch.tailwindClass}
        </p>
        <p className="text-muted-foreground text-xs">{isDark ? swatch.darkHex : swatch.lightHex}</p>
      </div>
    </div>
  )
}

function ForegroundPairCard({ pair, isDark }: { pair: ForegroundPair; isDark: boolean }) {
  return (
    <div className="border-border bg-card space-y-3 rounded-xl border p-3">
      <div
        className={`border-border flex h-16 items-center rounded-md border px-3 ${pair.backgroundClass}`}
      >
        <p className={`text-sm font-semibold ${pair.foregroundClass}`}>{pair.sampleText}</p>
      </div>
      <div className="space-y-1">
        <p className="text-card-foreground text-sm font-semibold">{pair.name}</p>
        <p className="text-muted-foreground text-xs">
          {pair.backgroundToken}/{pair.foregroundToken}
        </p>
        <p className="text-muted-foreground text-xs">
          {isDark
            ? `${pair.darkBackgroundHex} + ${pair.darkForegroundHex}`
            : `${pair.lightBackgroundHex} + ${pair.lightForegroundHex}`}
        </p>
      </div>
    </div>
  )
}

function PaletteSection({ title, isDark }: { title: string; isDark: boolean }) {
  return (
    <section className="border-border bg-background text-foreground space-y-8 rounded-2xl border p-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="text-muted-foreground text-sm">
          Primary base color is fixed to <code>#6C5CE7</code> in light mode.
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-base font-semibold">Brand + Semantic Colors</h3>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {brandSwatches.map((swatch) => (
            <SwatchCard key={swatch.name} swatch={swatch} isDark={isDark} />
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-base font-semibold">Foreground Pair Tokens</h3>
        <p className="text-muted-foreground text-sm">
          Match text color with the paired foreground token of each background token.
        </p>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {foregroundPairs.map((pair) => (
            <ForegroundPairCard key={pair.name} pair={pair} isDark={isDark} />
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-base font-semibold">Neutral Gray Scale</h3>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {neutralSwatches.map((swatch) => (
            <SwatchCard key={swatch.name} swatch={swatch} isDark={isDark} />
          ))}
        </div>
      </div>
    </section>
  )
}

export const Light: Story = {
  render: () => (
    <div className="bg-neutral-50 p-8">
      <PaletteSection title="Light Mode Palette" isDark={false} />
    </div>
  ),
}

export const Dark: Story = {
  render: () => (
    <div className="dark bg-background p-8">
      <PaletteSection title="Dark Mode Palette" isDark />
    </div>
  ),
}

export const LightAndDark: Story = {
  render: () => (
    <div className="grid gap-8 bg-neutral-100 p-8 xl:grid-cols-2">
      <PaletteSection title="Light Mode Palette" isDark={false} />
      <div className="dark">
        <PaletteSection title="Dark Mode Palette" isDark />
      </div>
    </div>
  ),
}
