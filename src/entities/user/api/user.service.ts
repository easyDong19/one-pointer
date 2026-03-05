import { clientFetch } from "@/shared/api/http/client-fetch"
import { parseSchemaOrThrow } from "@/shared/api/http/parse-schema"
import {
  updateProfileRequestSchema,
  updateFcmTokenRequestSchema,
  deleteFcmTokenRequestSchema,
  expertRegisterRequestSchema,
  updateExpertProfileRequestSchema,
  addPortfolioRequestSchema,
  addCertificationRequestSchema,
  updateBankAccountRequestSchema,
  updateAvailabilityRequestSchema,
  updateNotificationRequestSchema,
  expertProfileDetailResponseSchema,
  expertProfileExistsResponseSchema,
  earningsSummaryResponseSchema,
  transactionsResponseSchema,
  expertDashboardResponseSchema,
  clientDashboardResponseSchema,
  type UpdateProfileRequest,
  type UpdateFcmTokenRequest,
  type DeleteFcmTokenRequest,
  type ExpertRegisterRequest,
  type UpdateExpertProfileRequest,
  type AddPortfolioRequest,
  type AddCertificationRequest,
  type UpdateBankAccountRequest,
  type UpdateAvailabilityRequest,
  type UpdateNotificationRequest,
  type ExpertProfileDetail,
  type EarningsSummary,
  type TransactionItem,
  type ExpertDashboard,
  type ClientDashboard,
} from "./user.schema"

export type {
  UpdateProfileRequest,
  UpdateFcmTokenRequest,
  DeleteFcmTokenRequest,
  ExpertRegisterRequest,
  UpdateExpertProfileRequest,
  AddPortfolioRequest,
  AddCertificationRequest,
  UpdateBankAccountRequest,
  UpdateAvailabilityRequest,
  UpdateNotificationRequest,
  ExpertProfileDetail,
  EarningsSummary,
  TransactionItem,
  ExpertDashboard,
  ClientDashboard,
}


// ─── Profile ──────────────────────────────────────────────────────────────────

export async function updateMyProfile(input: UpdateProfileRequest): Promise<void> {
  const path = "/v1/api/user/me"
  const method = "PUT"
  const payload = parseSchemaOrThrow(updateProfileRequestSchema, input, {
    path,
    method,
    message: "Invalid update profile request payload",
  })
  await clientFetch<unknown, UpdateProfileRequest>({ path, method, body: payload })
}

// ─── FCM Token ────────────────────────────────────────────────────────────────

export async function updateFcmToken(input: UpdateFcmTokenRequest): Promise<void> {
  const path = "/v1/api/user/fcm-token"
  const method = "PUT"
  const payload = parseSchemaOrThrow(updateFcmTokenRequestSchema, input, {
    path,
    method,
    message: "Invalid FCM token request payload",
  })
  await clientFetch<unknown, UpdateFcmTokenRequest>({ path, method, body: payload })
}

export async function deleteFcmToken(input: DeleteFcmTokenRequest): Promise<void> {
  const path = "/v1/api/user/fcm-token"
  const method = "DELETE"
  const payload = parseSchemaOrThrow(deleteFcmTokenRequestSchema, input, {
    path,
    method,
    message: "Invalid delete FCM token request payload",
  })
  await clientFetch<unknown, DeleteFcmTokenRequest>({ path, method, body: payload })
}

// ─── Expert Registration ──────────────────────────────────────────────────────

export async function registerExpert(input: ExpertRegisterRequest): Promise<void> {
  const path = "/v1/api/user/expert"
  const method = "POST"
  const payload = parseSchemaOrThrow(expertRegisterRequestSchema, input, {
    path,
    method,
    message: "Invalid expert register request payload",
  })
  await clientFetch<unknown, ExpertRegisterRequest>({ path, method, body: payload })
}

export async function updateExpertProfile(input: UpdateExpertProfileRequest): Promise<void> {
  const path = "/v1/api/user/expert"
  const method = "PUT"
  const payload = parseSchemaOrThrow(updateExpertProfileRequestSchema, input, {
    path,
    method,
    message: "Invalid update expert profile request payload",
  })
  await clientFetch<unknown, UpdateExpertProfileRequest>({ path, method, body: payload })
}

export async function getExpertProfile(id: number): Promise<ExpertProfileDetail> {
  const path = `/v1/api/user/expert/${id}`
  const method = "GET"
  const response = await clientFetch<unknown>({ path, method })
  const parsed = parseSchemaOrThrow(expertProfileDetailResponseSchema, response, {
    path,
    method,
    message: "Invalid expert profile response payload",
  })
  return parsed.data
}

export async function getMyExpertProfile(): Promise<ExpertProfileDetail> {
  const path = "/v1/api/user/expert/me"
  const method = "GET"
  const response = await clientFetch<unknown>({ path, method })
  const parsed = parseSchemaOrThrow(expertProfileDetailResponseSchema, response, {
    path,
    method,
    message: "Invalid my expert profile response payload",
  })
  return parsed.data
}

export async function checkExpertProfileExists(): Promise<boolean> {
  const path = "/v1/api/user/expert/exists"
  const method = "GET"
  const response = await clientFetch<unknown>({ path, method })
  const parsed = parseSchemaOrThrow(expertProfileExistsResponseSchema, response, {
    path,
    method,
    message: "Invalid expert exists response payload",
  })
  return parsed.data
}

