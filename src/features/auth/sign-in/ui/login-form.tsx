"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import { ZodError } from "zod/v4"
import { Button } from "@/shared/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import { ApiError } from "@/shared/api/http/api-error"
import { loginRequestSchema, type LoginRequest } from "@/entities/auth/api/auth.schema"
import { useLoginMutation } from "@/features/auth/sign-in/model/use-login-mutation"

type LoginFormProps = {
  nextPath: string
}

export function LoginForm({ nextPath }: LoginFormProps) {
  const router = useRouter()
  const loginMutation = useLoginMutation()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginRequest>({
    resolver: zodResolver(loginRequestSchema as never),
    mode: "onBlur",
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = handleSubmit(async (values) => {
    const response = await loginMutation.mutateAsync(values)

    if (response.success) {
      router.replace(nextPath)
    }
  })

  const errorMessage = resolveLoginErrorMessage(loginMutation.error)
  const isPending = loginMutation.isPending || isSubmitting

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>로그인</CardTitle>
        <CardDescription>로그인 성공 시 이전 페이지로 돌아갑니다.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="grid gap-5">
          <div className="grid gap-2">
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="user@example.com"
              {...register("email")}
            />
            {errors.email ? <p className="text-sm text-destructive">{errors.email.message}</p> : null}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">비밀번호</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="비밀번호를 입력하세요"
              {...register("password")}
            />
            {errors.password ? <p className="text-sm text-destructive">{errors.password.message}</p> : null}
          </div>

          {errorMessage ? (
            <p className="rounded-md border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {errorMessage}
            </p>
          ) : null}

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "로그인 중..." : "로그인"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

function resolveLoginErrorMessage(error: unknown): string | null {
  if (!error) {
    return null
  }

  if (error instanceof ApiError) {
    return error.message
  }

  if (error instanceof ZodError) {
    return "응답 데이터 형식이 올바르지 않습니다."
  }

  if (error instanceof Error) {
    return error.message
  }

  return "로그인 중 알 수 없는 오류가 발생했습니다."
}
