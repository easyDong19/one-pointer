"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { ArrowLeft } from "lucide-react"
import { Text } from "@/shared/ui/text"
import { signupFormSchema, type SignupFormData } from "@/entities/auth/api/auth.schema"
import { useSignupMutation } from "@/features/auth/sign-up/model/use-signup-mutation"
import { SignupProgress } from "@/features/auth/sign-up/ui/signup-progress"
import { SignupBasicForm } from "@/features/auth/sign-up/ui/signup-basic-form"
import { SignupTermsForm } from "@/features/auth/sign-up/ui/signup-terms-form"
import { SignupBrandPanel } from "@/app/(auth)/_components/signup-brand-panel"

const STEP_META = {
  1: { label: "기본 정보" },
  2: { label: "약관 동의" },
} as const

export function SignupContent() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const signupMutation = useSignupMutation()

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupFormSchema as never),
    mode: "onBlur",
    defaultValues: {
      email: "",
      password: "",
      passwordConfirm: "",
      name: "",
      nickname: "",
      termsOfService: false,
      privacyPolicy: false,
      chatReviewAgreed: false,
      marketingConsent: false,
    },
  })

  const handleBack = () => {
    if (step === 2) {
      setStep(1)
    } else {
      router.back()
    }
  }

  const onSubmit = form.handleSubmit(async (values) => {
    const response = await signupMutation.mutateAsync({
      email: values.email,
      password: values.password,
      name: values.name,
      nickname: values.nickname,
      marketingConsent: values.marketingConsent,
      notificationEnabled: true,
      chatReviewAgreed: values.chatReviewAgreed,
    })

    if (response.success) {
      router.replace("/")
    }
  })

  const isPending = signupMutation.isPending || form.formState.isSubmitting

  return (
    <main className="flex min-h-dvh flex-col md:flex-row">
      <SignupBrandPanel />

      <div className="flex flex-1 flex-col md:w-1/2 lg:w-[45%]">
        {/* 모바일 헤더 */}
        <header className="bg-background/80 sticky top-0 z-40 flex h-14 items-center border-b px-4 backdrop-blur-md md:hidden">
          <button type="button" onClick={handleBack} className="p-1" aria-label="뒤로">
            <ArrowLeft size={24} />
          </button>
          <Text
            as="h1"
            typography="subtitle1-bold"
            className="absolute left-1/2 -translate-x-1/2"
          >
            회원가입
          </Text>
        </header>

        <div className="flex-1 px-6 py-8 md:px-12 md:py-12 lg:px-16">
          <div className="mx-auto flex w-full max-w-md flex-col gap-8">
            {/* 데스크탑 뒤로가기 */}
            <button
              type="button"
              onClick={handleBack}
              className="text-muted-foreground hover:text-foreground -ml-1 hidden items-center gap-1.5 self-start transition-colors md:flex"
            >
              <ArrowLeft size={18} />
              <Text as="span" typography="body3-medium">
                {step === 2 ? "이전 단계" : "뒤로"}
              </Text>
            </button>

            {/* 슬로건 */}
            <div className="flex flex-col gap-2">
              <Text as="h2" typography="h2-bold" className="text-foreground">
                계정 만들기
              </Text>
              <Text as="p" typography="body2-regular" className="text-muted-foreground">
                원포인트 회원가입을 시작해요.
              </Text>
            </div>

            {/* 진행도 */}
            <SignupProgress currentStep={step} total={2} label={STEP_META[step].label} />

            {/* 폼 */}
            <form onSubmit={onSubmit}>
              {step === 1 ? (
                <SignupBasicForm form={form} onNext={() => setStep(2)} />
              ) : (
                <SignupTermsForm form={form} isPending={isPending} />
              )}
            </form>
          </div>
        </div>
      </div>
    </main>
  )
}