// ─── Expert Earnings & Dashboard ─────────────────────────────────────────────

export async function getExpertEarnings(): Promise<EarningsSummary> {
  const path = "/v1/api/user/expert/earnings"
  const method = "GET"
  const response = await clientFetch<unknown>({ path, method })
  const parsed = parseSchemaOrThrow(earningsSummaryResponseSchema, response, {
    path,
    method,
    message: "Invalid earnings response payload",
  })
  return parsed.data
}

export async function getExpertTransactions(params?: {
  cursor?: string
  size?: number
}): Promise<{ content: TransactionItem[]; nextCursor: string | null; hasNext: boolean }> {
  const path = "/v1/api/user/expert/earnings/transactions"
  const method = "GET"
  const response = await clientFetch<unknown>({ path, method, query: params })
  const parsed = parseSchemaOrThrow(transactionsResponseSchema, response, {
    path,
    method,
    message: "Invalid transactions response payload",
  })
  return parsed.data
}

export async function getExpertDashboard(): Promise<ExpertDashboard> {
  const path = "/v1/api/user/expert/dashboard"
  const method = "GET"
  const response = await clientFetch<unknown>({ path, method })
  const parsed = parseSchemaOrThrow(expertDashboardResponseSchema, response, {
    path,
    method,
    message: "Invalid expert dashboard response payload",
  })
  return parsed.data
}

export async function getClientDashboard(): Promise<ClientDashboard> {
  const path = "/v1/api/user/client/dashboard"
  const method = "GET"
  const response = await clientFetch<unknown>({ path, method })
  const parsed = parseSchemaOrThrow(clientDashboardResponseSchema, response, {
    path,
    method,
    message: "Invalid client dashboard response payload",
  })
  return parsed.data
}

// ─── Portfolio ────────────────────────────────────────────────────────────────

export async function addPortfolio(input: AddPortfolioRequest): Promise<void> {
  const path = "/v1/api/user/expert/portfolios"
  const method = "POST"
  const payload = parseSchemaOrThrow(addPortfolioRequestSchema, input, {
    path,
    method,
    message: "Invalid add portfolio request payload",
  })
  await clientFetch<unknown, AddPortfolioRequest>({ path, method, body: payload })
}

export async function updatePortfolio(
  portfolioId: number,
  input: AddPortfolioRequest,
): Promise<void> {
  const path = `/v1/api/user/expert/portfolios/${portfolioId}`
  const method = "PUT"
  const payload = parseSchemaOrThrow(addPortfolioRequestSchema, input, {
    path,
    method,
    message: "Invalid update portfolio request payload",
  })
  await clientFetch<unknown, AddPortfolioRequest>({ path, method, body: payload })
}

export async function deletePortfolio(portfolioId: number): Promise<void> {
  const path = `/v1/api/user/expert/portfolios/${portfolioId}`
  const method = "DELETE"
  await clientFetch<unknown>({ path, method })
}

// ─── Certification ────────────────────────────────────────────────────────────

export async function addCertification(input: AddCertificationRequest): Promise<void> {
  const path = "/v1/api/user/expert/certifications"
  const method = "POST"
  const payload = parseSchemaOrThrow(addCertificationRequestSchema, input, {
    path,
    method,
    message: "Invalid add certification request payload",
  })
  await clientFetch<unknown, AddCertificationRequest>({ path, method, body: payload })
}

export async function updateCertification(
  certificationId: number,
  input: AddCertificationRequest,
): Promise<void> {
  const path = `/v1/api/user/expert/certifications/${certificationId}`
  const method = "PUT"
  const payload = parseSchemaOrThrow(addCertificationRequestSchema, input, {
    path,
    method,
    message: "Invalid update certification request payload",
  })
  await clientFetch<unknown, AddCertificationRequest>({ path, method, body: payload })
}

export async function deleteCertification(certificationId: number): Promise<void> {
  const path = `/v1/api/user/expert/certifications/${certificationId}`
  const method = "DELETE"
  await clientFetch<unknown>({ path, method })
}

// ─── Bank Account & Availability ──────────────────────────────────────────────

export async function updateBankAccount(input: UpdateBankAccountRequest): Promise<void> {
  const path = "/v1/api/user/expert/bank-account"
  const method = "PUT"
  const payload = parseSchemaOrThrow(updateBankAccountRequestSchema, input, {
    path,
    method,
    message: "Invalid update bank account request payload",
  })
  await clientFetch<unknown, UpdateBankAccountRequest>({ path, method, body: payload })
}

export async function updateAvailability(input: UpdateAvailabilityRequest): Promise<void> {
  const path = "/v1/api/user/expert/availability"
  const method = "PUT"
  const payload = parseSchemaOrThrow(updateAvailabilityRequestSchema, input, {
    path,
    method,
    message: "Invalid update availability request payload",
  })
  await clientFetch<unknown, UpdateAvailabilityRequest>({ path, method, body: payload })
}

// ─── Notification Settings ────────────────────────────────────────────────────

export async function updateNotificationSetting(
  input: UpdateNotificationRequest,
): Promise<void> {
  const path = "/v1/api/user/notification"
  const method = "PATCH"
  const payload = parseSchemaOrThrow(updateNotificationRequestSchema, input, {
    path,
    method,
    message: "Invalid update notification request payload",
  })
  await clientFetch<unknown, UpdateNotificationRequest>({ path, method, body: payload })
}
