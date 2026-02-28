import type { TypographyToken } from "./Text.types"

export const TYPOGRAPHY_CLASS_MAP: Record<TypographyToken, string> = {
  "caption3-bold": "text-[0.6875rem] font-bold leading-[136%] tracking-[-0.006875rem]",
  "caption2-medium": "text-[0.75rem] leading-[136%] font-medium",
  "caption2-bold": "text-[0.75rem] leading-[136%] font-bold",
  "caption1-medium": "text-[0.8125rem] leading-[136%] font-medium",
  "caption1-bold": "text-[0.8125rem] leading-[136%] font-bold",
  "body3-medium": "text-[0.875rem] leading-[130%] font-medium",
  "body3-bold": "text-[0.875rem] leading-[130%] font-bold",
  "body3-regular": "text-[0.875rem] leading-[130%] font-normal",
  "body2-medium": "text-[0.9375rem] leading-[136%] font-medium",
  "body2-bold": "text-[0.9375rem] leading-[136%] font-bold",
  "body2-regular": "text-[0.9375rem] leading-[136%] font-normal",
  "body1-medium": "text-[1rem] leading-[136%] font-medium",
  "body1-bold": "text-[1rem] leading-[136%] font-bold",
  "body1-regular": "text-[1rem] leading-[136%] font-normal",
  "subtitle2-medium": "text-[1.125rem] leading-[136%] font-medium",
  "subtitle2-bold": "text-[1.125rem] leading-[136%] font-bold",
  "subtitle1-bold": "text-[1.25rem] leading-[136%] font-bold",
  "title-bold": "text-[1.375rem] leading-[136%] font-bold",
  "h3-bold": "text-[1.5rem] leading-[136%] font-bold",
  "h2-bold": "text-[1.75rem] leading-[136%] font-bold",
  "h1-bold": "text-[2rem] leading-[136%] font-bold",
  "h0-bold": "text-[2.5rem] leading-[136%] font-bold",
}

const toVariantClass = (className: string, variant: string) =>
  className
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => `${variant}:${token}`)
    .join(" ")

export const TYPOGRAPHY_PLACEHOLDER_CLASS_MAP: Record<TypographyToken, string> = Object.fromEntries(
  Object.entries(TYPOGRAPHY_CLASS_MAP).map(([token, className]) => [
    token,
    toVariantClass(className, "placeholder"),
  ]),
) as Record<TypographyToken, string>
