"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

import { payEscrow } from "@/entities/payment/api/payment.service"
import { Button } from "@/shared/ui/button"
import { PageShell } from "@/shared/ui/page-shell"
import { Text } from "@/shared/ui/text"

type ResultState = "loading" | "success" | "error"

function PortoneResultContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // 파라미터 검증은 searchParams 로부터 렌더 중 파생 (effect 에서 동기 setState 회피).
  const paymentId = searchParams.get("paymentId")
  const code = searchParams.get("code")
  const message = searchParams.get("message")
  const parts = paymentId ? paymentId.split("_") : []
  const ticketId = parts[1] ? Number(parts[1]) : NaN

  const validationError =
    code && code !== "SUCCESS"
      ? (message ?? "결제에 실패했습니다.")
      : !paymentId
        ? "결제 정보를 찾을 수 없습니다."
        : Number.isNaN(ticketId)
          ? "잘못된 결제 정보입니다."
          : null

  // 비동기 결제 확인 결과만 state 로 관리 (setState 는 async 콜백에서만 호출됨).
  const [asyncState, setAsyncState] = useState<ResultState>("loading")
  const [asyncErrorMessage, setAsyncErrorMessage] = useState("")

  const state: ResultState = validationError ? "error" : asyncState
  const errorMessage = validationError ?? asyncErrorMessage

  useEffect(() => {
    if (validationError || !paymentId) return

    payEscrow({
      ticketId,
      paymentMethod: "CARD",
      paymentKey: paymentId,
    })
      .then(() => setAsyncState("success"))
      .catch((err) => {
        setAsyncState("error")
        setAsyncErrorMessage(err instanceof Error ? err.message : "결제 확인에 실패했습니다.")
      })
  }, [validationError, paymentId, ticketId])

  return (
    <PageShell tier="form">
      <PageShell.Content className="flex flex-col items-center justify-center gap-op-xl py-op-5xl">
        {state === "loading" && (
          <>
            <Loader2 className="size-12 animate-spin text-primary" />
            <Text typography="subtitle1-bold">결제 확인 중...</Text>
            <Text typography="body3-regular" className="text-muted-foreground">
              잠시만 기다려주세요.
            </Text>
          </>
        )}

        {state === "success" && (
          <>
            <CheckCircle className="size-12 text-success-foreground" />
            <Text typography="subtitle1-bold">결제가 완료되었어요</Text>
            <Text typography="body3-regular" className="text-muted-foreground text-center">
              채팅방으로 돌아가 진행 상황을 확인하세요.
            </Text>
            <Button size="lg" className="mt-op-lg" onClick={() => router.push("/chat")}>
              채팅 목록으로 이동
            </Button>
          </>
        )}

        {state === "error" && (
          <>
            <XCircle className="size-12 text-destructive" />
            <Text typography="subtitle1-bold">결제에 실패했어요</Text>
            <Text typography="body3-regular" className="text-muted-foreground text-center">
              {errorMessage}
            </Text>
            <Button
              size="lg"
              variant="outline"
              className="mt-op-lg"
              onClick={() => router.back()}
            >
              돌아가기
            </Button>
          </>
        )}
      </PageShell.Content>
    </PageShell>
  )
}

export default function PortoneResultPage() {
  return (
    <Suspense
      fallback={
        <PageShell tier="form">
          <PageShell.Content className="flex flex-col items-center justify-center gap-op-xl py-op-5xl">
            <Loader2 className="size-12 animate-spin text-primary" />
            <Text typography="subtitle1-bold">결제 확인 중...</Text>
            <Text typography="body3-regular" className="text-muted-foreground">
              잠시만 기다려주세요.
            </Text>
          </PageShell.Content>
        </PageShell>
      }
    >
      <PortoneResultContent />
    </Suspense>
  )
}
