import { MapPin, ShieldCheck, Wifi, ChevronRight } from "lucide-react"
import { Text } from "@/shared/ui/text"
import { ACTIVITY_METHOD_LABEL } from "@/entities/expert/lib/expert.constants"
import type { ExpertDetail } from "@/entities/expert/api/expert.schema"

/**
 * 전문가 프로필 메타 카드.
 *
 * 아바타·닉네임·등급·카테고리 타이틀 라인은 `ExpertProfileHero` 가 소유한다.
 * 여기서는 소개 · 지역 · 본인인증 · 활동방식 · 경력 · 활동시간 만 담는다.
 */
export function ExpertProfileCard({ expert }: { expert: ExpertDetail }) {
  return (
    <div className="bg-card border-border rounded-xl border p-5">
      {/* Introduction */}
      {expert.introduction && (
        <Text
          as="p"
          typography="body2-regular"
          className="text-foreground mb-3"
        >
          &quot; {expert.introduction} &quot;
        </Text>
      )}

      {/* Region */}
      {(expert.availableRegions ?? []).length > 0 && (
        <div className="mb-3 flex items-center gap-1.5">
          <MapPin className="text-muted-foreground h-4 w-4" />
          <Text as="span" typography="body3-regular" className="text-muted-foreground">
            {(expert.availableRegions ?? []).join(", ")}
          </Text>
        </div>
      )}

      {/* Badges: 본인인증 + 활동방식 */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="bg-success/10 text-success inline-flex items-center gap-1 rounded-full px-3 py-1">
          <ShieldCheck className="h-4 w-4" />
          <Text as="span" typography="caption1-medium">
            본인인증
          </Text>
        </span>
        {expert.activityMethod && (
          <span className="bg-muted text-muted-foreground inline-flex items-center gap-1 rounded-full px-3 py-1">
            <Wifi className="h-4 w-4" />
            <Text as="span" typography="caption1-medium">
              {ACTIVITY_METHOD_LABEL[expert.activityMethod] ?? expert.activityMethod}
            </Text>
          </span>
        )}
      </div>

      {/* Career */}
      {expert.careerPeriod && (
        <Text as="p" typography="body3-medium" className="text-foreground mb-1">
          경력 {expert.careerPeriod}
        </Text>
      )}

      {/* Available times link */}
      {expert.availableTimes && expert.availableTimes.length > 0 && (
        <button className="text-primary mt-1 inline-flex items-center gap-0.5">
          <Text as="span" typography="body3-medium">
            활동 시간 보기
          </Text>
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
