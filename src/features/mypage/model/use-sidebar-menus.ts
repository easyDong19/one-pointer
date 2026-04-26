"use client"

import { useMemo } from "react"
import { useRoleStore } from "@/entities/user/model/role-store"

export type SidebarMenuItem = {
  label: string
  href: string
  icon?: string
}

export type SidebarMenuGroup = {
  title?: string
  items: SidebarMenuItem[]
}

const CLIENT_MENUS: SidebarMenuGroup[] = [
  {
    items: [
      { label: "대시보드", href: "/mypage" },
      { label: "나의 의뢰", href: "/mypage/tickets" },
    ],
  },
  {
    title: "계정",
    items: [
      { label: "프로필 수정", href: "/mypage/profile" },
    ],
  },
]

const EXPERT_MENUS: SidebarMenuGroup[] = [
  {
    items: [
      { label: "대시보드", href: "/mypage" },
      { label: "받은 의뢰", href: "/mypage/requests" },
      { label: "수익 관리", href: "/mypage/earnings" },
      { label: "리뷰 관리", href: "/mypage/reviews" },
    ],
  },
  {
    title: "프로필",
    items: [
      { label: "전문가 프로필", href: "/mypage/expert-profile" },
      { label: "포트폴리오", href: "/mypage/portfolios" },
      { label: "자격증", href: "/mypage/certifications" },
    ],
  },
  {
    title: "계정",
    items: [
      { label: "정산 계좌", href: "/mypage/bank-account" },
      { label: "알림 설정", href: "/mypage/notifications" },
    ],
  },
]

export function useSidebarMenus(): SidebarMenuGroup[] {
  const activeRole = useRoleStore((s) => s.role)

  return useMemo(
    () => (activeRole === "expert" ? EXPERT_MENUS : CLIENT_MENUS),
    [activeRole],
  )
}
