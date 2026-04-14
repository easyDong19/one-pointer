import { z } from "zod/v4"

// ─── 공통 enum ───────────────────────────────────────────────────────────────

const authUserRoleSchema = z.enum(["CLIENT", "EXPERT", "BOTH", "ADMIN", "USER"])
const authUserStatusSchema = z.enum(["ACTIVE", "DORMANT", "SUSPENDED", "WITHDRAWN", "INACTIVE"])

// ─── 공통 유저 스키마 ──────────────────────────────────────────────────────────

/** AuthResponse */
export const authUserSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  name: z.string(),
  nickname: z.string(),
  phone: z.string().optional(),
  profileImageUrl: z.string().url().nullable().optional(),
  role: authUserRoleSchema,
  status: authUserStatusSchema,
})

export type AuthUser = z.infer<typeof authUserSchema>

// ─── 공통 토큰 응답 (login / signup / refresh 공유) ────────────────────────────

/** AuthTokenResponse */
export const authTokenResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
  data: z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
    user: authUserSchema,
  }),
})

export type AuthTokenResponse = z.infer<typeof authTokenResponseSchema>

// ─── 일반 로그인 ───────────────────────────────────────────────────────────────

export const loginRequestSchema = z.object({
  email: z.string().email("유효한 이메일 형식이 아닙니다."),
  password: z.string().min(1, "비밀번호를 입력해주세요."),
})

export type LoginRequest = z.infer<typeof loginRequestSchema>

export const loginResponseSchema = authTokenResponseSchema

export type LoginResponse = AuthTokenResponse

// ─── 일반 회원가입 ─────────────────────────────────────────────────────────────

export const signupRequestSchema = z.object({
  email: z.string().email("유효한 이메일 형식이 아닙니다."),
  password: z.string().min(1, "비밀번호를 입력해주세요."),
  name: z.string().min(1, "이름을 입력해주세요."),
  nickname: z.string().min(1, "닉네임을 입력해주세요."),
  marketingConsent: z.boolean(),
  notificationEnabled: z.boolean(),
  chatReviewAgreed: z.boolean(),
})

// ─── 회원가입 폼 스키마 (클라이언트 전용) ────────────────────────────────────────

const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/

export const signupFormSchema = z
  .object({
    email: z.string().email("유효한 이메일 형식이 아닙니다."),
    password: z
      .string()
      .min(8, "비밀번호는 8자 이상이어야 합니다.")
      .regex(passwordRegex, "영문, 숫자, 특수문자를 모두 포함해야 합니다."),
    passwordConfirm: z.string().min(1, "비밀번호를 다시 입력해주세요."),
    name: z.string().min(1, "이름을 입력해주세요."),
    nickname: z
      .string()
      .min(2, "닉네임은 2자 이상이어야 합니다.")
      .max(7, "닉네임은 7자 이하이어야 합니다."),
    termsOfService: z.boolean(),
    privacyPolicy: z.boolean(),
    chatReviewAgreed: z.boolean(),
    marketingConsent: z.boolean(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["passwordConfirm"],
  })

export type SignupFormData = z.infer<typeof signupFormSchema>

export type SignupRequest = z.infer<typeof signupRequestSchema>

export const signupResponseSchema = authTokenResponseSchema

export type SignupResponse = AuthTokenResponse

// ─── 로그아웃 ──────────────────────────────────────────────────────────────────

export const logoutResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.unknown(),
})

export type LogoutResponse = z.infer<typeof logoutResponseSchema>

// ─── 이메일 중복 검사 ──────────────────────────────────────────────────────────

export const checkEmailResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
  data: z.record(z.string(), z.boolean()),
})

export type CheckEmailResponse = z.infer<typeof checkEmailResponseSchema>

// ─── 닉네임 중복 검사 ──────────────────────────────────────────────────────────

export const checkNicknameResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
  data: z.record(z.string(), z.boolean()),
})

export type CheckNicknameResponse = z.infer<typeof checkNicknameResponseSchema>

// ─── 카카오 로그인 ─────────────────────────────────────────────────────────────

export const kakaoLoginRequestSchema = z.object({
  accessToken: z.string().optional(),
  code: z.string().optional(),
  redirectUri: z.string().optional(),
})

export type KakaoLoginRequest = z.infer<typeof kakaoLoginRequestSchema>

/** KakaoUserInfo */
export const kakaoUserInfoSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  name: z.string(),
  profileImageUrl: z.string().url().nullable(),
})

