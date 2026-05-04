"use client"

import { Text } from "@/shared/ui/text"

type Props = {
  title: React.ReactNode
  subtitle?: React.ReactNode
  children: React.ReactNode
}

/**
 * 모바일 AppCard 의 웹 버전 — section heading + body 가 든 rounded card.
 * Wave 1.5 wizard 의 모든 step 에서 사용.
 */
export function StepCard({ title, subtitle, children }: Props) {
  return (
    <section className="border-border bg-card flex flex-col rounded-2xl border p-5 md:p-6">
      <header className="mb-4 flex flex-col gap-1">
        <Text as="h3" typography="subtitle1-bold" className="text-foreground">
          {title}
        </Text>
        {subtitle && (
          <Text typography="caption1-medium" className="text-muted-foreground">
            {subtitle}
          </Text>
        )}
      </header>
      <div>{children}</div>
    </section>
  )
}
