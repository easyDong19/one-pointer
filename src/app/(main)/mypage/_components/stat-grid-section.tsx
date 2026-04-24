"use client"

import { Wallet, CheckCircle, Star, FileText, Clock } from "lucide-react"
import { Text } from "@/shared/ui/text"
import { useRoleStore } from "@/entities/user/model/role-store"
import { useExpertDashboardQuery, useClientDashboardQuery } from "@/features/mypage/dashboard"

export function StatGridSection() {
  const role = useRoleStore((s) => s.role)

  return role === "expert" ? <ExpertStats /> : <ClientStats />
}

function ExpertStats() {
  const { data, isLoading } = useExpertDashboardQuery()

  const stats = [
    {
      label: "대기 제안",
      value: data?.pendingProposals ?? 0,
      unit: "건",
      icon: FileText,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "진행중",
      value: data?.inProgressTickets ?? 0,
      unit: "건",
      icon: Clock,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      label: "완료",
      value: data?.completedTickets ?? 0,
      unit: "건",
      icon: CheckCircle,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      label: "평균 평점",
      value:
        data?.averageRating != null ? (Math.ceil(data.averageRating * 10) / 10).toFixed(1) : "-",
      unit: data?.averageRating != null ? "점" : "",
      icon: Star,
      color: "text-yellow-500",
      bg: "bg-yellow-500/10",
    },
  ]

  return <StatGrid stats={stats} isLoading={isLoading} />
}

function ClientStats() {
  const { data, isLoading } = useClientDashboardQuery()

  const stats = [
    {
      label: "등록 티켓",
      value: data?.openTickets ?? 0,
      unit: "건",
      icon: FileText,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "진행중",
      value: data?.inProgressTickets ?? 0,
      unit: "건",
      icon: Clock,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      label: "완료",
      value: data?.completedTickets ?? 0,
      unit: "건",
      icon: CheckCircle,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      label: "쿠폰",
      value: data?.couponBalance ?? 0,
      unit: "개",
      icon: Wallet,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
  ]

  return <StatGrid stats={stats} isLoading={isLoading} />
}

type StatItem = {
  label: string
  value: string | number
  unit: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  bg: string
}

function StatGrid({ stats, isLoading }: { stats: StatItem[]; isLoading: boolean }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <div
            key={stat.label}
            className="bg-card flex flex-col gap-2 rounded-xl border p-4 shadow-sm"
          >
            <div className={cn("flex size-9 items-center justify-center rounded-lg", stat.bg)}>
              <Icon className={cn("size-5", stat.color)} />
            </div>
            <div>
              <Text as="p" typography="caption1-medium" className="text-muted-foreground">
                {stat.label}
              </Text>
              {isLoading ? (
                <div className="bg-muted mt-1 h-6 w-12 animate-pulse rounded" />
              ) : (
                <Text as="p" typography="subtitle1-bold">
                  {stat.value}
                  {stat.unit && (
                    <Text
                      as="span"
                      typography="body3-regular"
                      className="text-muted-foreground ml-0.5"
                    >
                      {stat.unit}
                    </Text>
                  )}
                </Text>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ")
}