/** KakaoLoginResponse */
export const kakaoLoginResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
  data: z.object({
    accessToken: z.string().nullable(),
    refreshToken: z.string().nullable(),
    user: authUserSchema.nullable().optional(),
    kakaoUserInfo: kakaoUserInfoSchema.nullable(),
    kakaoAccessToken: z.string().nullable().optional(),
    newUser: z.boolean(),
  }),
})

export type KakaoLoginResponse = z.infer<typeof kakaoLoginResponseSchema>

// ─── 카카오 신규 가입 ──────────────────────────────────────────────────────────

export const kakaoSignupRequestSchema = z.object({
  accessToken: z.string().optional(),
  code: z.string().optional(),
  redirectUri: z.string().optional(),
  nickname: z.string().min(1, "닉네임을 입력해주세요."),
  chatReviewAgreed: z.boolean(),
  marketingConsent: z.boolean(),
})

export type KakaoSignupRequest = z.infer<typeof kakaoSignupRequestSchema>

export const kakaoSignupResponseSchema = authTokenResponseSchema

export type KakaoSignupResponse = AuthTokenResponse

// ─── 구글 로그인 ───────────────────────────────────────────────────────────────

export const googleLoginRequestSchema = z.object({
  idToken: z.string().optional(),
  accessToken: z.string().optional(),
  code: z.string().optional(),
  redirectUri: z.string().optional(),
})

export type GoogleLoginRequest = z.infer<typeof googleLoginRequestSchema>

/** GoogleUserInfo */
export const googleUserInfoSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  profileImageUrl: z.string().url().nullable(),
})

/** GoogleLoginResponse */
export const googleLoginResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
  data: z.object({
    accessToken: z.string().nullable(),
    refreshToken: z.string().nullable(),
    user: authUserSchema.nullable().optional(),
    googleUserInfo: googleUserInfoSchema.nullable(),
    googleAccessToken: z.string().nullable().optional(),
    newUser: z.boolean(),
  }),
})

export type GoogleLoginResponse = z.infer<typeof googleLoginResponseSchema>

// ─── 구글 신규 가입 ────────────────────────────────────────────────────────────

export const googleSignupRequestSchema = z.object({
  idToken: z.string().optional(),
  accessToken: z.string().optional(),
  code: z.string().optional(),
  redirectUri: z.string().optional(),
  nickname: z.string().min(1, "닉네임을 입력해주세요."),
  chatReviewAgreed: z.boolean(),
  marketingConsent: z.boolean(),
})

export type GoogleSignupRequest = z.infer<typeof googleSignupRequestSchema>

export const googleSignupResponseSchema = authTokenResponseSchema

export type GoogleSignupResponse = AuthTokenResponse

// ─── 애플 로그인 ───────────────────────────────────────────────────────────────

export const appleLoginRequestSchema = z.object({
  identityToken: z.string().optional(),
  authorizationCode: z.string().optional(),
})

export type AppleLoginRequest = z.infer<typeof appleLoginRequestSchema>

/** AppleUserInfo */
export const appleUserInfoSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
})

/** AppleLoginResponse */
export const appleLoginResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
  data: z.object({
    accessToken: z.string().nullable(),
    refreshToken: z.string().nullable(),
    user: authUserSchema.nullable().optional(),
    appleUserInfo: appleUserInfoSchema.nullable(),
    appleIdentityToken: z.string().nullable().optional(),
    newUser: z.boolean(),
  }),
})

export type AppleLoginResponse = z.infer<typeof appleLoginResponseSchema>

// ─── 애플 신규 가입 ──────────────────────────────────────────────────────────

export const appleSignupRequestSchema = z.object({
  identityToken: z.string().optional(),
  authorizationCode: z.string().optional(),
  nickname: z.string().min(1, "닉네임을 입력해주세요."),
  chatReviewAgreed: z.boolean(),
  marketingConsent: z.boolean(),
})

export type AppleSignupRequest = z.infer<typeof appleSignupRequestSchema>

export const appleSignupResponseSchema = authTokenResponseSchema

export type AppleSignupResponse = AuthTokenResponse

// ─── 소셜 인가 URL ─────────────────────────────────────────────────────────────

export const authorizeUrlResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
  data: z.record(z.string(), z.string()),
})

export type AuthorizeUrlResponse = z.infer<typeof authorizeUrlResponseSchema>

// ─── 내 프로필 ─────────────────────────────────────────────────────────────────

export const myProfileResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
  data: authUserSchema,
})

export type MyProfileResponse = z.infer<typeof myProfileResponseSchema>
