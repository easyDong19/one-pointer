"use client"

import { AuthGuard } from "@/features/auth/guard/ui/auth-guard"
import { NotificationListContent } from "@/features/notification/list/ui/notification-list-content"
import { MobileHeader } from "@/shared/ui/mobile-header"
import { PageShell } from "@/shared/ui/page-shell"

export function NotificationsPage() {
  return (
    <AuthGuard>
      <PageShell tier="list">
        <PageShell.Header>
          <MobileHeader>
            <MobileHeader.BackButton />
            <MobileHeader.Title>알림</MobileHeader.Title>
            <MobileHeader.Spacer />
          </MobileHeader>
        </PageShell.Header>
        <PageShell.Content spacing="none">
          <NotificationListContent />
        </PageShell.Content>
      </PageShell>
    </AuthGuard>
  )
}
