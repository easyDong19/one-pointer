import { Text } from "@/shared/ui/text"
import type { ExpertDetail } from "@/entities/expert/api/expert.schema"

export function ExpertIntroTab({ expert }: { expert: ExpertDetail }) {
  const content = expert.detailIntroduction || expert.introduction

  if (!content) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <Text as="p" typography="body2-regular" className="text-muted-foreground">
          등록된 소개가 없습니다
        </Text>
      </div>
    )
  }

  return (
    <div className="px-4 py-6 lg:px-0">
      <Text
        as="p"
        typography="body2-regular"
        className="text-foreground whitespace-pre-wrap"
      >
        {content}
      </Text>
    </div>
  )
}
