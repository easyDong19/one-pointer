import { clientFetch } from "@/shared/api/http/client-fetch"
import { parseSchemaOrThrow } from "@/shared/api/http/parse-schema"
import {
  loginRequestSchema,
  loginResponseSchema,
  logoutResponseSchema,
  myProfileResponseSchema,
  signupRequestSchema,
  signupResponseSchema,
  checkEmailResponseSchema,
  checkNicknameResponseSchema,
  kakaoLoginRequestSchema,
  kakaoLoginResponseSchema,
  kakaoSignupRequestSchema,
  kakaoSignupResponseSchema,
  googleLoginRequestSchema,
  googleLoginResponseSchema,
  googleSignupRequestSchema,
  googleSignupResponseSchema,
  authorizeUrlResponseSchema,
  type AuthUser,
  type LoginRequest,
  type LoginResponse,
  type LogoutResponse,
  type MyProfileResponse,
  type SignupRequest,
  type SignupResponse,
  type CheckEmailResponse,
  type CheckNicknameResponse,
  type KakaoLoginRequest,
  type KakaoLoginResponse,
  type KakaoSignupRequest,
  type KakaoSignupResponse,
  type GoogleLoginRequest,
  type GoogleLoginResponse,
  type GoogleSignupRequest,
  type GoogleSignupResponse,
  type AuthorizeUrlResponse,
} from "@/entities/auth/api/auth.schema"

export type {
  AuthUser,
  LoginRequest,
  LoginResponse,
  LogoutResponse,
  MyProfileResponse,
  SignupRequest,
  SignupResponse,
  CheckEmailResponse,
  CheckNicknameResponse,
  KakaoLoginRequest,
  KakaoLoginResponse,
  KakaoSignupRequest,
  KakaoSignupResponse,
  GoogleLoginRequest,
  GoogleLoginResponse,
  GoogleSignupRequest,
  GoogleSignupResponse,
  AuthorizeUrlResponse,
}

// ─── 일반 로그인 ───────────────────────────────────────────────────────────────

export async function login(input: LoginRequest): Promise<LoginResponse> {
  const path = "/v1/api/auth/login"
  const method = "POST"
  const payload = parseSchemaOrThrow(loginRequestSchema, input, {
    path,
    method,
    message: "Invalid login request payload",
  })

  const response = await clientFetch<unknown, LoginRequest>({
    path,
    method,
    body: payload,
  })

  return parseSchemaOrThrow(loginResponseSchema, response, {
    path,
    method,
    message: "Invalid login response payload",
  })
}

// ─── 일반 회원가입 ─────────────────────────────────────────────────────────────

export async function signup(input: SignupRequest): Promise<SignupResponse> {
  const path = "/v1/api/auth/signup"
  const method = "POST"
  const payload = parseSchemaOrThrow(signupRequestSchema, input, {
    path,
    method,
    message: "Invalid signup request payload",
  })

  const response = await clientFetch<unknown, SignupRequest>({
    path,
    method,
    body: payload,
  })

  return parseSchemaOrThrow(signupResponseSchema, response, {
    path,
    method,
    message: "Invalid signup response payload",
  })
}

// ─── 로그아웃 ──────────────────────────────────────────────────────────────────

export async function logout(): Promise<LogoutResponse> {
  const path = "/v1/api/auth/logout"
  const method = "POST"

  const response = await clientFetch<unknown>({
    path,
    method,
    skipAuthRefresh: true,
  })

  return parseSchemaOrThrow(logoutResponseSchema, response, {
    path,
    method,
    message: "Invalid logout response payload",
  })
}

// ─── 이메일 중복 검사 ──────────────────────────────────────────────────────────

export async function checkEmail(email: string): Promise<CheckEmailResponse> {
  const path = "/v1/api/auth/check-email"
  const method = "GET"

  const response = await clientFetch<unknown>({
    path,
    method,
    query: { email },
  })

  return parseSchemaOrThrow(checkEmailResponseSchema, response, {
    path,
    method,
    message: "Invalid check-email response payload",
  })
}

// ─── 닉네임 중복 검사 ──────────────────────────────────────────────────────────

export async function checkNickname(nickname: string): Promise<CheckNicknameResponse> {
  const path = "/v1/api/auth/check-nickname"
  const method = "GET"

  const response = await clientFetch<unknown>({
    path,
    method,
    query: { nickname },
  })

  return parseSchemaOrThrow(checkNicknameResponseSchema, response, {
    path,
    method,
    message: "Invalid check-nickname response payload",
  })
}

