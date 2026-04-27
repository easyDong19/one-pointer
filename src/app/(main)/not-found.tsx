import Link from "next/link"
import { Button } from "@/shared/ui/button"
import { Text } from "@/shared/ui/text"

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4">
      <Text as="h1" typography="h1-bold" className="text-muted-foreground">
        404
      </Text>
      <Text as="p" typography="body2-regular" className="text-muted-foreground">
        페이지를 찾을 수 없습니다
      </Text>
      <Button asChild variant="outline">
        <Link href="/">홈으로 이동</Link>
      </Button>
    </div>
  )
}
