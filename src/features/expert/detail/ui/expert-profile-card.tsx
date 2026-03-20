import Image from "next/image"
import { MapPin, ShieldCheck, Wifi, ChevronRight } from "lucide-react"
import { Text } from "@/shared/ui/text"
import { Badge } from "@/shared/ui/badge"
import { Separator } from "@/shared/ui/separator"
import {
  GRADE_LABEL,
  ACTIVITY_METHOD_LABEL,
} from "@/entities/expert/lib/expert.constants"
import type { ExpertDetail } from "@/entities/expert/api/expert.schema"

export function ExpertProfileCard({ expert }: { expert: ExpertDetail }) {
  const initial = expert.nickname.charAt(0)

  return (
    <div className="bg-card border-border rounded-xl border p-5">
      {/* Avatar + Name + Grade + Category */}
      <div className="flex items-center gap-4">
        {expert.profileImageUrl ? (
          <Image
            src={expert.profileImageUrl}
            alt={expert.nickname}
            width={72}
            height={72}
            className="rounded-full object-cover"
            unoptimized
          />
        ) : (
          <div className="bg-primary/20 text-primary flex h-[72px] w-[72px] items-center justify-center rounded-full">
            <Text as="span" typography="h2-bold">
              {initial}
            </Text>
          </div>
        )}

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Text as="h1" typography="subtitle1-bold" className="text-foreground">
              {expert.nickname}
            </Text>
            <Badge variant="secondary">
              {GRADE_LABEL[expert.grade] ?? expert.grade}
            </Badge>
          </div>
          <Text as="p" typography="body3-regular" className="text-muted-foreground">
            {expert.categories.flatMap((c) => c.subCategoryNames).join(", ")}
          </Text>
        </div>
      </div>

      <Separator className="my-4" />

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
      {expert.availableRegions.length > 0 && (
        <div className="mb-3 flex items-center gap-1.5">
          <MapPin className="text-muted-foreground h-4 w-4" />
          <Text as="span" typography="body3-regular" className="text-muted-foreground">
            {expert.availableRegions.join(", ")}
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
        <span className="bg-muted text-muted-foreground inline-flex items-center gap-1 rounded-full px-3 py-1">
          <Wifi className="h-4 w-4" />
          <Text as="span" typography="caption1-medium">
            {ACTIVITY_METHOD_LABEL[expert.activityMethod] ?? expert.activityMethod}
          </Text>
        </span>
      </div>

      {/* Career */}
      <Text as="p" typography="body3-medium" className="text-foreground mb-1">
        경력 {expert.careerPeriod}
      </Text>

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