// ─── 카카오 인가 URL 조회 ───────────────────────────────────────────────────────

export async function getKakaoAuthorizeUrl(redirectUri?: string): Promise<AuthorizeUrlResponse> {
  const path = "/v1/api/auth/kakao/authorize"
  const method = "GET"

  const response = await clientFetch<unknown>({
    path,
    method,
    query: redirectUri ? { redirectUri } : undefined,
  })

  return parseSchemaOrThrow(authorizeUrlResponseSchema, response, {
    path,
    method,
    message: "Invalid kakao authorize URL response payload",
  })
}

// ─── 카카오 로그인 ─────────────────────────────────────────────────────────────

export async function kakaoLogin(input: KakaoLoginRequest): Promise<KakaoLoginResponse> {
  const path = "/v1/api/auth/kakao"
  const method = "POST"
  const payload = parseSchemaOrThrow(kakaoLoginRequestSchema, input, {
    path,
    method,
    message: "Invalid kakao login request payload",
  })

  const response = await clientFetch<unknown, KakaoLoginRequest>({
    path,
    method,
    body: payload,
  })

  return parseSchemaOrThrow(kakaoLoginResponseSchema, response, {
    path,
    method,
    message: "Invalid kakao login response payload",
  })
}

// ─── 카카오 신규 가입 ──────────────────────────────────────────────────────────

export async function kakaoSignup(input: KakaoSignupRequest): Promise<KakaoSignupResponse> {
  const path = "/v1/api/auth/kakao/signup"
  const method = "POST"
  const payload = parseSchemaOrThrow(kakaoSignupRequestSchema, input, {
    path,
    method,
    message: "Invalid kakao signup request payload",
  })

  const response = await clientFetch<unknown, KakaoSignupRequest>({
    path,
    method,
    body: payload,
  })

  return parseSchemaOrThrow(kakaoSignupResponseSchema, response, {
    path,
    method,
    message: "Invalid kakao signup response payload",
  })
}

// ─── 구글 인가 URL 조회 ────────────────────────────────────────────────────────

export async function getGoogleAuthorizeUrl(redirectUri?: string): Promise<AuthorizeUrlResponse> {
  const path = "/v1/api/auth/google/authorize"
  const method = "GET"

  const response = await clientFetch<unknown>({
    path,
    method,
    query: redirectUri ? { redirectUri } : undefined,
  })

  return parseSchemaOrThrow(authorizeUrlResponseSchema, response, {
    path,
    method,
    message: "Invalid google authorize URL response payload",
  })
}

// ─── 구글 로그인 ───────────────────────────────────────────────────────────────

export async function googleLogin(input: GoogleLoginRequest): Promise<GoogleLoginResponse> {
  const path = "/v1/api/auth/google"
  const method = "POST"
  const payload = parseSchemaOrThrow(googleLoginRequestSchema, input, {
    path,
    method,
    message: "Invalid google login request payload",
  })

  const response = await clientFetch<unknown, GoogleLoginRequest>({
    path,
    method,
    body: payload,
  })

  return parseSchemaOrThrow(googleLoginResponseSchema, response, {
    path,
    method,
    message: "Invalid google login response payload",
  })
}

// ─── 구글 신규 가입 ────────────────────────────────────────────────────────────

export async function googleSignup(input: GoogleSignupRequest): Promise<GoogleSignupResponse> {
  const path = "/v1/api/auth/google/signup"
  const method = "POST"
  const payload = parseSchemaOrThrow(googleSignupRequestSchema, input, {
    path,
    method,
    message: "Invalid google signup request payload",
  })

  const response = await clientFetch<unknown, GoogleSignupRequest>({
    path,
    method,
    body: payload,
  })

  return parseSchemaOrThrow(googleSignupResponseSchema, response, {
    path,
    method,
    message: "Invalid google signup response payload",
  })
}

// ─── 내 프로필 ─────────────────────────────────────────────────────────────────

export async function getMyProfile(): Promise<AuthUser> {
  const path = "/v1/api/user/me"
  const method = "GET"

  const response = await clientFetch<unknown>({
    path,
    method,
  })

  const parsed = parseSchemaOrThrow(myProfileResponseSchema, response, {
    path,
    method,
    message: "Invalid my-profile response payload",
  })

  return parsed.data
}
