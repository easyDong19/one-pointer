import type { TypographyToken } from "./Text.types"

export const TYPOGRAPHY_CLASS_MAP: Record<TypographyToken, string> = {
  "caption3-bold":   "caption3-bold",
  "caption2-medium": "caption2-medium",
  "caption2-bold":   "caption2-bold",
  "caption1-medium": "caption1-medium",
  "caption1-bold":   "caption1-bold",
  "body3-regular":   "body3-regular",
  "body3-medium":    "body3-medium",
  "body3-bold":      "body3-bold",
  "body2-regular":   "body2-regular",
  "body2-medium":    "body2-medium",
  "body2-bold":      "body2-bold",
  "body1-regular":   "body1-regular",
  "body1-medium":    "body1-medium",
  "body1-bold":      "body1-bold",
  "subtitle2-medium": "subtitle2-medium",
  "subtitle2-bold":   "subtitle2-bold",
  "subtitle1-bold":   "subtitle1-bold",
  "title-bold":      "title-bold",
  "h3-bold":         "h3-bold",
  "h2-bold":         "h2-bold",
  "h1-bold":         "h1-bold",
  "h0-bold":         "h0-bold",
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
