/**
 * [임시 v1] 모바일 콘텐츠 복사 기반 정적 약관 페이지 셸.
 *
 * TODO(legal-v2): 콘텐츠 source 와 버전 이력 도입 시 props 시그니처 재검토 (version, lastReviewedAt 등).
 */

import { PageShell, PageShellContent } from "@/shared/ui/page-shell"
import { Text } from "@/shared/ui/text"
import { MarkdownContent } from "./markdown-content"

type LegalPageProps = {
  title: string
  effectiveDate: string
  content: string
}

export function LegalPage({ title, effectiveDate, content }: LegalPageProps) {
  // 서버 컴포넌트(라우트 page.tsx) 에서 호출되므로 PageShell.* 서브프로퍼티 대신
  // named export 를 사용한다 (page-shell.tsx 의 주석 참조 — RSC serialization 이슈).
  return (
    <PageShell tier="content">
      <PageShellContent>
        <header className="border-border/60 mb-8 border-b pb-6">
          <Text as="h1" typography="h2-bold" className="text-foreground">
            {title}
          </Text>
          <Text
            as="p"
            typography="body3-regular"
            className="text-muted-foreground mt-2"
          >
            시행일: {effectiveDate}
          </Text>
        </header>
        <MarkdownContent>{content}</MarkdownContent>
      </PageShellContent>
    </PageShell>
  )
}
