import ReactMarkdown, { type Components } from "react-markdown"
import remarkGfm from "remark-gfm"
import { cn } from "@/shared/lib/utils"

/**
 * [임시 v1] 약관/정책 마크다운 렌더러.
 * Pretendard 단일 서체 + 프로젝트 디자인 토큰. 본문 위계는 h2/h3 만 사용.
 *
 * 서버 컴포넌트로 동작 — react-markdown 9+ 가 RSC 호환되므로 "use client" 불필요.
 * 결과: 클라이언트 번들에서 react-markdown + remark-gfm 제외 → 약관 페이지 lighter.
 *
 * TODO(legal-v2): 콘텐츠 source 가 정식화되면 GFM 외 추가 플러그인(footnote 등)도 검토.
 */
const components: Components = {
  h1: ({ className, ...props }) => (
    <h2
      className={cn(
        "text-foreground mt-10 mb-4 text-xl font-semibold tracking-tight first:mt-0",
        className,
      )}
      {...props}
    />
  ),
  h2: ({ className, ...props }) => (
    <h2
      className={cn(
        "text-foreground border-border/60 mt-10 mb-4 border-t pt-6 text-xl font-semibold tracking-tight first:mt-0 first:border-t-0 first:pt-0",
        className,
      )}
      {...props}
    />
  ),
  h3: ({ className, ...props }) => (
    <h3
      className={cn(
        "text-foreground mt-7 mb-2 text-base font-semibold tracking-tight",
        className,
      )}
      {...props}
    />
  ),
  h4: ({ className, ...props }) => (
    <h4
      className={cn(
        "text-foreground mt-5 mb-2 text-[15px] font-semibold",
        className,
      )}
      {...props}
    />
  ),
  p: ({ className, ...props }) => (
    <p
      className={cn(
        "text-foreground/85 my-3 text-[15px] leading-[1.75]",
        className,
      )}
      {...props}
    />
  ),
  ul: ({ className, ...props }) => (
    <ul
      className={cn(
        "text-foreground/85 my-3 list-disc space-y-1.5 pl-6 text-[15px] leading-[1.7] marker:text-muted-foreground/60",
        className,
      )}
      {...props}
    />
  ),
  ol: ({ className, ...props }) => (
    <ol
      className={cn(
        "text-foreground/85 my-3 list-decimal space-y-1.5 pl-6 text-[15px] leading-[1.7] marker:text-muted-foreground/60",
        className,
      )}
      {...props}
    />
  ),
  li: ({ className, ...props }) => (
    <li className={cn("[&>p]:my-1", className)} {...props} />
  ),
  strong: ({ className, ...props }) => (
    <strong className={cn("text-foreground font-semibold", className)} {...props} />
  ),
  blockquote: ({ className, ...props }) => (
    <blockquote
      className={cn(
        "border-primary/40 bg-muted/40 text-foreground/80 my-4 border-l-2 px-4 py-3 text-[14px] leading-[1.7]",
        className,
      )}
      {...props}
    />
  ),
  table: ({ className, ...props }) => (
    <div className="my-4 overflow-x-auto">
      <table
        className={cn(
          "border-border/70 w-full border-collapse border text-[14px]",
          className,
        )}
        {...props}
      />
    </div>
  ),
  thead: ({ className, ...props }) => (
    <thead className={cn("bg-muted/50", className)} {...props} />
  ),
  th: ({ className, ...props }) => (
    <th
      className={cn(
        "border-border/70 text-foreground border px-3 py-2 text-left font-semibold",
        className,
      )}
      {...props}
    />
  ),
  td: ({ className, ...props }) => (
    <td
      className={cn(
        "border-border/70 text-foreground/85 border px-3 py-2 align-top",
        className,
      )}
      {...props}
    />
  ),
  a: ({ className, href, ...props }) => {
    const isExternal = href?.startsWith("http")
    return (
      <a
        href={href}
        className={cn(
          "text-primary font-medium hover:underline focus-visible:underline",
          className,
        )}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        {...props}
      />
    )
  },
  hr: ({ className, ...props }) => (
    <hr className={cn("border-border/60 my-8", className)} {...props} />
  ),
  code: ({ className, ...props }) => (
    <code
      className={cn(
        "bg-muted text-foreground rounded px-1.5 py-0.5 text-[13px]",
        className,
      )}
      {...props}
    />
  ),
}

export function MarkdownContent({ children }: { children: string }) {
  return (
    <div className="prose-none">
      <ReactMarkdown
        // singleTilde: false — `3~5 영업일` 같은 한글 범위 표기가 GFM 의 single tilde
        // strikethrough 로 잘못 파싱되는 문제 방지. `~~text~~` (이중 tilde) 는 그대로 동작.
        remarkPlugins={[[remarkGfm, { singleTilde: false }]]}
        components={components}
      >
        {children}
      </ReactMarkdown>
    </div>
  )
}
