"use client"

import { ApiError } from "@/shared/api/http/api-error"
import { Button } from "@/shared/ui/button"
import { Text } from "@/shared/ui/text"
import { useLogoutMutation } from "@/features/auth/sign-out/model/use-logout-mutation"

export function LogoutButton() {
  const logoutMutation = useLogoutMutation()
  const errorMessage = resolveLogoutErrorMessage(logoutMutation.error)

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        onClick={() => logoutMutation.mutate()}
        disabled={logoutMutation.isPending}
      >
        <Text as="span" typography="body3-medium">
          {logoutMutation.isPending ? "로그아웃 중..." : "로그아웃"}
        </Text>
      </Button>
      {errorMessage ? (
        <Text as="p" typography="caption1-medium" className="text-destructive">
          {errorMessage}
        </Text>
      ) : null}
    </div>
  )
}

function resolveLogoutErrorMessage(error: unknown): string | null {
  if (!error) {
    return null
  }

  if (error instanceof ApiError) {
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return "로그아웃 중 알 수 없는 오류가 발생했습니다."
}
