"use client"

import { overlay } from "overlay-kit"

import { PaymentDialog } from "../ui/payment-dialog"

type Args = {
  ticketId: number
  amount: number
  orderName: string
}

export function openPayment({ ticketId, amount, orderName }: Args): Promise<void> {
  return new Promise((resolve) => {
    overlay.open(({ isOpen, close, unmount }) => (
      <PaymentDialog
        isOpen={isOpen}
        ticketId={ticketId}
        amount={amount}
        orderName={orderName}
        onClose={() => {
          resolve()
          close()
          setTimeout(unmount, 300)
        }}
      />
    ))
  })
}
