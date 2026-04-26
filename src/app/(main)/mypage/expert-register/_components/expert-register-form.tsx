"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/shared/ui/button"
import { Text } from "@/shared/ui/text"
import { Card, CardContent } from "@/shared/ui/card"
import { openAlert } from "@/shared/lib/open-alert"
import {
  useRegisterExpertMutation,
  STEP_FIELDS,
  type ExpertRegisterFormValues,
} from "@/features/mypage/expert-register"
import { StepIndicator } from "./step-indicator"
import { Step1BasicInfo } from "./step1-basic-info"
import { Step2Certifications } from "./step2-certifications"
import { Step3Portfolios } from "./step3-portfolios"
import { Step4ActivityInfo } from "./step4-activity-info"
import { Step5Confirm } from "./step5-confirm"

const TOTAL_STEPS = 5

export function ExpertRegisterForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const registerMutation = useRegisterExpertMutation()

  const form = useForm<ExpertRegisterFormValues>({
    defaultValues: {
      introduction: "",
      detailIntroduction: "",
      careerPeriod: "",
      activityMethod: undefined,
      subCategoryIds: [],
      certifications: [],
      portfolios: [],
      availableTimes: [],
      availableRegions: [],
      bankCode: "",
      accountNumber: "",
      accountHolder: "",
    },
  })

  const handleNext = async () => {
    const fields = STEP_FIELDS[currentStep]
    if (!fields) return

    const isValid = await form.trigger(fields as (keyof ExpertRegisterFormValues)[])
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS))
    }
  }

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      await registerMutation.mutateAsync(values)
      openAlert({
        variant: "success",
        title: "전문가 등록이 완료되었습니다!",
      })
    } catch (error) {
      openAlert({
        variant: "warning",
        title: "등록에 실패했습니다.",
        description: error instanceof Error ? error.message : "다시 시도해주세요.",
      })
    }
  })

  return (
    <Card>
      <CardContent>
        <StepIndicator currentStep={currentStep} totalSteps={TOTAL_STEPS} />
      </CardContent>

      <CardContent>
        <form onSubmit={handleSubmit}>
          {currentStep === 1 && <Step1BasicInfo form={form} />}
          {currentStep === 2 && <Step2Certifications form={form} />}
          {currentStep === 3 && <Step3Portfolios form={form} />}
          {currentStep === 4 && <Step4ActivityInfo form={form} />}
          {currentStep === 5 && <Step5Confirm form={form} />}

          <div className="mt-6 flex gap-3">
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={handlePrev}
              >
                <Text as="span" typography="body3-medium">이전</Text>
              </Button>
            )}

            {currentStep < TOTAL_STEPS ? (
              <Button
                type="button"
                className="flex-1"
                onClick={handleNext}
              >
                <Text as="span" typography="body3-medium">다음</Text>
              </Button>
            ) : (
              <Button
                type="submit"
                className="flex-1"
                disabled={registerMutation.isPending}
              >
                <Text as="span" typography="body3-medium">
                  {registerMutation.isPending ? "등록 중..." : "전문가 등록"}
                </Text>
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
