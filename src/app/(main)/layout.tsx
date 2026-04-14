import { MainDesktopHeader } from "@/app/(main)/_components/main-desktop-header"
import { BottomNav } from "@/app/(main)/_components/bottom-nav"

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MainDesktopHeader />
      {children}
      <BottomNav />
    </>
  )
}
