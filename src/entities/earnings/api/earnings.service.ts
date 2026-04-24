import { clientFetch } from "@/shared/api/http/client-fetch"
import { parseSchemaOrThrow } from "@/shared/api/http/parse-schema"
import {
  earningsSummaryResponseSchema,
  transactionsResponseSchema,
  type EarningsRequest,
  type EarningsSummary,
  type TransactionItem,
  type TransactionsRequest,
} from "./earnings.schema"

export type { EarningsRequest, EarningsSummary, TransactionItem, TransactionsRequest }

export async function getExpertEarnings(params?: EarningsRequest): Promise<EarningsSummary> {
  const path = "/v1/api/user/expert/earnings"
  const method = "GET"
  const response = await clientFetch<unknown>({ path, method, query: params })
  const parsed = parseSchemaOrThrow(earningsSummaryResponseSchema, response, {
    path,
    method,
    message: "Invalid earnings response payload",
  })
  return parsed.data
}

export async function getExpertTransactions(params?: TransactionsRequest): Promise<{
  content: TransactionItem[]
  nextCursor: string | null
  hasNext: boolean
}> {
  const path = "/v1/api/user/expert/earnings/transactions"
  const method = "GET"
  const query: Record<string, string> = {}
  if (params?.cursor) query.cursor = params.cursor
  if (params?.status && params.status !== "ALL") query.status = params.status
  const response = await clientFetch<unknown>({ path, method, query })
  const parsed = parseSchemaOrThrow(transactionsResponseSchema, response, {
    path,
    method,
    message: "Invalid transactions response payload",
  })
  return parsed.data
}
