"use client"

import { googleSignup } from "@/entities/auth/api/auth.service"
import { SocialSignupContent } from "../_components/social-signup-content"

export default function GoogleSignupPage() {
  return (
    <SocialSignupContent
      provider="google"
      onSignup={async ({ code, redirectUri, nickname, chatReviewAgreed, marketingConsent }) => {
        await googleSignup({ code, redirectUri, nickname, chatReviewAgreed, marketingConsent })
      }}
    />
  )
}
