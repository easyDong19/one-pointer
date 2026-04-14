import Link from "next/link"
import { Text } from "@/shared/ui/text"

export function HomeFooter() {
  return (
    <footer className="mt-8 border-t border-border bg-muted">
      <div className="mx-auto max-w-6xl px-5 py-8 md:px-10 md:py-12 lg:px-16">
        {/* 데스크탑: 3열 / 모바일: 1열 */}
        <div className="flex flex-col gap-6 md:flex-row md:justify-between md:gap-12">
          {/* 브랜드 */}
          <div className="flex flex-col gap-2">
            <Text as="span" typography="body2-bold" className="text-primary">
              쪽집게
            </Text>
            <Text as="p" typography="body3-regular" className="text-foreground">
              전문 서비스 매칭 플랫폼
            </Text>
            <Text as="p" typography="body3-regular" className="text-muted-foreground">
              채팅이 곧 리뷰 · 전문가 수수료 0%
            </Text>
          </div>

          {/* 데스크탑: 링크 열 */}
          <div className="hidden gap-16 md:flex">
            <div className="flex flex-col gap-3">
              <Text as="span" typography="body3-bold" className="text-foreground">
                서비스
              </Text>
              <Link href="/experts">
                <Text as="span" typography="caption1-medium" className="text-muted-foreground hover:text-foreground">
                  전문가 찾기
                </Text>
              </Link>
              <Link href="/tickets/new">
                <Text as="span" typography="caption1-medium" className="text-muted-foreground hover:text-foreground">
                  의뢰 등록
                </Text>
              </Link>
              <Link href="/about">
                <Text as="span" typography="caption1-medium" className="text-muted-foreground hover:text-foreground">
                  서비스 소개
                </Text>
              </Link>
            </div>

            <div className="flex flex-col gap-3">
              <Text as="span" typography="body3-bold" className="text-foreground">
                지원
              </Text>
              <Link href="/support">
                <Text as="span" typography="caption1-medium" className="text-muted-foreground hover:text-foreground">
                  고객센터
                </Text>
              </Link>
              <Link href="/terms">
                <Text as="span" typography="caption1-medium" className="text-muted-foreground hover:text-foreground">
                  이용약관
                </Text>
              </Link>
              <Link href="/privacy">
                <Text as="span" typography="caption1-medium" className="text-muted-foreground hover:text-foreground">
                  개인정보처리방침
                </Text>
              </Link>
            </div>
          </div>
        </div>

        {/* 구분선 */}
        <div className="mt-6 h-px bg-border md:mt-8" />

        {/* 하단 */}
        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {/* 모바일 전용: 링크 */}
          <div className="flex flex-wrap items-center gap-3 md:hidden">
            <Link href="/terms">
              <Text as="span" typography="caption1-medium" className="text-muted-foreground">
                이용약관
              </Text>
            </Link>
            <Text as="span" typography="caption1-medium" className="text-border">·</Text>
            <Link href="/privacy">
              <Text as="span" typography="caption1-medium" className="text-muted-foreground">
                개인정보처리방침
              </Text>
            </Link>
            <Text as="span" typography="caption1-medium" className="text-border">·</Text>
            <Link href="/support">
              <Text as="span" typography="caption1-medium" className="text-muted-foreground">
                고객센터
              </Text>
            </Link>
          </div>

          <Text as="p" typography="caption2-medium" className="text-muted-foreground">
            &copy; 2026 쪽집게. All rights reserved.
          </Text>
        </div>
      </div>
    </footer>
  )
}
