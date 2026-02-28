import type { ComponentPropsWithoutRef, ElementType } from "react"

export type TypographyToken =
  | "caption3-bold"
  | "caption2-medium"
  | "caption2-bold"
  | "caption1-medium"
  | "caption1-bold"
  | "body3-regular"
  | "body3-medium"
  | "body3-bold"
  | "body2-medium"
  | "body2-bold"
  | "body2-regular"
  | "body1-medium"
  | "body1-bold"
  | "body1-regular"
  | "subtitle2-medium"
  | "subtitle2-bold"
  | "subtitle1-bold"
  | "title-bold"
  | "h3-bold"
  | "h2-bold"
  | "h1-bold"
  | "h0-bold"

type Combine<T, K> = T & Omit<K, keyof T>

type CombineElementProps<T extends ElementType, K = unknown> = Combine<
  K,
  ComponentPropsWithoutRef<T>
>

export type OverridableProps<T extends ElementType, K = unknown> = {
  as?: T
} & CombineElementProps<T, K>

type TextBaseProps = {
  typography?: TypographyToken
}

export type TextProps<T extends ElementType> = OverridableProps<T, TextBaseProps>
