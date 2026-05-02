"use client"

import { FileText } from "lucide-react"

import { Text } from "@/shared/ui/text"
import { cn } from "@/shared/lib/utils"

type Props = {
  url: string
  fileName: string
  isMine: boolean
}

export function FileBubble({ url, fileName, isMine }: Props) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "flex max-w-[260px] items-center gap-2.5 rounded-2xl border px-3 py-2.5 transition-colors md:max-w-[320px]",
        isMine
          ? "bg-primary-light border-primary-light hover:bg-primary-light/80 rounded-br-sm"
          : "bg-muted border-muted hover:bg-muted/80 rounded-bl-sm",
      )}
    >
      <div className="bg-background flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
        <FileText className="text-muted-foreground h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <Text
          as="div"
          typography="caption1-medium"
          className="text-foreground truncate"
        >
          {fileName || "파일"}
        </Text>
        <Text
          as="div"
          typography="caption2-medium"
          className="text-muted-foreground"
        >
          탭하여 열기
        </Text>
      </div>
    </a>
  )
}
