import { Suspense } from "react"

import { TicketCreateContent } from "./_components/ticket-create-content"

export default function Page() {
  return (
    <Suspense>
      <TicketCreateContent />
    </Suspense>
  )
}
