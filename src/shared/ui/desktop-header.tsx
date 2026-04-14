"use client"

import Link from "next/link"
import { cn } from "@/shared/lib/utils"
import { Text } from "@/shared/ui/text"

/* ─── Root ─────────────────────────────────────────────────────────────────── */

function DesktopHeaderRoot({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <header
      className={cn(
        "sticky top-0 z-50 hidden border-b border-border/50 bg-background/80 backdrop-blur-md md:block",
        className,
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3 md:px-10 lg:px-16">
        {children}
      </div>
    </header>
  )
}

/* ─── Logo ─────────────────────────────────────────────────────────────────── */

function Logo() {
  return (
    <Link href="/">
      <Text as="span" typography="subtitle1-bold" className="text-primary">
        쪽집게
      </Text>
    </Link>
  )
}

/* ─── Nav ──────────────────────────────────────────────────────────────────── */

function Nav({ children }: { children: React.ReactNode }) {
  return <nav className="flex items-center gap-8">{children}</nav>
}

/* ─── NavLink ─────────────────────────────────────────────────────────────── */

function NavLink({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  return (
    <Link href={href} className="transition-colors hover:text-primary">
      <Text
        as="span"
        typography="body3-medium"
        className="text-muted-foreground hover:text-primary"
      >
        {children}
      </Text>
    </Link>
  )
}

/* ─── Actions ─────────────────────────────────────────────────────────────── */

function Actions({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-3">{children}</div>
}

/* ─── Export ───────────────────────────────────────────────────────────────── */

export const DesktopHeader = Object.assign(DesktopHeaderRoot, {
  Logo,
  Nav,
  NavLink,
  Actions,
})
