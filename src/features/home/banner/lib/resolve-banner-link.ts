/**
 * 배너 linkUrl 의 내부/외부 분기 헬퍼.
 *
 * docs/detail/home-banner.md §7 참조.
 * - `/...` 로 시작 → 내부 라우팅 (next/link)
 * - `http(s)://...` → 외부 새창
 * - 그 외 (빈/null/unknown scheme) → 비활성 (kind: "none")
 */

export type ResolvedBannerLink =
  | { kind: "none" }
  | { kind: "internal"; href: string }
  | { kind: "external"; href: string }

export function resolveBannerLink(linkUrl: string | null | undefined): ResolvedBannerLink {
  if (!linkUrl) return { kind: "none" }
  if (linkUrl.startsWith("/")) return { kind: "internal", href: linkUrl }
  if (/^https?:\/\//.test(linkUrl)) return { kind: "external", href: linkUrl }
  return { kind: "none" }
}
