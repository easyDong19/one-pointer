"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { CreditCard, Landmark, ShieldCheck, Loader2 } from "lucide-react"

import { useAuthStore } from "@/entities/auth/model/auth-store"
import type { PaymentMethod } from "@/shared/lib/portone"
import { requestEscrowPayment, UserCancelledError } from "@/shared/lib/portone"
import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog"
import { Text } from "@/shared/ui/text"

import { useEscrowPaymentMutation } from "../model/use-escrow-payment-mutation"

type Props = {
  isOpen: boolean
  ticketId: number
  amount: number
  orderName: string
  onClose: () => void
}

const PAY_METHODS: { value: PaymentMethod; label: string; icon: typeof CreditCard }[] = [
  { value: "CARD", label: "신용/체크카드", icon: CreditCard },
  { value: "TRANSFER", label: "계좌이체", icon: Landmark },
]

export function PaymentDialog({
  isOpen,
  ticketId,
  amount,
  orderName,
  onClose,
}: Props) {
  const params = useParams<{ roomId: string }>()
  const roomId = params.roomId

  const user = useAuthStore((s) => s.user)
  const mutation = useEscrowPaymentMutation(roomId)

  const [payMethod, setPayMethod] = useState<PaymentMethod>("CARD")
  const [isPaying, setIsPaying] = useState(false)

  const isLoading = isPaying || mutation.isPending

  const handlePay = async () => {
    if (!user || isLoading) return
    setIsPaying(true)

    try {
      const result = await requestEscrowPayment({
        ticketId,
        orderName,
        amount,
        payMethod,
        customer: {
          fullName: user.name,
          phoneNumber: user.phone,
          email: user.email,
        },
      })

      await mutation.mutateAsync({
        ticketId,
        paymentMethod: payMethod,
        paymentKey: result.paymentId,
      })

      onClose()
    } catch (error) {
      if (error instanceof UserCancelledError) return
      console.error("[payment]", error)
    } finally {
      setIsPaying(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md md:p-8" showCloseButton={!isLoading}>
        <DialogHeader>
          <DialogTitle>결제하기</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-op-xl">
          {/* 금액 */}
          <div className="flex flex-col items-center gap-op-xs rounded-xl bg-neutral-50 py-op-3xl">
            <Text typography="caption1-medium" className="text-muted-foreground">
              결제 금액
            </Text>
            <Text typography="h2-bold" className="tabular-nums">
              {amount.toLocaleString("ko-KR")}원
            </Text>
          </div>

          {/* 결제 수단 선택 */}
          <div className="flex flex-col gap-op-sm">
            <Text typography="body3-bold">결제 수단</Text>
            <div className="grid grid-cols-2 gap-op-md">
              {PAY_METHODS.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  disabled={isLoading}
                  onClick={() => setPayMethod(value)}
                  className={cn(
                    "flex flex-col items-center gap-op-sm rounded-xl border-2 py-op-xl transition-colors",
                    payMethod === value
                      ? "border-primary bg-primary-light"
                      : "border-border bg-background hover:border-neutral-300",
                  )}
                >
                  <Icon
                    className={cn(
                      "size-6",
                      payMethod === value ? "text-primary" : "text-muted-foreground",
                    )}
                  />
                  <Text
                    typography="body3-medium"
                    className={payMethod === value ? "text-primary" : "text-muted-foreground"}
                  >
                    {label}
                  </Text>
                </button>
              ))}
            </div>
          </div>

          {/* 안내문 */}
          <div className="flex items-start gap-op-sm rounded-lg bg-neutral-50 p-op-lg">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-success-foreground" />
            <Text typography="caption1-medium" className="text-muted-foreground">
              원포인터 안전결제로 거래가 완료될 때까지 결제 금액이 안전하게 보호됩니다.
            </Text>
          </div>

          {/* 결제 버튼 */}
          <Button
            size="lg"
            className="w-full"
            disabled={isLoading}
            onClick={handlePay}
          >
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                결제 진행 중...
              </>
            ) : (
              `${amount.toLocaleString("ko-KR")}원 결제하기`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
