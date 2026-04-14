"use client"

import { useState } from "react"
import { Plus, FolderOpen } from "lucide-react"
import { Button } from "@/shared/ui/button"
import { Text } from "@/shared/ui/text"
import { ResponsiveAlert } from "@/shared/ui/responsive-alert"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/ui/dialog"
import { useMyExpertProfileQuery } from "@/features/mypage/expert-profile"
import {
  useAddPortfolioMutation,
  useUpdatePortfolioMutation,
  useDeletePortfolioMutation,
} from "@/features/mypage/portfolios"
import type { z } from "zod/v4"
import type { portfolioSchema } from "@/entities/user/api/user.schema"
import { PortfolioCard } from "./portfolio-card"
import { PortfolioFormDialog } from "./portfolio-form-dialog"

type Portfolio = z.infer<typeof portfolioSchema>

export function PortfolioList() {
  const { data: profile } = useMyExpertProfileQuery()
  const addMutation = useAddPortfolioMutation()
  const updateMutation = useUpdatePortfolioMutation()
  const deleteMutation = useDeletePortfolioMutation()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPortfolio, setEditingPortfolio] = useState<Portfolio | undefined>()
  const [deleteTarget, setDeleteTarget] = useState<Portfolio | null>(null)

  const [alertOpen, setAlertOpen] = useState(false)
  const [alertConfig, setAlertConfig] = useState<{
    variant: "success" | "warning"
    title: string
  }>({ variant: "success", title: "" })

  const portfolios = profile?.portfolios ?? []

  const handleAdd = () => {
    setEditingPortfolio(undefined)
    setDialogOpen(true)
  }

  const handleEdit = (portfolio: Portfolio) => {
    setEditingPortfolio(portfolio)
    setDialogOpen(true)
  }

  const handleSubmit = async (data: {
    type?: string
    description: string
    existingImageUrls: string[]
    newImages: File[]
  }) => {
    try {
      if (editingPortfolio?.id) {
        await updateMutation.mutateAsync({
          portfolioId: editingPortfolio.id,
          ...data,
        })
        setAlertConfig({ variant: "success", title: "포트폴리오가 수정되었습니다." })
      } else {
        await addMutation.mutateAsync(data)
        setAlertConfig({ variant: "success", title: "포트폴리오가 추가되었습니다." })
      }
      setDialogOpen(false)
      setAlertOpen(true)
    } catch {
      setAlertConfig({ variant: "warning", title: "저장에 실패했습니다." })
      setAlertOpen(true)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget?.id) return
    try {
      await deleteMutation.mutateAsync(deleteTarget.id)
      setDeleteTarget(null)
      setAlertConfig({ variant: "success", title: "포트폴리오가 삭제되었습니다." })
      setAlertOpen(true)
    } catch {
      setAlertConfig({ variant: "warning", title: "삭제에 실패했습니다." })
      setAlertOpen(true)
    }
  }

  return (
    <>
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
                onDelete={() => setDeleteTarget(portfolio)}
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

      <PortfolioFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        portfolio={editingPortfolio}
        onSubmit={handleSubmit}
        isPending={addMutation.isPending || updateMutation.isPending}
      />

      {/* 삭제 확인 */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>포트폴리오를 삭제하시겠습니까?</DialogTitle>
            <DialogDescription>삭제된 포트폴리오는 복구할 수 없습니다.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "삭제 중..." : "삭제"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ResponsiveAlert
        open={alertOpen}
        onOpenChange={setAlertOpen}
        variant={alertConfig.variant}
        title={alertConfig.title}
      />
    </>
  )
}
