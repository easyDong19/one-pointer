import { http, HttpResponse } from "msw"
import { apiPath } from "./respond"

/**
 * 외부 이미지 호스트 없이 스크린샷을 채우기 위한 SVG 플레이스홀더.
 * 같은 seed 는 항상 같은 색을 내므로 캡처 결과가 재현 가능하다.
 */
export const MOCK_ORIGIN = process.env.MOCK_ORIGIN ?? "http://localhost:9090"

type AssetKind = "avatar" | "cover" | "banner" | "icon"

const PALETTE = [
  ["#6366f1", "#a5b4fc"],
  ["#0ea5e9", "#7dd3fc"],
  ["#10b981", "#6ee7b7"],
  ["#f59e0b", "#fcd34d"],
  ["#ef4444", "#fca5a5"],
  ["#8b5cf6", "#c4b5fd"],
  ["#ec4899", "#f9a8d4"],
  ["#14b8a6", "#5eead4"],
] as const

function hash(seed: string): number {
  let h = 0
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return h
}

function escapeXml(value: string): string {
  return value.replace(/[<>&"']/g, (c) => `&#${c.charCodeAt(0)};`)
}

/** 픽스처에서 쓰는 이미지 URL 빌더. label 은 이미지 안에 그려질 텍스트. */
export function asset(kind: AssetKind, seed: string, label?: string): string {
  const query = label ? `?label=${encodeURIComponent(label)}` : ""
  return `${MOCK_ORIGIN}/mock-assets/${kind}/${encodeURIComponent(seed)}.svg${query}`
}

function renderSvg(kind: AssetKind, seed: string, label: string): string {
  const [strong, soft] = PALETTE[hash(seed) % PALETTE.length]
  const text = escapeXml(label)
  const font = `font-family="Pretendard, -apple-system, sans-serif"`

  switch (kind) {
    case "avatar":
      return `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${soft}"/><stop offset="1" stop-color="${strong}"/></linearGradient></defs>
  <rect width="120" height="120" fill="url(#g)"/>
  <text x="60" y="60" dy="0.35em" text-anchor="middle" ${font} font-size="48" font-weight="700" fill="#fff">${text.slice(0, 1)}</text>
</svg>`
    case "icon":
      return `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
  <rect x="4" y="4" width="56" height="56" rx="16" fill="${soft}" opacity="0.35"/>
  <text x="32" y="32" dy="0.35em" text-anchor="middle" font-size="30">${text}</text>
</svg>`
    case "banner": {
      // 모바일 캐러셀(object-cover)에서 좌우가 잘려도 보이도록 중앙 정렬 + 길이에 맞춰 축소
      const fontSize = Math.min(60, Math.floor(860 / Math.max(label.length, 1)))
      return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="400" viewBox="0 0 1200 400">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${strong}"/><stop offset="1" stop-color="${soft}"/></linearGradient></defs>
  <rect width="1200" height="400" fill="url(#g)"/>
  <circle cx="1020" cy="80" r="180" fill="#fff" opacity="0.12"/>
  <circle cx="1120" cy="340" r="120" fill="#fff" opacity="0.1"/>
  <text x="600" y="200" dy="0.35em" text-anchor="middle" ${font} font-size="${fontSize}" font-weight="800" fill="#fff">${text}</text>
</svg>`
    }
    case "cover":
    default: {
      // 정사각 썸네일(object-cover)로 잘려도 보이도록 중앙 520px 안에 라벨을 맞춘다
      const fontSize = Math.min(56, Math.floor(480 / Math.max(label.length, 1)))
      return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${soft}"/><stop offset="1" stop-color="${strong}"/></linearGradient></defs>
  <rect width="800" height="600" fill="url(#g)"/>
  <circle cx="620" cy="140" r="110" fill="#fff" opacity="0.16"/>
  <circle cx="170" cy="500" r="80" fill="#fff" opacity="0.1"/>
  <text x="400" y="290" text-anchor="middle" ${font} font-size="${fontSize}" font-weight="800" fill="#fff">${text}</text>
  <rect x="270" y="340" width="260" height="20" rx="10" fill="#fff" opacity="0.35"/>
  <rect x="320" y="374" width="160" height="20" rx="10" fill="#fff" opacity="0.25"/>
</svg>`
    }
  }
}

export const assetHandlers = [
  http.get(apiPath("/mock-assets/:kind/:file"), ({ params, request }) => {
    const kind = String(params.kind) as AssetKind
    const seed = String(params.file).replace(/\.svg$/, "")
    const label = new URL(request.url).searchParams.get("label") ?? seed
    return new HttpResponse(renderSvg(kind, seed, label), {
      headers: { "content-type": "image/svg+xml", "cache-control": "public, max-age=3600" },
    })
  }),
]
