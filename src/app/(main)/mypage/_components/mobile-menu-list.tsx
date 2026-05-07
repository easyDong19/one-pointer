"use client"

import Link from "next/link"
import { ChevronRight } from "lucide-react"

import { useSidebarMenus } from "@/features/mypage/model/use-sidebar-menus"
import { Text } from "@/shared/ui/text"

export function MobileMenuList() {
  const groups = useSidebarMenus()

  return (
    <div className="flex flex-col gap-4 md:hidden">
      {groups.map((group, gi) => (
        <div key={gi}>
          {group.title && (
            <Text
              typography="caption2-medium"
              className="text-muted-foreground mb-1.5 px-1"
            >
              {group.title}
            </Text>
          )}
          <div className="bg-card border-border overflow-hidden rounded-xl border shadow-sm">
            {group.items
              .filter((item) => item.href !== "/mypage")
              .map((item, ii) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="border-border flex items-center justify-between px-4 py-3.5 transition-colors hover:bg-muted [&:not(:last-child)]:border-b"
                >
                  <Text typography="body3-medium" className="text-foreground">
                    {item.label}
                  </Text>
                  <ChevronRight className="text-muted-foreground h-4 w-4" />
                </Link>
              ))}
          </div>
        </div>
      ))}
    </div>
  )
}
