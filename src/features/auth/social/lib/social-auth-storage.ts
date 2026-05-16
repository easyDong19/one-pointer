/**
 * 소셜 OAuth 신규 가입 플로우용 sessionStorage 헬퍼.
 *
 * 카카오/구글 인가 code 는 1회용이므로, 콜백에서 받은 access token 을
 * 회원가입 페이지로 안전하게 전달해야 한다. URL 파라미터는 토큰이 노출되므로
 * sessionStorage 사용 — 탭을 닫으면 자동 삭제.
 */

export type SocialProvider = "kakao" | "google"

export type SocialUserInfo = {
  email?: string
  name?: string
  profileImageUrl?: string | null
  id?: string | number
}

const STORAGE_KEYS = {
  provider: "social_auth_provider",
  accessToken: "social_auth_access_token",
  userInfo: "social_auth_user_info",
} as const

export function saveSocialAuth(
  provider: SocialProvider,
  accessToken: string,
  userInfo: SocialUserInfo | null,
) {
  sessionStorage.setItem(STORAGE_KEYS.provider, provider)
  sessionStorage.setItem(STORAGE_KEYS.accessToken, accessToken)
  if (userInfo) {
    sessionStorage.setItem(STORAGE_KEYS.userInfo, JSON.stringify(userInfo))
  }
}

export function loadSocialAuth(provider: SocialProvider): {
  accessToken: string
  userInfo: SocialUserInfo | null
} | null {
  const savedProvider = sessionStorage.getItem(STORAGE_KEYS.provider)
  if (savedProvider !== provider) return null

  const accessToken = sessionStorage.getItem(STORAGE_KEYS.accessToken)
  if (!accessToken) return null

  const rawUserInfo = sessionStorage.getItem(STORAGE_KEYS.userInfo)
  let userInfo: SocialUserInfo | null = null
  if (rawUserInfo) {
    try {
      userInfo = JSON.parse(rawUserInfo)
    } catch {
      userInfo = null
    }
  }

  return { accessToken, userInfo }
}

export function clearSocialAuth() {
  sessionStorage.removeItem(STORAGE_KEYS.provider)
  sessionStorage.removeItem(STORAGE_KEYS.accessToken)
  sessionStorage.removeItem(STORAGE_KEYS.userInfo)
}
