import { cn } from "@/shared/lib/utils"
import { Text } from "@/shared/ui/text"
import type { MainTab } from "../model/use-category-filter-reducer"

export function CategoryMainTabs({
  activeTab,
  onTabChange,
}: {
  activeTab: MainTab
  onTabChange: (tab: MainTab) => void
}) {
  return (
    <div className="border-border/50 border-b">
      <div className="mx-auto flex max-w-3xl lg:max-w-5xl">
        {(["tickets", "experts"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={cn(
              "relative flex-1 py-2.5 text-center transition-colors",
              activeTab === tab ? "text-primary" : "text-muted-foreground",
            )}
          >
            <Text as="span" typography="body2-bold">
              {tab === "tickets" ? "의뢰" : "전문가"}
            </Text>
            {activeTab === tab && (
              <span className="bg-primary absolute bottom-0 left-1/2 h-[2px] w-12 -translate-x-1/2 rounded-full" />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
