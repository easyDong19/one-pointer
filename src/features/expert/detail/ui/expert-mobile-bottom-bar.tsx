import { Text } from "@/shared/ui/text"
import { Button } from "@/shared/ui/button"

export function ExpertMobileBottomBar() {
  return (
    <div className="bg-background/80 border-border/50 fixed bottom-0 left-0 right-0 z-50 border-t px-4 pb-[env(safe-area-inset-bottom,0px)] pt-3 backdrop-blur-md lg:hidden">
      <div className="mx-auto max-w-3xl pb-3">
        <Button size="lg" className="w-full rounded-xl py-6">
          <Text as="span" typography="body1-bold">
            의뢰하기
          </Text>
        </Button>
      </div>
    </div>
  )
}
