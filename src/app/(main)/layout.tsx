import { MainCommonHeader } from "@/app/(main)/_components/main-common-header"
import { BottomNav } from "@/app/(main)/_components/bottom-nav"

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MainCommonHeader />
      {children}
      <BottomNav />
    </>
  )
}
