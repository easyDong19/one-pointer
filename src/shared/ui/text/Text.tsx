/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { forwardRef, type ElementType, type JSX, type Ref } from "react"
import { cn } from "@/shared/lib/utils"
import { TYPOGRAPHY_CLASS_MAP } from "./Text.const"
import type { TextProps } from "./Text.types"

function TextInner<T extends ElementType = "span">(
  { typography = "body1-medium", as, className, ...props }: TextProps<T>,
  ref: Ref<any>,
) {
  const Component = (as ?? "span") as ElementType
  const typoClass = TYPOGRAPHY_CLASS_MAP[typography]

  return <Component ref={ref} className={cn(typoClass, className)} {...props} />
}

const Text = forwardRef(TextInner) as <T extends ElementType = "span">(
  props: TextProps<T> & { ref?: Ref<any> },
) => JSX.Element

export default Text
