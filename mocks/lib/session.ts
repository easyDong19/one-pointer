/**
 * 비로그인 화면(로그인 페이지 등)을 찍기 위한 스위치.
 * 캡처 스크립트가 `mock_session=guest` 쿠키를 심으면 인증 API 가 401 을 돌려준다.
 * localhost 쿠키는 포트 구분이 없으므로 Next(:3000) SSR 요청에도 그대로 포워딩된다.
 */
export function isGuest(cookies: Record<string, string>): boolean {
  return cookies.mock_session === "guest"
}
