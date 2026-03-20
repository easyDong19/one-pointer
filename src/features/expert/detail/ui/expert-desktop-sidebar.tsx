import Image from "next/image"
import { Star, MapPin } from "lucide-react"
import { Text } from "@/shared/ui/text"
import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"
import { Separator } from "@/shared/ui/separator"
import {
  GRADE_LABEL,
  ACTIVITY_METHOD_LABEL,
} from "@/entities/expert/lib/expert.constants"
import type { ExpertDetail } from "@/entities/expert/api/expert.schema"

export function ExpertDesktopSidebar({ expert }: { expert: ExpertDetail }) {
  const initial = expert.nickname.charAt(0)

  return (
    <div className="sticky top-8">
      <div className="bg-card border-border flex flex-col gap-5 rounded-xl border p-6 shadow-sm">
        {/* Avatar + Name */}
        <div className="flex items-center gap-3">
          {expert.profileImageUrl ? (
            <Image
              src={expert.profileImageUrl}
              alt={expert.nickname}
              width={48}
              height={48}
              className="rounded-full object-cover"
              unoptimized
            />
          ) : (
            <div className="bg-primary/20 text-primary flex h-12 w-12 items-center justify-center rounded-full">
              <Text as="span" typography="body1-bold">
                {initial}
              </Text>
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <Text as="h2" typography="body1-bold" className="text-foreground">
                {expert.nickname}
              </Text>
              <Badge variant="secondary" className="text-xs">
                {GRADE_LABEL[expert.grade] ?? expert.grade}
              </Badge>
            </div>
            <Text as="p" typography="caption1-medium" className="text-muted-foreground">
              {expert.categories.flatMap((c) => c.subCategoryNames).join(", ")}
            </Text>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-muted rounded-lg p-4">
          <div className="flex items-center justify-around">
            <StatItem
              label="평점"
              value={
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  {expert.reviewSummary?.averageRating?.toFixed(1) ?? "-"}
                </span>
              }
            />
            <StatItem label="리뷰" value={`${expert.reviewSummary?.reviewCount ?? 0}개`} />
            <StatItem label="매칭" value={`${expert.reviewSummary?.totalMatchCount ?? 0}회`} />
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col gap-2">
          <InfoRow label="활동 방식" value={ACTIVITY_METHOD_LABEL[expert.activityMethod] ?? expert.activityMethod} />
          <InfoRow label="경력" value={expert.careerPeriod} />
          {expert.availableRegions.length > 0 && (
            <InfoRow
              label="지역"
              value={expert.availableRegions.join(", ")}
              icon={<MapPin className="h-3.5 w-3.5" />}
            />
          )}
        </div>

        <Separator />

        {/* CTA */}
        <Button size="lg" className="w-full">
          <Text as="span" typography="body2-bold">
            의뢰하기
          </Text>
        </Button>
      </div>
    </div>
  )
}

function StatItem({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <Text as="span" typography="caption1-medium" className="text-muted-foreground">
        {label}
      </Text>
      <Text as="span" typography="body2-bold" className="text-foreground">
        {value}
      </Text>
    </div>
  )
}

function InfoRow({
  label,
  value,
  icon,
}: {
  label: string
  value: string
  icon?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between">
      <Text as="span" typography="body3-regular" className="text-muted-foreground">
        {label}
      </Text>
      <span className="text-foreground flex items-center gap-1">
        {icon}
        <Text as="span" typography="body3-medium">
          {value}
        </Text>
      </span>
    </div>
  )
}
