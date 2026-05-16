"use client"

import { kakaoSignup } from "@/entities/auth/api/auth.service"
import { SocialSignupContent } from "../_components/social-signup-content"

export default function KakaoSignupPage() {
  return (
    <SocialSignupContent
      provider="kakao"
      onSignup={async ({ code, redirectUri, nickname, chatReviewAgreed, marketingConsent }) => {
        await kakaoSignup({ code, redirectUri, nickname, chatReviewAgreed, marketingConsent })
      }}
    />
  )
}
