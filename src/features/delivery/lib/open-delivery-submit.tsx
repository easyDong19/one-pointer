"use client"

import { overlay } from "overlay-kit"

import { DeliverySubmitDialog } from "../ui/delivery-submit-dialog"

type Args = {
  ticketId: number
  mode: "submit" | "resubmit"
  deliveryId?: number
}

export function openDeliverySubmit({
  ticketId,
  mode,
  deliveryId,
}: Args): Promise<void> {
  return new Promise((resolve) => {
    overlay.open(({ isOpen, close, unmount }) => (
      <DeliverySubmitDialog
        isOpen={isOpen}
        ticketId={ticketId}
        mode={mode}
        deliveryId={deliveryId}
        onClose={() => {
          resolve()
          close()
          setTimeout(unmount, 300)
        }}
      />
    ))
  })
}
