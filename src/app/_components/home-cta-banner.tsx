import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { Text } from "@/shared/ui/text"

export function HomeCtaBanner() {
  return (
    <Link href="/tickets/new" className="group block">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary-hover transition-shadow group-hover:shadow-lg md:rounded-3xl">
        {/* 배경 장식 */}
        <div className="absolute top-0 right-0 h-full w-2/5 opacity-[0.08]">
          <div className="absolute top-6 right-6 h-16 w-16 rotate-12 rounded-xl border-2 border-white md:h-20 md:w-20" />
          <div className="absolute right-12 bottom-6 h-10 w-10 -rotate-6 rounded-lg border-2 border-white md:h-14 md:w-14" />
          <div className="absolute top-1/2 right-3 h-7 w-7 rotate-45 rounded border-2 border-white md:h-10 md:w-10" />
        </div>

        <div className="relative z-10 flex items-center justify-between gap-4 px-6 py-6 md:px-12 md:py-10 lg:px-16">
          <div className="flex flex-col gap-1 md:gap-2">
            <span className="w-fit rounded-full bg-white/15 px-3 py-0.5">
              <Text as="span" typography="caption2-medium" className="text-primary-foreground/80">
                의뢰 등록
              </Text>
            </span>
            <Text as="h2" typography="subtitle1-bold" className="mt-1 text-primary-foreground md:h3-bold">
              전문 서비스가 필요한
              <br className="md:hidden" />
              {" "}분야가있나요?
            </Text>
            <Text as="p" typography="body3-regular" className="text-primary-foreground/65 md:body2-regular">
              의뢰를 등록하면 전문가가 제안서를 보내드려요
            </Text>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15 transition-colors group-hover:bg-white/25 md:h-12 md:w-12">
            <ChevronRight className="h-5 w-5 text-primary-foreground md:h-6 md:w-6" />
          </div>
        </div>
      </section>
    </Link>
  )
}
