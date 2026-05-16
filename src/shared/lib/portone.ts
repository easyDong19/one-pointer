import PortOne from "@portone/browser-sdk/v2"

import {
  PORTONE_STORE_ID,
  PORTONE_CHANNEL_KEY,
  PAYMENT_REDIRECT_URL,
} from "@/shared/config/portone"

export type PaymentMethod = "CARD" | "TRANSFER"

type RequestPaymentParams = {
  ticketId: number
  orderName: string
  amount: number
  payMethod: PaymentMethod
  customer: { fullName: string; phoneNumber?: string; email: string }
}

export type PaymentResult = { paymentId: string }

export async function requestEscrowPayment(
  params: RequestPaymentParams,
): Promise<PaymentResult> {
  const paymentId = `escrow_${params.ticketId}_${Date.now()}`

  const response = await PortOne.requestPayment({
    storeId: PORTONE_STORE_ID,
    channelKey: PORTONE_CHANNEL_KEY,
    paymentId,
    orderName: params.orderName,
    totalAmount: params.amount,
    currency: "CURRENCY_KRW",
    payMethod: params.payMethod,
    isEscrow: false,
    redirectUrl: PAYMENT_REDIRECT_URL,
    customer: {
      fullName: params.customer.fullName,
      phoneNumber: params.customer.phoneNumber,
      email: params.customer.email,
    },
    products: [
      {
        id: `ticket_${params.ticketId}`,
        name: params.orderName,
        amount: params.amount,
        quantity: 1,
      },
    ],
    alipayPlus: {},
  })

  if (!response) {
    throw new Error("결제 응답을 받지 못했습니다.")
  }

  if (response.code != null) {
    if (response.code === "USER_CANCELLED") {
      throw new UserCancelledError()
    }
    throw new Error(response.message ?? "결제에 실패했습니다.")
  }

  return { paymentId: response.paymentId }
}

export class UserCancelledError extends Error {
  constructor() {
    super("사용자가 결제를 취소했습니다.")
    this.name = "UserCancelledError"
  }
}
