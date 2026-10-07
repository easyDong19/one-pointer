import { http, HttpResponse, type HttpResponseResolver, type PathParams } from "msw"
import { z } from "zod/v4"

/**
 * 앱의 응답 Zod 스키마(`successResponseSchema(X)`)에서 `data` 의 입력 타입을 꺼낸다.
 * 픽스처를 이 타입으로 작성하면 tsc 단계에서 1차 검증, 런타임 safeParse 로 2차 검증된다.
 */
export type EnvelopeData<S extends z.ZodType> = z.input<S> extends { data: infer D } ? D : never

type Method = "get" | "post" | "put" | "patch" | "delete"

type ResolverInfo = Parameters<HttpResponseResolver<PathParams>>[0]

/** 모든 엔드포인트는 origin 무관하게 path 로만 매칭한다 (SSR · CSR 공통). */
export function apiPath(path: string): string {
  return `*${path}`
}

export function envelope<T>(data: T, message = "OK") {
  return { success: true as const, message, data }
}

/**
 * 스키마 검증이 붙은 핸들러.
 * 응답이 앱 스키마와 어긋나면 서버 콘솔에 경고를 남긴다 — 앱에서는 parseSchemaOrThrow 가
 * 500 으로 터지므로, 캡처 전에 목업 쪽에서 먼저 잡기 위함.
 */
export function mock<S extends z.ZodType>(
  method: Method,
  path: string,
  schema: S,
  resolve: (info: ResolverInfo) => EnvelopeData<S> | Promise<EnvelopeData<S>>,
) {
  return http[method](apiPath(path), async (info) => {
    const body = envelope(await resolve(info))
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      console.warn(
        `[mock] schema mismatch ${method.toUpperCase()} ${path}\n${z.prettifyError(parsed.error)}`,
      )
    }
    return HttpResponse.json(body)
  })
}

/** 응답 본문을 쓰지 않는 mutation 용 (data: null). */
export function mockOk(method: Method, path: string, data: unknown = null) {
  return http[method](apiPath(path), () => HttpResponse.json(envelope(data)))
}

export function mockError(method: Method, path: string, status: number, message: string) {
  return http[method](apiPath(path), () =>
    HttpResponse.json({ success: false, message, data: null }, { status }),
  )
}
