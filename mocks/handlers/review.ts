import type { RequestHandler } from "msw"
import {
  notificationListResponseSchema,
  unreadCountResponseSchema,
} from "@/entities/notification/api/notification.schema"
import {
  filteringViewResponseSchema,
  myReviewListResponseSchema,
  myReviewSummaryResponseSchema,
  reviewDetailResponseSchema,
  reviewFeedListResponseSchema,
} from "@/entities/review/api/review.schema"
import { notifications, unreadNotificationCount } from "../fixtures/notification"
import {
  expertReviewFeed,
  filteringView,
  myReviewCards,
  myReviewSummary,
  reviewDetail,
} from "../fixtures/review"
import { mock, mockOk } from "../lib/respond"

/** 커서 페이지 — 픽스처가 한 페이지 분량이라 항상 hasNext=false */
const page = <T>(content: T[]) => ({ content, nextCursor: null, hasNext: false })

const reviewHandlers: RequestHandler[] = [
  // 고정 경로 먼저 (`/review/:reviewId` 보다 앞)
  mock("get", "/v1/api/review/my-summary", myReviewSummaryResponseSchema, () => myReviewSummary()),
  mock("get", "/v1/api/review/my-reviews", myReviewListResponseSchema, () => page(myReviewCards())),
  mock(
    "get",
    "/v1/api/review/expert/:expertProfileId",
    reviewFeedListResponseSchema,
    ({ params }) => page(expertReviewFeed(Number(params.expertProfileId))),
  ),
  mock("get", "/v1/api/review/:reviewId/filtering", filteringViewResponseSchema, ({ params }) =>
    filteringView(Number(params.reviewId)),
  ),
  mock("get", "/v1/api/review/:reviewId", reviewDetailResponseSchema, ({ params }) =>
    reviewDetail(Number(params.reviewId)),
  ),

  mockOk("post", "/v1/api/review/:reviewId/reply"),
  mockOk("post", "/v1/api/review/:reviewId/rating/late"),
  mockOk("post", "/v1/api/review/:reviewId/rating"),
  mockOk("post", "/v1/api/review/:reviewId/helpful"),
  mockOk("post", "/v1/api/review/:reviewId/filtering/complete"),
  mockOk("patch", "/v1/api/review/:reviewId/messages/:messageId/visibility"),
]

const notificationHandlers: RequestHandler[] = [
  mock("get", "/v1/api/notification/unread-count", unreadCountResponseSchema, () =>
    unreadNotificationCount(),
  ),
  mock("get", "/v1/api/notification", notificationListResponseSchema, () => page(notifications())),

  mockOk("patch", "/v1/api/notification/read-all"),
  mockOk("patch", "/v1/api/notification/:notificationId/read"),
  mockOk("delete", "/v1/api/notification/:notificationId"),
]

export const reviewGroupHandlers: RequestHandler[] = [...reviewHandlers, ...notificationHandlers]
