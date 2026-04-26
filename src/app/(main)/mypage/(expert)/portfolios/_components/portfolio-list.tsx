"use client"

import { Plus, FolderOpen } from "lucide-react"
import { Button } from "@/shared/ui/button"
import { Text } from "@/shared/ui/text"
import { openAlert } from "@/shared/lib/open-alert"
import { openConfirm } from "@/shared/lib/open-confirm-dialog"
import { useMyExpertProfileQuery } from "@/features/mypage/expert-profile"
import {
  openPortfolioForm,
  useAddPortfolioMutation,
  useUpdatePortfolioMutation,
  useDeletePortfolioMutation,
} from "@/features/mypage/portfolios"
import type { z } from "zod/v4"
import type { expertPortfolioSchema } from "@/entities/expert/api/expert.schema"
import { PortfolioCard } from "./portfolio-card"

type Portfolio = z.infer<typeof expertPortfolioSchema>

export function PortfolioList() {
  const { data: profile } = useMyExpertProfileQuery()
  const addMutation = useAddPortfolioMutation()
  const updateMutation = useUpdatePortfolioMutation()
  const deleteMutation = useDeletePortfolioMutation()

  const portfolios = profile?.portfolios ?? []

  const handleAdd = async () => {
    const data = await openPortfolioForm()
    if (!data) return
    try {
      await addMutation.mutateAsync(data)
      openAlert({ variant: "success", title: "포트폴리오가 추가되었습니다." })
    } catch {
      openAlert({ variant: "warning", title: "저장에 실패했습니다." })
    }
  }

  const handleEdit = async (portfolio: Portfolio) => {
    const data = await openPortfolioForm(portfolio)
    if (!data || !portfolio.id) return
    try {
      await updateMutation.mutateAsync({ portfolioId: portfolio.id, ...data })
      openAlert({ variant: "success", title: "포트폴리오가 수정되었습니다." })
    } catch {
      openAlert({ variant: "warning", title: "저장에 실패했습니다." })
    }
  }

  const handleDelete = async (portfolio: Portfolio) => {
    if (!portfolio.id) return
    const ok = await openConfirm({
      title: "포트폴리오를 삭제하시겠습니까?",
      description: "삭제된 포트폴리오는 복구할 수 없습니다.",
      confirmLabel: "삭제",
      variant: "destructive",
    })
    if (!ok) return
    try {
      await deleteMutation.mutateAsync(portfolio.id)
      openAlert({ variant: "success", title: "포트폴리오가 삭제되었습니다." })
    } catch {
      openAlert({ variant: "warning", title: "삭제에 실패했습니다." })
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {portfolios.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-12">
          <FolderOpen className="size-10 text-muted-foreground" />
          <Text as="p" typography="body3-regular" className="text-muted-foreground">
            등록된 포트폴리오가 없습니다
          </Text>
          <Button size="sm" onClick={handleAdd}>
            <Plus className="mr-1 size-4" />
            포트폴리오 추가
          </Button>
        </div>
      ) : (
        <>
          {portfolios.map((portfolio) => (
            <PortfolioCard
              key={portfolio.id}
              portfolio={portfolio}
              onEdit={() => handleEdit(portfolio)}
              onDelete={() => handleDelete(portfolio)}
            />
          ))}

          {portfolios.length < 10 && (
            <Button variant="outline" className="w-full" onClick={handleAdd}>
              <Plus className="mr-1 size-4" />
              포트폴리오 추가
            </Button>
          )}
        </>
      )}
    </div>
  )
}
