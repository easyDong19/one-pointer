import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined"
import { Text } from "@/shared/ui/text"
import type { ExpertDetail } from "@/entities/expert/api/expert.schema"

export function ExpertCertificationTab({ expert }: { expert: ExpertDetail }) {
  const certifications = expert.certifications ?? []

  if (certifications.length === 0) {
    return (
      <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 py-12">
        <WorkspacePremiumOutlinedIcon className="text-muted-foreground/40" sx={{ fontSize: 48 }} />
        <Text as="p" typography="body2-regular" className="text-muted-foreground">
          등록된 자격증이 없습니다
        </Text>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 px-4 py-6 lg:px-0">
      {certifications.map((cert, idx) => (
        <div
          key={cert.id ?? idx}
          className="bg-card border-border flex items-center gap-4 rounded-xl border p-4"
        >
          <div className="bg-muted flex h-11 w-11 items-center justify-center rounded-full">
            <WorkspacePremiumOutlinedIcon className="text-muted-foreground" sx={{ fontSize: 22 }} />
          </div>
          <div className="flex flex-col gap-0.5">
            <Text as="p" typography="body2-bold" className="text-foreground">
              {cert.name}
            </Text>
            <Text as="p" typography="caption1-medium" className="text-muted-foreground">
              {cert.issuer}
            </Text>
          </div>
        </div>
      ))}
    </div>
  )
}
