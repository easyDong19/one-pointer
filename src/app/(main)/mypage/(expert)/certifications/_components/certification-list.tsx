"use client"

import { useState } from "react"
import { Plus, Pencil, Trash2, Award } from "lucide-react"
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
  useAddCertificationMutation,
  useUpdateCertificationMutation,
  useDeleteCertificationMutation,
} from "@/features/mypage/certifications"
import type { z } from "zod/v4"
import type { expertCertificationSchema } from "@/entities/expert/api/expert.schema"
import { CertificationFormDialog } from "./certification-form-dialog"

type Certification = z.infer<typeof expertCertificationSchema>

export function CertificationList() {
  const { data: profile } = useMyExpertProfileQuery()
  const addMutation = useAddCertificationMutation()
  const updateMutation = useUpdateCertificationMutation()
  const deleteMutation = useDeleteCertificationMutation()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCert, setEditingCert] = useState<Certification | undefined>()
  const [deleteTarget, setDeleteTarget] = useState<Certification | null>(null)

  const [alertOpen, setAlertOpen] = useState(false)
  const [alertConfig, setAlertConfig] = useState<{
    variant: "success" | "warning"
    title: string
  }>({ variant: "success", title: "" })

  const certifications = profile?.certifications ?? []

  const handleAdd = () => {
    setEditingCert(undefined)
    setDialogOpen(true)
  }

  const handleEdit = (cert: Certification) => {
    setEditingCert(cert)
    setDialogOpen(true)
  }

  const handleSubmit = async (data: { name: string; issuer: string }) => {
    try {
      if (editingCert?.id) {
        await updateMutation.mutateAsync({
          certificationId: editingCert.id,
          ...data,
        })
        setAlertConfig({ variant: "success", title: "자격증이 수정되었습니다." })
      } else {
        await addMutation.mutateAsync(data)
        setAlertConfig({ variant: "success", title: "자격증이 추가되었습니다." })
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
      setAlertConfig({ variant: "success", title: "자격증이 삭제되었습니다." })
      setAlertOpen(true)
    } catch {
      setAlertConfig({ variant: "warning", title: "삭제에 실패했습니다." })
      setAlertOpen(true)
    }
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        {certifications.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-12">
            <Award className="size-10 text-muted-foreground" />
            <Text as="p" typography="body3-regular" className="text-muted-foreground">
              등록된 자격증이 없습니다
            </Text>
            <Button size="sm" onClick={handleAdd}>
              <Plus className="mr-1 size-4" />
              자격증 추가
            </Button>
          </div>
        ) : (
          <>
            {certifications.map((cert) => (
              <div
                key={cert.id}
                className="flex items-center justify-between rounded-xl border p-4 shadow-sm"
              >
                <div className="flex flex-col gap-0.5">
                  <Text as="p" typography="body3-medium">
                    {cert.name}
                  </Text>
                  {cert.issuer && (
                    <Text as="p" typography="caption2-medium" className="text-muted-foreground">
                      {cert.issuer}
                    </Text>
                  )}
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => handleEdit(cert)}
                    className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(cert)}
                    className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ))}

            <Button variant="outline" className="w-full" onClick={handleAdd}>
              <Plus className="mr-1 size-4" />
              자격증 추가
            </Button>
          </>
        )}
      </div>

      <CertificationFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        certification={editingCert}
        onSubmit={handleSubmit}
        isPending={addMutation.isPending || updateMutation.isPending}
      />

      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>자격증을 삭제하시겠습니까?</DialogTitle>
            <DialogDescription>삭제된 자격증은 복구할 수 없습니다.</DialogDescription>
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
