"use client"

import { useState } from "react"
import type { UseFormReturn } from "react-hook-form"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { PasswordInput } from "@/shared/ui/password-input"
import { Text } from "@/shared/ui/text"
import { ResponsiveAlert } from "@/shared/ui/responsive-alert"
import type { SignupFormData } from "@/entities/auth/api/auth.schema"
import { useCheckEmailMutation } from "@/features/auth/sign-up/model/use-check-email-mutation"
import { useCheckNicknameMutation } from "@/features/auth/sign-up/model/use-check-nickname-mutation"

type SignupBasicFormProps = {
  form: UseFormReturn<SignupFormData>
  onNext: () => void
}

type AlertState = {
  open: boolean
  variant: "success" | "warning"
  title: string
}

export function SignupBasicForm({ form, onNext }: SignupBasicFormProps) {
  const {
    register,
    trigger,
    getValues,
    watch,
    formState: { errors, isValid },
  } = form

  const checkEmailMutation = useCheckEmailMutation()
  const checkNicknameMutation = useCheckNicknameMutation()

  const [alert, setAlert] = useState<AlertState>({
    open: false,
    variant: "success",
    title: "",
  })

  const [emailChecked, setEmailChecked] = useState(false)
  const [nicknameChecked, setNicknameChecked] = useState(false)

  const watchedFields = watch(["email", "password", "passwordConfirm", "name", "nickname"])
  const allFilled = watchedFields.every((v) => v && v.length > 0)
  const isNextDisabled = !allFilled || !emailChecked || !nicknameChecked

  const handleCheckEmail = async () => {
    const valid = await trigger("email")
    if (!valid) return

    const email = getValues("email")
    try {
      const response = await checkEmailMutation.mutateAsync(email)
      // 이메일 API: { available: true } → true = 사용 가능
      const isAvailable = Object.values(response.data)[0]
      if (!isAvailable) {
        setAlert({
          open: true,
          variant: "warning",
          title: "이미 사용 중인 이메일입니다.",
        })
      } else {
        setEmailChecked(true)
        setAlert({
          open: true,
          variant: "success",
          title: "사용 가능한 이메일입니다.",
        })
      }
    } catch {
      setAlert({
        open: true,
        variant: "warning",
        title: "이메일 확인 중 오류가 발생했습니다.",
      })
    }
  }

  const handleCheckNickname = async () => {
    const valid = await trigger("nickname")
    if (!valid) return

    const nickname = getValues("nickname")
    try {
      const response = await checkNicknameMutation.mutateAsync(nickname)
      // 닉네임 API: { duplicated: true } → true = 중복
      const isDuplicated = Object.values(response.data)[0]
      if (isDuplicated) {
        setAlert({
          open: true,
          variant: "warning",
          title: "이미 사용 중인 닉네임입니다.",
        })
      } else {
        setNicknameChecked(true)
        setAlert({
          open: true,
          variant: "success",
          title: "사용 가능한 닉네임입니다.",
        })
      }
    } catch {
      setAlert({
        open: true,
        variant: "warning",
        title: "닉네임 확인 중 오류가 발생했습니다.",
      })
    }
  }

  const handleNext = async () => {
    const valid = await trigger([
      "email",
      "password",
      "passwordConfirm",
      "name",
      "nickname",
    ])
    if (!valid) return

    if (!emailChecked) {
      setAlert({
        open: true,
        variant: "warning",
        title: "이메일 중복확인을 해주세요.",
      })
      return
    }

    if (!nicknameChecked) {
      setAlert({
        open: true,
        variant: "warning",
        title: "닉네임 중복확인을 해주세요.",
      })
      return
    }

    onNext()
  }

  return (
    <>
      <div className="flex flex-col gap-5">
        {/* 이메일 */}
        <div className="flex flex-col gap-2">
          <Text as="label" typography="body2-medium" htmlFor="email">
            이메일 <span className="text-destructive">*</span>
          </Text>
          <div className="flex gap-2">
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="name@example.com"
              className="h-14 flex-1 rounded-2xl px-4 text-base"
              {...register("email", {
                onChange: () => setEmailChecked(false),
              })}
            />
            <Button
              type="button"
              variant="outline"
              className="h-14 shrink-0 rounded-2xl px-4"
              onClick={handleCheckEmail}
              disabled={checkEmailMutation.isPending}
            >
              중복확인
            </Button>
          </div>
          {errors.email ? (
            <Text as="p" typography="caption1-medium" className="text-destructive">
              {errors.email.message}
            </Text>
          ) : null}
        </div>

        {/* 비밀번호 */}
        <div className="flex flex-col gap-2">
          <Text as="label" typography="body2-medium" htmlFor="password">
            비밀번호 <span className="text-destructive">*</span>
          </Text>
          <PasswordInput
            id="password"
            autoComplete="new-password"
            placeholder="8자 이상, 영문+숫자+특수문자"
            className="h-14 rounded-2xl px-4 text-base"
            {...register("password")}
          />
          {errors.password ? (
            <Text as="p" typography="caption1-medium" className="text-destructive">
              {errors.password.message}
            </Text>
          ) : null}
        </div>

        {/* 비밀번호 확인 */}
        <div className="flex flex-col gap-2">
          <Text as="label" typography="body2-medium" htmlFor="passwordConfirm">
            비밀번호 확인 <span className="text-destructive">*</span>
          </Text>
          <PasswordInput
            id="passwordConfirm"
            autoComplete="new-password"
            placeholder="비밀번호를 다시 입력하세요"
            className="h-14 rounded-2xl px-4 text-base"
            {...register("passwordConfirm")}
          />
          {errors.passwordConfirm ? (
            <Text as="p" typography="caption1-medium" className="text-destructive">
              {errors.passwordConfirm.message}
            </Text>
          ) : null}
        </div>

        {/* 이름 */}
        <div className="flex flex-col gap-2">
          <Text as="label" typography="body2-medium" htmlFor="name">
            이름 <span className="text-destructive">*</span>
          </Text>
          <Input
            id="name"
            type="text"
            autoComplete="name"
            placeholder="실명을 입력하세요"
            className="h-14 rounded-2xl px-4 text-base"
            {...register("name")}
          />
          {errors.name ? (
            <Text as="p" typography="caption1-medium" className="text-destructive">
              {errors.name.message}
            </Text>
          ) : null}
        </div>

        {/* 닉네임 */}
        <div className="flex flex-col gap-2">
          <Text as="label" typography="body2-medium" htmlFor="nickname">
            닉네임 <span className="text-destructive">*</span>
          </Text>
          <div className="flex gap-2">
            <Input
              id="nickname"
              type="text"
              placeholder="서비스에서 사용할 닉네임 (2~7자)"
              className="h-14 flex-1 rounded-2xl px-4 text-base"
              {...register("nickname", {
                onChange: () => setNicknameChecked(false),
              })}
            />
            <Button
              type="button"
              variant="outline"
              className="h-14 shrink-0 rounded-2xl px-4"
              onClick={handleCheckNickname}
              disabled={checkNicknameMutation.isPending}
            >
              중복확인
            </Button>
          </div>
          {errors.nickname ? (
            <Text as="p" typography="caption1-medium" className="text-destructive">
              {errors.nickname.message}
            </Text>
          ) : null}
          <Text as="p" typography="caption1-medium" className="text-muted-foreground">
            다른 사용자에게 보이는 이름입니다.
          </Text>
        </div>

        {/* 다음 버튼 */}
        <Button
          type="button"
          className="mt-4 h-14 w-full rounded-2xl text-base font-medium"
          disabled={isNextDisabled}
          onClick={handleNext}
        >
          다음
        </Button>
      </div>

      <ResponsiveAlert
        open={alert.open}
        onOpenChange={(open) => setAlert((prev) => ({ ...prev, open }))}
        variant={alert.variant}
        title={alert.title}
      />
    </>
  )
}
