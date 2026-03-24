"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { ArrowLeft } from "lucide-react"
import { Text } from "@/shared/ui/text"
import { signupFormSchema, type SignupFormData } from "@/entities/auth/api/auth.schema"
import { useSignupMutation } from "@/features/auth/sign-up/model/use-signup-mutation"
import { SignupStepper } from "@/features/auth/sign-up/ui/signup-stepper"
import { SignupBasicForm } from "@/features/auth/sign-up/ui/signup-basic-form"
import { SignupTermsForm } from "@/features/auth/sign-up/ui/signup-terms-form"

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
    <div className="bg-background min-h-dvh">
      {/* 헤더 */}
      <header className="sticky top-0 z-40 flex h-14 items-center border-b bg-background/80 px-4 backdrop-blur-md">
        <button type="button" onClick={handleBack} className="p-1">
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

      {/* 본문 */}
      <div className="mx-auto max-w-md px-6 py-6">
        {/* 스텝 인디케이터 */}
        <div className="mb-8">
          <SignupStepper currentStep={step} />
        </div>

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
  )
}
