import { http, HttpResponse, type RequestHandler } from "msw"
import {
  expertDetailResponseSchema,
  expertListResponseSchema,
  popularExpertListResponseSchema,
} from "@/entities/expert/api/expert.schema"
import {
  clientDashboardResponseSchema,
  expertDashboardResponseSchema,
  expertProfileExistsResponseSchema,
  myExpertProfileResponseSchema,
} from "@/entities/user/api/user.schema"
import {
  earningsSummaryResponseSchema,
  transactionsResponseSchema,
} from "@/entities/earnings/api/earnings.schema"
import {
  couponBalanceResponseSchema,
  couponClaimResponseSchema,
  couponPurchaseListResponseSchema,
  couponPurchaseResponseSchema,
  directRequestCouponBalanceResponseSchema,
  kakaoShareCouponResponseSchema,
  referralStatusResponseSchema,
} from "@/entities/coupon/api/coupon.schema"
import {
  fileBulkUploadResponseSchema,
  fileUploadResponseSchema,
  imageBulkUploadResponseSchema,
  imageUploadResponseSchema,
} from "@/entities/media/api/media.schema"
import {
  COUPON_PACKAGES,
  DIRECT_REQUEST_COUPON_BALANCE,
  activityMethodOf,
  buildCouponPurchases,
  buildEarningsSummary,
  buildExpertDetail,
  buildExpertSummary,
  buildMyExpertProfile,
  buildTransactions,
  clientDashboard,
  couponBalance,
  expertDashboard,
  majorCategoryIdsOf,
  referralStatus,
  regionsOf,
  subCategoryIdsOf,
} from "../fixtures/expert"
import { MOCK_ORIGIN, asset } from "../lib/assets"
import { apiPath, mock, mockOk, type EnvelopeData } from "../lib/respond"
import { minutesAgo } from "../lib/time"
import { EXPERTS, ME, type Expert } from "../world"

// ─── helpers ─────────────────────────────────────────────────────────────────

const findExpert = (id: unknown): Expert | undefined =>
  EXPERTS.find((e) => e.expertProfileId === Number(id))

const notFound = (message: string) =>
  HttpResponse.json({ success: false, message, data: null }, { status: 404 })

/** 홈 · 카테고리의 "인기 전문가" — 본인(ME) 은 제외하고 매칭 수 순 */
const popularExperts = () =>
  EXPERTS.filter((e) => e.expertProfileId !== ME.expertProfileId).sort(
    (a, b) => b.matchCount - a.matchCount,
  )

function filterExperts(params: URLSearchParams): Expert[] {
  const majorCategoryId = Number(params.get("majorCategoryId")) || null
  const subCategoryId = Number(params.get("subCategoryId")) || null
  const method = params.get("method")
  const region = params.get("region")
  const minRating = Number(params.get("minRating")) || null
  const sortBy = params.get("sortBy") ?? "RATING_DESC"

  const list = EXPERTS.filter((e) => {
    if (majorCategoryId && !majorCategoryIdsOf(e).includes(majorCategoryId)) return false
    if (subCategoryId && !subCategoryIdsOf(e).includes(subCategoryId)) return false
    if (method && method !== "BOTH") {
      const m = activityMethodOf(e)
      if (m !== "BOTH" && m !== method) return false
    }
    if (region && !regionsOf(e).some((r) => r.includes(region) || region.includes(r))) return false
    if (minRating && e.rating < minRating) return false
    return true
  })

  return list.sort((a, b) => {
    if (sortBy === "MATCH_COUNT_DESC") return b.matchCount - a.matchCount
    if (sortBy === "LATEST") return b.expertProfileId - a.expertProfileId
    return b.rating - a.rating || b.reviewCount - a.reviewCount
  })
}

/** multipart 의 파일 개수 (실패하면 기본값) */
async function countFiles(request: Request, field: string, fallback: number): Promise<number> {
  try {
    const form = await request.formData()
    const count = form.getAll(field).length
    return count > 0 ? count : fallback
  } catch {
    return fallback
  }
}

function uploadedImageUrl(domain: string | null, idx = 0): string {
  const seed = `upload-${(domain ?? "image").toLowerCase()}-${Date.now()}-${idx}`
  switch (domain) {
    case "PROFILE":
      return asset("avatar", seed, ME.nickname)
    case "EXPERT_BANNER":
      return asset("cover", seed, "새 배너 이미지")
    case "PORTFOLIO":
      return asset("cover", seed, `포트폴리오 ${idx + 1}`)
    case "CERTIFICATION":
      return asset("cover", seed, "자격증 사본")
    default:
      return asset("cover", seed, `첨부 이미지 ${idx + 1}`)
  }
}

