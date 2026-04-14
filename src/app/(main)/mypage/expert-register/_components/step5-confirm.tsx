"use client"

import type { UseFormReturn } from "react-hook-form"
import { Input } from "@/shared/ui/input"
import { Text } from "@/shared/ui/text"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select"
import { BANK_CODES } from "@/shared/data/bank-codes"
import type { ExpertRegisterFormValues } from "@/features/mypage/expert-register"

type Step5Props = {
  form: UseFormReturn<ExpertRegisterFormValues>
}

export function Step5Confirm({ form }: Step5Props) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = form

  const values = watch()

  return (
    <div className="flex flex-col gap-6">
      {/* 정산계좌 */}
      <div className="flex flex-col gap-4">
        <div>
          <Text as="p" typography="body3-medium">
            정산계좌 (선택)
          </Text>
          <Text as="p" typography="caption2-medium" className="mt-0.5 text-muted-foreground">
            입력하시면 3개 항목 모두 필수입니다
          </Text>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Text as="label" typography="caption2-medium">은행</Text>
            <Select
              value={values.bankCode ?? ""}
              onValueChange={(v) => setValue("bankCode", v, { shouldValidate: true })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="은행 선택" />
              </SelectTrigger>
              <SelectContent>
                {BANK_CODES.map((bank) => (
                  <SelectItem key={bank.code} value={bank.code}>
                    {bank.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Text as="label" typography="caption2-medium">계좌번호</Text>
            <Input
              {...register("accountNumber")}
              inputMode="numeric"
              placeholder="- 없이 숫자만 입력"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Text as="label" typography="caption2-medium">예금주</Text>
            <Input
              {...register("accountHolder")}
              placeholder="예금주명"
            />
          </div>

          {errors.bankCode && (
            <Text as="p" typography="caption2-medium" className="text-destructive">
              {errors.bankCode.message}
            </Text>
          )}
        </div>
      </div>

      {/* 입력 요약 */}
      <div className="flex flex-col gap-3 rounded-lg border bg-muted/30 p-4">
        <Text as="p" typography="subtitle2-bold">
          등록 정보 요약
        </Text>

        <SummaryRow label="소개글" value={values.introduction} />
        <SummaryRow
          label="활동 방식"
          value={
            values.activityMethod === "OFFLINE"
              ? "오프라인"
              : values.activityMethod === "ONLINE"
                ? "온라인"
                : values.activityMethod === "BOTH"
                  ? "온/오프라인"
                  : "-"
          }
        />
        <SummaryRow
          label="카테고리"
          value={`${values.subCategoryIds?.length ?? 0}개 선택`}
        />
        <SummaryRow
          label="자격증"
          value={
            values.certifications?.filter((c) => c.name.trim()).length
              ? `${values.certifications.filter((c) => c.name.trim()).length}개`
              : "없음"
          }
        />
        <SummaryRow
          label="포트폴리오"
          value={
            values.portfolios?.length ? `${values.portfolios.length}개` : "없음"
          }
        />
        <SummaryRow
          label="활동 시간대"
          value={
            values.availableTimes?.length
              ? `${values.availableTimes.length}개 선택`
              : "없음"
          }
        />
        <SummaryRow
          label="활동 지역"
          value={
            values.availableRegions?.length
              ? values.availableRegions.join(", ")
              : "없음"
          }
        />
        <SummaryRow
          label="정산계좌"
          value={values.bankCode ? "입력 완료" : "미입력"}
        />
      </div>
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <Text as="span" typography="caption1-medium" className="shrink-0 text-muted-foreground">
        {label}
      </Text>
      <Text as="span" typography="caption1-medium" className="text-right">
        {value || "-"}
      </Text>
    </div>
  )
}
