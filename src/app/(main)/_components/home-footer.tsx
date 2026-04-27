import Link from "next/link"
import { Text } from "@/shared/ui/text"

/**
 * 홈 푸터 — 모바일 앱(`HomeFooterWidget`) 와 동일한 구성을 좌측 정렬로 배치.
 * 브랜드 → 슬로건 → 정책 링크 → 사업자 정보 → © → 통신판매 중개자 면책 문구.
 */
export function HomeFooter() {
  return (
    <footer className="border-border bg-muted mt-8 border-t">
      <div className="mx-auto flex max-w-6xl flex-col px-5 py-10 md:px-10 md:py-12 lg:px-16">
        {/* 브랜드 */}
        <Text as="span" typography="subtitle2-bold" className="text-primary">
          쪽집게
        </Text>

        {/* 슬로건 */}
        <Text
          as="p"
          typography="caption1-medium"
          className="text-muted-foreground mt-3 leading-[1.7]"
        >
          전문 서비스 매칭 플랫폼
          <br />
          채팅이 곧 리뷰 · 전문가 수수료 0%
        </Text>

        {/* 구분선 */}
        <div className="bg-border mt-5 h-px w-full" />

        {/* 정책 링크 */}
        <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1">
          <Link href="/terms">
            <Text
              as="span"
              typography="caption1-medium"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              이용약관
            </Text>
          </Link>
          <Text
            as="span"
            typography="caption1-medium"
            className="text-neutral-300"
          >
            ·
          </Text>
          <Link href="/privacy">
            <Text
              as="span"
              typography="caption1-medium"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              개인정보처리방침
            </Text>
          </Link>
          <Text
            as="span"
            typography="caption1-medium"
            className="text-neutral-300"
          >
            ·
          </Text>
          {/* TODO: 고객센터(문의) 페이지 신설 후 href 연결. 모바일은 InquiryView 로 직접 이동. */}
          <button
            type="button"
            disabled
            className="text-muted-foreground/60 cursor-not-allowed"
          >
            <Text as="span" typography="caption1-medium">
              고객센터
            </Text>
          </button>
        </div>

        {/* 사업자 정보 */}
        <div className="text-neutral-400 mt-5 flex flex-col gap-1">
          <Text as="p" typography="caption2-medium">
            상호명: 쪽집게 | 대표자명: 신민석
          </Text>
          <Text as="p" typography="caption2-medium">
            사업자등록번호: 287-31-01764
          </Text>
          <Text as="p" typography="caption2-medium">
            유선번호: +8201083131764
          </Text>
          <Text as="p" typography="caption2-medium">
            통신판매업 신고번호: 2026-경기안산-0659
          </Text>
          <Text as="p" typography="caption2-medium">
            사업장 주소: 경기도 안산시 오목로11길5
          </Text>
          <Text as="p" typography="caption2-medium" className="mt-1">
            © 2026 쪽집게. All rights reserved.
          </Text>
        </div>

        {/* 구분선 */}
        <div className="bg-border mt-5 h-px w-full" />

        {/* 통신판매 중개자 면책 문구 */}
        <Text
          as="p"
          typography="caption2-medium"
          className="text-neutral-400 mt-4 leading-[1.7]"
        >
          쪽집게는 통신판매 중개자로서 통신판매의 당사자가 아니며, 회원 간
          거래 이행에 관여하지 않고 책임을 지지 않습니다. 거래에 대한 의무와
          책임은 판매 회원에게 있습니다.
        </Text>
      </div>
    </footer>
  )
}
