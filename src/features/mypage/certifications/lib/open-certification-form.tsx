"use client"

import { overlay } from "overlay-kit"
import type { z } from "zod/v4"
import type { expertCertificationSchema } from "@/entities/expert/api/expert.schema"
import {
  CertificationFormDialog,
  type CertificationFormData,
} from "../ui/certification-form-dialog"

type Certification = z.infer<typeof expertCertificationSchema>

/**
 * 자격증 추가/편집 다이얼로그를 열고, 사용자가 입력한 데이터를 Promise 로 반환한다.
 *
 * @param certification - 편집 대상 (생략 시 추가 모드)
 * @returns 제출된 폼 데이터, 또는 취소 시 null
 */
export function openCertificationForm(
  certification?: Certification,
): Promise<CertificationFormData | null> {
  return new Promise((resolve) => {
    overlay.open(({ isOpen, close, unmount }) => (
      <CertificationFormDialog
        isOpen={isOpen}
        certification={certification}
        onSubmit={(data) => {
          resolve(data)
          close()
          setTimeout(unmount, 300)
        }}
        onClose={() => {
          resolve(null)
          close()
          setTimeout(unmount, 300)
        }}
      />
    ))
  })
}
