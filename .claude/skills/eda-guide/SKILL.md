---
name: eda-guide
description: 원포인트 도메인 간 상태 전이 흐름 가이드. 매칭 플로우(쿠폰 예약→티켓 등록→제안서→매칭→채팅방 생성), 온라인 의뢰 플로우(합의서→결제→작업→전달→정산), 취소/만료 플로우 등 도메인 간 연쇄 동작을 파악할 때 사용. /eda-guide 로 호출.
---

# 도메인 간 상태 전이 흐름

프론트엔드에서 각 화면/액션이 백엔드에서 어떤 연쇄 동작을 일으키는지 이해하기 위한 가이드.
**캐시 무효화**, **화면 전환**, **낙관적 업데이트** 설계 시 참고한다.

## 매칭 플로우 (공통)

```
[의뢰인] 쿠폰 구매/발급
  → Coupon AVAILABLE

[의뢰인] 티켓 등록 (POST /v1/api/ticket)
  → Coupon RESERVED + Ticket OPEN
  → 무효화: couponKeys, ticketKeys

[전문가] 제안서 발송 (POST /v1/api/proposal)
  → Proposal PENDING + Ticket IN_REVIEW
  → 무효화: proposalKeys, ticketKeys

[의뢰인] 제안서 수락 (POST /v1/api/ticket/proposal/{id}/accept)
  → Proposal SELECTED + Ticket MATCHED
  → 미채택 Proposal REJECTED
  → Coupon CONSUMED
  → ChatRoom 자동 생성
  → 무효화: proposalKeys, ticketKeys, couponKeys, chatKeys
  → 화면 전환: 채팅방으로 이동
```

## 오프라인 의뢰 플로우

```
MATCHED → IN_PROGRESS (서버 자동 전이)
  → 채팅 협의 (합의서 없음)
  → [의뢰인] 거래 완료 (POST /v1/api/ticket/{id}/complete)
    → Ticket COMPLETED
    → Review 자동 생성 (SNAPSHOT_CREATED → FILTERING)
    → 무효화: ticketKeys, reviewKeys
```

## 온라인 의뢰 플로우

```
MATCHED → 채팅 협의

[의뢰인] 합의서 제안 (POST /v1/api/agreement)
  → Agreement PROPOSED
  → 무효화: agreementKeys

[전문가] 합의서 수락 (POST /v1/api/agreement/{id}/confirm)
  → Agreement CONFIRMED
  → Ticket PAYMENT_PENDING (서버 자동)
  → 무효화: agreementKeys, ticketKeys

[의뢰인] 에스크로 결제 (PortOne SDK → POST /v1/api/payment/escrow)
  → EscrowPayment ESCROW_HELD
  → Ticket PAID → IN_PROGRESS (서버 자동)
  → 무효화: paymentKeys, ticketKeys

[전문가] 작업물 전달 (POST /v1/api/delivery)
  → Delivery SUBMITTED + Ticket DELIVERED
  → 무효화: deliveryKeys, ticketKeys

[의뢰인] 작업물 승인 (POST /v1/api/delivery/{id}/approve)
  → Delivery APPROVED + Ticket COMPLETED
  → EscrowPayment CONFIRMED (서버 자동)
  → Review 자동 생성
  → 무효화: deliveryKeys, ticketKeys, paymentKeys, reviewKeys

[의뢰인] 수정 요청 (POST /v1/api/delivery/{id}/revision)
  → Delivery REVISION_REQUESTED
  → Agreement.workDeadline 자동 +3일
  → 무효화: deliveryKeys, agreementKeys
```

## 취소/만료 플로우

```
[의뢰인] 티켓 취소 (POST /v1/api/ticket/{id}/cancel)
  → Ticket CANCELLED + Coupon RETURNED
  → 무효화: ticketKeys, couponKeys

[시스템] 마감일 초과 자동 만료
  → Ticket EXPIRED + Coupon RETURNED
  → (폴링/알림으로 감지)
```

## 리뷰 플로우

```
Ticket COMPLETED
  → Review SNAPSHOT_CREATED → FILTERING (48시간)
  → [의뢰인/전문가] 메시지 비공개 토글
  → [의뢰인] 별점 입력 (선택)
  → 48시간 후 자동 PUBLISHED
  → [전문가] 답변 작성 (1회, 30일 이내)
  → 무효화: reviewKeys
```

## 프론트엔드 활용

### 캐시 무효화 전략

mutation의 `onSuccess`에서 관련 도메인의 query key를 invalidate:

```tsx
const mutation = useMutation({
  mutationFn: acceptProposal,
  onSuccess: () => {
    // 매칭 확정 → 영향 받는 모든 도메인 무효화
    queryClient.invalidateQueries({ queryKey: proposalKeys.all })
    queryClient.invalidateQueries({ queryKey: ticketKeys.all })
    queryClient.invalidateQueries({ queryKey: couponKeys.all })
    queryClient.invalidateQueries({ queryKey: chatKeys.all })
    router.push(`/chat/${chatRoomId}`)
  },
})
```

### 화면 전환 가이드

| 액션 | 전환 대상 | 방식 |
|------|-----------|------|
| 제안서 수락 | 채팅방 | `router.push` |
| 합의서 확정 | 결제 화면 | `router.push` |
| 결제 완료 | 티켓 상세 | `router.replace` |
| 작업물 승인 | 리뷰 필터링 | `router.push` |
| 티켓 등록 | 티켓 상세 | `router.replace` (뒤로가기 시 홈) |
