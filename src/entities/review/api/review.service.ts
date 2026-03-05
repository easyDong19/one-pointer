import { clientFetch } from "@/shared/api/http/client-fetch"
import { parseSchemaOrThrow } from "@/shared/api/http/parse-schema"
import {
  submitRatingRequestSchema,
  createExpertReplyRequestSchema,
  toggleMessageVisibilityRequestSchema,
  reviewDetailResponseSchema,
  reviewListResponseSchema,
  myReviewSummaryResponseSchema,
  type SubmitRatingRequest,
  type CreateExpertReplyRequest,
  type ToggleMessageVisibilityRequest,
  type ReviewDetail,
  type ReviewSummary,
} from "./review.schema"

export type {
  SubmitRatingRequest,
  CreateExpertReplyRequest,
  ToggleMessageVisibilityRequest,
  ReviewDetail,
  ReviewSummary,
}


export async function createExpertReply(
  reviewId: number,
  input: CreateExpertReplyRequest,
): Promise<void> {
  const path = `/v1/api/review/${reviewId}/reply`
  const method = "POST"
  const payload = parseSchemaOrThrow(createExpertReplyRequestSchema, input, {
    path,
    method,
    message: "Invalid expert reply request payload",
  })
  await clientFetch<unknown, CreateExpertReplyRequest>({ path, method, body: payload })
}

export async function submitRating(
  reviewId: number,
  input: SubmitRatingRequest,
): Promise<void> {
  const path = `/v1/api/review/${reviewId}/rating`
  const method = "POST"
  const payload = parseSchemaOrThrow(submitRatingRequestSchema, input, {
    path,
    method,
    message: "Invalid submit rating request payload",
  })
  await clientFetch<unknown, SubmitRatingRequest>({ path, method, body: payload })
}

export async function submitLateRating(
  reviewId: number,
  input: SubmitRatingRequest,
): Promise<void> {
  const path = `/v1/api/review/${reviewId}/rating/late`
  const method = "POST"
  const payload = parseSchemaOrThrow(submitRatingRequestSchema, input, {
    path,
    method,
    message: "Invalid late rating request payload",
  })
  await clientFetch<unknown, SubmitRatingRequest>({ path, method, body: payload })
}

export async function toggleHelpful(reviewId: number): Promise<void> {
  const path = `/v1/api/review/${reviewId}/helpful`
  const method = "POST"
  await clientFetch<unknown>({ path, method })
}

export async function confirmFilteringComplete(reviewId: number): Promise<void> {
  const path = `/v1/api/review/${reviewId}/filtering/complete`
  const method = "POST"
  await clientFetch<unknown>({ path, method })
}

export async function toggleMessageVisibility(
  reviewId: number,
  messageId: number,
  input: ToggleMessageVisibilityRequest,
): Promise<void> {
  const path = `/v1/api/review/${reviewId}/messages/${messageId}/visibility`
  const method = "PATCH"
  const payload = parseSchemaOrThrow(toggleMessageVisibilityRequestSchema, input, {
    path,
    method,
    message: "Invalid toggle visibility request payload",
  })
  await clientFetch<unknown, ToggleMessageVisibilityRequest>({ path, method, body: payload })
}

export async function getReview(reviewId: number): Promise<ReviewDetail> {
  const path = `/v1/api/review/${reviewId}`
  const method = "GET"
  const response = await clientFetch<unknown>({ path, method })
  const parsed = parseSchemaOrThrow(reviewDetailResponseSchema, response, {
    path,
    method,
    message: "Invalid review detail response payload",
  })
  return parsed.data
}

export async function getFilteringReview(reviewId: number): Promise<ReviewDetail> {
  const path = `/v1/api/review/${reviewId}/filtering`
  const method = "GET"
  const response = await clientFetch<unknown>({ path, method })
  const parsed = parseSchemaOrThrow(reviewDetailResponseSchema, response, {
    path,
    method,
    message: "Invalid filtering review response payload",
  })
  return parsed.data
}

export async function getMyReviewSummary(): Promise<{
  averageRating: number | null
  reviewCount: number
}> {
  const path = "/v1/api/review/my-summary"
  const method = "GET"
  const response = await clientFetch<unknown>({ path, method })
  const parsed = parseSchemaOrThrow(myReviewSummaryResponseSchema, response, {
    path,
    method,
    message: "Invalid my review summary response payload",
  })
  return parsed.data
}

export async function getExpertReviews(
  expertProfileId: number,
  params?: { cursor?: string; size?: number },
): Promise<{ content: ReviewSummary[]; nextCursor: string | null; hasNext: boolean }> {
  const path = `/v1/api/review/expert/${expertProfileId}`
  const method = "GET"
  const response = await clientFetch<unknown>({ path, method, query: params })
  const parsed = parseSchemaOrThrow(reviewListResponseSchema, response, {
    path,
    method,
    message: "Invalid expert reviews response payload",
  })
  return parsed.data
}