const uploadedPdfUrl = (idx = 0) => `${MOCK_ORIGIN}/mock-files/upload-${Date.now()}-${idx}.pdf`

// ─── expert (공개) ───────────────────────────────────────────────────────────

const expertHandlers = [
  mock("get", "/v1/api/expert/popular", popularExpertListResponseSchema, () =>
    popularExperts().map(buildExpertSummary),
  ),

  mock(
    "get",
    "/v1/api/expert/popular/subcategory/:subCategoryId",
    popularExpertListResponseSchema,
    ({ params }) => {
      const subCategoryId = Number(params.subCategoryId)
      const pool = popularExperts()
      const exact = pool.filter((e) => subCategoryIdsOf(e).includes(subCategoryId))
      if (exact.length > 0) return exact.map(buildExpertSummary)
      // 같은 대분류 전문가로 폴백 — 소분류에 전문가가 없을 때도 섹션이 비지 않게
      const sameMajor = pool.filter((e) =>
        majorCategoryIdsOf(e).some((id) => Math.floor(subCategoryId / 10) === id),
      )
      return sameMajor.map(buildExpertSummary)
    },
  ),

  mock("get", "/v1/api/expert", expertListResponseSchema, ({ request }) => {
    const params = new URL(request.url).searchParams
    return {
      content: filterExperts(params).map(buildExpertSummary),
      nextCursor: null,
      hasNext: false,
    }
  }),

  http.get(apiPath("/v1/api/expert/:expertProfileId"), ({ params }) =>
    findExpert(params.expertProfileId) ? undefined : notFound("존재하지 않는 전문가입니다."),
  ),
  mock("get", "/v1/api/expert/:expertProfileId", expertDetailResponseSchema, ({ params }) =>
    buildExpertDetail(findExpert(params.expertProfileId) ?? EXPERTS[1]),
  ),
]

// ─── user (GET /v1/api/user/me 는 auth.ts 담당) ──────────────────────────────

const userHandlers = [
  // 고정 경로 먼저 — `/v1/api/user/expert/:id` 보다 앞
  mock("get", "/v1/api/user/expert/me", myExpertProfileResponseSchema, () =>
    buildMyExpertProfile(),
  ),
  mock("get", "/v1/api/user/expert/exists", expertProfileExistsResponseSchema, () => true),
  mock(
    "get",
    "/v1/api/user/expert/dashboard",
    expertDashboardResponseSchema,
    () => expertDashboard,
  ),
  mock(
    "get",
    "/v1/api/user/client/dashboard",
    clientDashboardResponseSchema,
    () => clientDashboard,
  ),

  // 수익
  mock("get", "/v1/api/user/expert/earnings", earningsSummaryResponseSchema, ({ request }) =>
    buildEarningsSummary(new URL(request.url).searchParams),
  ),
  mock(
    "get",
    "/v1/api/user/expert/earnings/transactions",
    transactionsResponseSchema,
    ({ request }) => ({
      content: buildTransactions(new URL(request.url).searchParams.get("status")),
      nextCursor: null,
      hasNext: false,
    }),
  ),

  http.get(apiPath("/v1/api/user/expert/:id"), ({ params }) =>
    findExpert(params.id) ? undefined : notFound("존재하지 않는 전문가입니다."),
  ),
  mock("get", "/v1/api/user/expert/:id", expertDetailResponseSchema, ({ params }) =>
    buildExpertDetail(findExpert(params.id) ?? EXPERTS[0]),
  ),

  // mutations
  mockOk("put", "/v1/api/user/me"),
  // 회원 탈퇴 — withdrawResponseSchema(success: boolean, data nullish) 와 호환되는 OK 응답
  mockOk("delete", "/v1/api/user/me"),
  mockOk("put", "/v1/api/user/fcm-token"),
  mockOk("delete", "/v1/api/user/fcm-token"),
  mockOk("patch", "/v1/api/user/notification"),
  mockOk("post", "/v1/api/user/expert"),
  mockOk("put", "/v1/api/user/expert"),
  mockOk("post", "/v1/api/user/expert/portfolios"),
  mockOk("put", "/v1/api/user/expert/portfolios/:portfolioId"),
  mockOk("delete", "/v1/api/user/expert/portfolios/:portfolioId"),
  mockOk("post", "/v1/api/user/expert/certifications"),
  mockOk("put", "/v1/api/user/expert/certifications/:certificationId"),
  mockOk("delete", "/v1/api/user/expert/certifications/:certificationId"),
  mockOk("put", "/v1/api/user/expert/bank-account"),
  mockOk("put", "/v1/api/user/expert/availability"),
]

