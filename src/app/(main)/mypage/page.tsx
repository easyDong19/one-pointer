"use client"

import { ProfileSection } from "./_components/profile-section"
import { RoleToggle } from "./_components/role-toggle"
import { StatGridSection } from "./_components/stat-grid-section"
import { ExpertRegisterBanner } from "./_components/expert-register-banner"
import { QuickLinkGrid } from "./_components/quick-link-grid"
import { MobileMenuList } from "./_components/mobile-menu-list"
import { SettingsSection } from "./_components/settings-section"

export default function MypagePage() {
  return (
    <div className="flex flex-col gap-5">
      <ProfileSection />
      <RoleToggle />
      <ExpertRegisterBanner />
      <StatGridSection />
      <QuickLinkGrid />
      <MobileMenuList />
      <SettingsSection />
    </div>
  )
}
