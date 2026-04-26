"use client"

import { Plus, Pencil, Trash2, Award } from "lucide-react"
import { Button } from "@/shared/ui/button"
import { Text } from "@/shared/ui/text"
import { openAlert } from "@/shared/lib/open-alert"
import { openConfirm } from "@/shared/lib/open-confirm-dialog"
import { useMyExpertProfileQuery } from "@/features/mypage/expert-profile"
import {
  openCertificationForm,
  useAddCertificationMutation,
  useUpdateCertificationMutation,
  useDeleteCertificationMutation,
} from "@/features/mypage/certifications"
import type { z } from "zod/v4"
import type { expertCertificationSchema } from "@/entities/expert/api/expert.schema"

type Certification = z.infer<typeof expertCertificationSchema>

export function CertificationList() {
  const { data: profile } = useMyExpertProfileQuery()
  const addMutation = useAddCertificationMutation()
  const updateMutation = useUpdateCertificationMutation()
  const deleteMutation = useDeleteCertificationMutation()

  const certifications = profile?.certifications ?? []

  const handleAdd = async () => {
    const data = await openCertificationForm()
    if (!data) return
    try {
      await addMutation.mutateAsync(data)
      openAlert({ variant: "success", title: "자격증이 추가되었습니다." })
    } catch {
      openAlert({ variant: "warning", title: "저장에 실패했습니다." })
    }
  }

  const handleEdit = async (cert: Certification) => {
    const data = await openCertificationForm(cert)
    if (!data || !cert.id) return
    try {
      await updateMutation.mutateAsync({ certificationId: cert.id, ...data })
      openAlert({ variant: "success", title: "자격증이 수정되었습니다." })
    } catch {
      openAlert({ variant: "warning", title: "저장에 실패했습니다." })
    }
  }

  const handleDelete = async (cert: Certification) => {
    if (!cert.id) return
    const ok = await openConfirm({
      title: "자격증을 삭제하시겠습니까?",
      description: "삭제된 자격증은 복구할 수 없습니다.",
      confirmLabel: "삭제",
      variant: "destructive",
    })
    if (!ok) return
    try {
      await deleteMutation.mutateAsync(cert.id)
      openAlert({ variant: "success", title: "자격증이 삭제되었습니다." })
    } catch {
      openAlert({ variant: "warning", title: "삭제에 실패했습니다." })
    }
  }

  return (
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
                  onClick={() => handleDelete(cert)}
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
  )
}