// ─── coupon ──────────────────────────────────────────────────────────────────

type PackageType = keyof typeof COUPON_PACKAGES
type CouponPurchaseData = EnvelopeData<typeof couponPurchaseResponseSchema>

const isPackageType = (value: unknown): value is PackageType =>
  typeof value === "string" && value in COUPON_PACKAGES

async function readJson(request: Request): Promise<Record<string, unknown>> {
  try {
    const body = await request.json()
    return body && typeof body === "object" ? (body as Record<string, unknown>) : {}
  } catch {
    return {}
  }
}

const couponHandlers = [
  mock(
    "get",
    "/v1/api/coupon/balance/direct-request",
    directRequestCouponBalanceResponseSchema,
    () => ({
      balance: DIRECT_REQUEST_COUPON_BALANCE,
    }),
  ),
  mock("get", "/v1/api/coupon/balance", couponBalanceResponseSchema, () => couponBalance),
  mock("get", "/v1/api/coupon/purchases", couponPurchaseListResponseSchema, () => ({
    content: buildCouponPurchases(),
    nextCursor: null,
    hasNext: false,
  })),
  mock("get", "/v1/api/coupon/share/kakao/status", kakaoShareCouponResponseSchema, () => ({
    totalSharedCount: 1,
    chatRoomAlreadyShared: false,
  })),
  mock("get", "/v1/api/coupon/referral/status", referralStatusResponseSchema, () => referralStatus),

  mock(
    "post",
    "/v1/api/coupon/purchase/in-app",
    couponPurchaseResponseSchema,
    async ({ request }): Promise<CouponPurchaseData> => {
      const body = await readJson(request)
      const packageType = isPackageType(body.packageType) ? body.packageType : "STANDARD"
      return {
        id: 7104,
        packageType,
        quantity: COUPON_PACKAGES[packageType].quantity,
        totalPrice: COUPON_PACKAGES[packageType].price,
        paymentMethod: body.inAppType === "GOOGLE" ? "GOOGLE_IAP" : "APPLE_IAP",
        status: "PAID",
        createdAt: minutesAgo(0),
      }
    },
  ),
  mock(
    "post",
    "/v1/api/coupon/purchase",
    couponPurchaseResponseSchema,
    async ({ request }): Promise<CouponPurchaseData> => {
      const body = await readJson(request)
      const packageType = isPackageType(body.packageType) ? body.packageType : "STANDARD"
      const paymentMethod =
        body.paymentMethod === "CARD" ||
        body.paymentMethod === "TOSS" ||
        body.paymentMethod === "KAKAO_PAY"
          ? body.paymentMethod
          : "CARD"
      return {
        id: 7104,
        packageType,
        quantity: COUPON_PACKAGES[packageType].quantity,
        totalPrice: COUPON_PACKAGES[packageType].price,
        paymentMethod,
        status: "PAID",
        createdAt: minutesAgo(0),
      }
    },
  ),
  mock("post", "/v1/api/coupon/claim", couponClaimResponseSchema, () => ({
    totalCount: couponBalance.totalCount + 1,
    ticketCouponCount: couponBalance.totalCount + 1,
    directRequestCouponCount: DIRECT_REQUEST_COUPON_BALANCE,
  })),
]

// ─── media ───────────────────────────────────────────────────────────────────

const mediaHandlers = [
  mock("post", "/v1/api/image/upload/bulk", imageBulkUploadResponseSchema, async ({ request }) => {
    const domain = new URL(request.url).searchParams.get("domain")
    const count = await countFiles(request, "files", 2)
    return Array.from({ length: count }, (_, idx) => uploadedImageUrl(domain, idx))
  }),
  mock("post", "/v1/api/image/upload", imageUploadResponseSchema, ({ request }) =>
    uploadedImageUrl(new URL(request.url).searchParams.get("domain")),
  ),
  mock(
    "post",
    "/v1/api/file/upload/pdf/bulk",
    fileBulkUploadResponseSchema,
    async ({ request }) => {
      const count = await countFiles(request, "files", 1)
      return Array.from({ length: count }, (_, idx) => uploadedPdfUrl(idx))
    },
  ),
  mock("post", "/v1/api/file/upload/pdf", fileUploadResponseSchema, () => uploadedPdfUrl()),
]

export const expertGroupHandlers: RequestHandler[] = [
  ...expertHandlers,
  ...userHandlers,
  ...couponHandlers,
  ...mediaHandlers,
]
