import Link from "next/link"
import { Text } from "@/shared/ui/text"
import { Button } from "@/shared/ui/button"

export function HomeHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3 md:px-10 lg:px-16">
        <Link href="/">
          <Text as="span" typography="subtitle1-bold" className="text-primary">
            쪽집게
          </Text>
        </Link>

        {/* 데스크탑: 내비게이션 링크 */}
        <nav className="hidden items-center gap-8 md:flex">
          <Link href="/experts" className="transition-colors hover:text-primary">
            <Text as="span" typography="body3-medium" className="text-muted-foreground hover:text-primary">
              전문가 찾기
            </Text>
          </Link>
          <Link href="/tickets/new" className="transition-colors hover:text-primary">
            <Text as="span" typography="body3-medium" className="text-muted-foreground hover:text-primary">
              의뢰 등록
            </Text>
          </Link>
          <Link href="/about" className="transition-colors hover:text-primary">
            <Text as="span" typography="body3-medium" className="text-muted-foreground hover:text-primary">
              서비스 소개
            </Text>
          </Link>
        </nav>

        <Link href="/login">
          <Button className="rounded-full px-5 py-2">
            <Text as="span" typography="body3-medium" className="text-primary-foreground">
              로그인
            </Text>
          </Button>
        </Link>
      </div>
    </header>
  )
}
