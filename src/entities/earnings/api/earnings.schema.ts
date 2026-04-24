import { z } from "zod/v4"

// ─── Enums ───────────────────────────────────────────────────────────────────

export const earningsPeriodSchema = z.enum(["DAILY", "WEEKLY", "MONTHLY"])
export type EarningsPeriod = z.infer<typeof earningsPeriodSchema>

export const transactionStatusSchema = z.enum(["ALL", "SETTLED", "PENDING"])
export type TransactionStatus = z.infer<typeof transactionStatusSchema>

// ─── Sub-schemas ─────────────────────────────────────────────────────────────

/** EarningDataPoint */
export const earningsGraphPointSchema = z.object({
  label: z.string(),
  settledAmount: z.number(),
  pendingAmount: z.number(),
  transactionCount: z.number(),
})

/** BankAccountResponse */
export const bankAccountResponseSchema = z.object({
  bankCode: z.string(),
  accountNumber: z.string(),
  accountHolder: z.string(),
})

// ─── ExpertEarningsResponse ──────────────────────────────────────────────────

export const earningsSummarySchema = z.object({
  bankAccount: bankAccountResponseSchema.nullish(),
  totalNetEarnings: z.number(),
  settledAmount: z.number(),
  pendingAmount: z.number(),
  totalFee: z.number(),
  totalFees: z.number().nullish(),
  earningsGraph: z.array(earningsGraphPointSchema),
  period: z.string(),
  startDate: z.string(),
  endDate: z.string(),
})

export const earningsRequestSchema = z.object({
  period: earningsPeriodSchema,
  startDate: z.string(),
  endDate: z.string(),
})

export type EarningsRequest = z.infer<typeof earningsRequestSchema>
export type EarningsGraphPoint = z.infer<typeof earningsGraphPointSchema>
export type EarningsSummary = z.infer<typeof earningsSummarySchema>

// ─── Transactions ────────────────────────────────────────────────────────────

/** ExpertTransactionResponse */
export const transactionItemSchema = z.object({
  paymentId: z.number(),
  ticketTitle: z.string(),
  clientNickname: z.string(),
  originalAmount: z.number(),
  fee: z.number(),
  netAmount: z.number(),
  status: z.string(),
  paidAt: z.string(),
  confirmedAt: z.string().nullish(),
  settledAt: z.string().nullish(),
  estimatedSettlementDate: z.string().nullish(),
  // legacy FE fields (kept for backward compatibility)
  id: z.number().nullish(),
  ticketId: z.number().nullish(),
  amount: z.number().nullish(),
  createdAt: z.string().nullish(),
})

export const transactionsRequestSchema = z.object({
  cursor: z.string().optional(),
  status: transactionStatusSchema.optional(),
})

export type TransactionItem = z.infer<typeof transactionItemSchema>
export type TransactionsRequest = z.infer<typeof transactionsRequestSchema>

// ─── Response Schemas ─────────────────────────────────────────────────────────

const successResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    message: z.string(),
    data: dataSchema,
  })

export const earningsSummaryResponseSchema = successResponseSchema(earningsSummarySchema)

export const transactionsResponseSchema = successResponseSchema(
  z.object({
    content: z.array(transactionItemSchema),
    nextCursor: z.string().nullable(),
    hasNext: z.boolean(),
  }),
)

export type TransactionPageResponse = z.infer<typeof transactionsResponseSchema>["data"]
