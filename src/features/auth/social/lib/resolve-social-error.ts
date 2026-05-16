import { ApiError } from "@/shared/api/http/api-error"

/**
 * 백엔드 응답 `{ success: false, message, data: <code> }` 에서 에러 코드 추출.
 */
function extractErrorCode(error: unknown): number | null {
  if (!(error instanceof ApiError)) return null
  const details = error.details
  if (details && typeof details === "object" && "data" in details) {
    const data = (details as { data: unknown }).data
    if (typeof data === "number") return data
  }
  return null
}

/**
 * 소셜 로그인/회원가입 에러를 사용자 친화 메시지로 변환.
 *
 * - 40093 / 40118: 카카오/구글 이메일 미제공
 * - 40094: 이미 일반 가입된 이메일 (소셜로 재가입 불가)
 * - 40108 / 40116: 카카오/구글 인증 실패
 * - 40109 / 40117: 카카오/구글 사용자 정보 조회 실패
 */
export function resolveSocialErrorMessage(error: unknown): string {
  const code = extractErrorCode(error)
  switch (code) {
    case 40093:
    case 40118:
      return "이메일 제공에 동의해주세요. 다시 로그인을 시도해주세요."
    case 40094:
      return "이미 가입된 이메일이에요. 기존 로그인 방식을 이용해주세요."
    case 40108:
    case 40116:
      return "소셜 인증에 실패했어요. 다시 시도해주세요."
    case 40109:
    case 40117:
      return "사용자 정보를 가져오지 못했어요. 다시 시도해주세요."
  }

  if (error instanceof ApiError) return error.message || "소셜 로그인 중 오류가 발생했어요."
  if (error instanceof Error) return error.message
  return "소셜 로그인 중 알 수 없는 오류가 발생했어요."
}
