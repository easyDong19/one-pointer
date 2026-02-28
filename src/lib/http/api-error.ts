export type ApiErrorDetails = unknown

export type ApiErrorInit = {
  status: number
  message: string
  path: string
  method?: string
  details?: ApiErrorDetails
}

export class ApiError extends Error {
  readonly status: number
  readonly path: string
  readonly method?: string
  readonly details?: ApiErrorDetails

  constructor({ status, message, path, method, details }: ApiErrorInit) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.path = path
    this.method = method
    this.details = details
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}
