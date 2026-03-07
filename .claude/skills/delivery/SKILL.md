---
name: delivery
description: 작업물 전달 도메인 프론트엔드 구현 가이드. 온라인 의뢰에서 전문가가 결과물/서비스 완료를 보고하는 Delivery 도메인 관련 작업 시 사용. /delivery 로 호출하거나 작업물·첨부파일 UI를 다룰 때 참고한다.
---

# Delivery 도메인

온라인 의뢰에서 전문가가 결과물을 전달하거나 서비스 완료를 보고하는 도메인. 오프라인 의뢰에는 해당 없음.
**합의서(Agreement) 확정 → 결제 완료 후** 전문가가 작업물을 전달한다.

## 적용 범위

| 의뢰 유형 | Delivery 필요 | 비고 |
|-----------|:------------:|------|
| 오프라인 | ❌ | 대면 서비스, 별도 전달 불필요 |
| 온라인 | ✅ | 화상 레슨 완료 보고 또는 파일 전달 |

## 전달 유형 (DeliveryType)

| 유형 | 설명 | 예시 |
|------|------|------|
| `SERVICE_COMPLETE` | 서비스 완료 보고 | 화상 레슨/코칭 완료 |
| `FILE_DELIVERY` | 파일 전달 | 첨삭 결과, 디자인 피드백, 작곡 파일 |

## 작업물 상태 (DeliveryStatus)

```
SUBMITTED (전문가 제출)
  → APPROVED (의뢰인 확인/승인)
  → REVISION_REQUESTED (의뢰인 수정 요청)
      → SUBMITTED (전문가 재제출)
      * 수정 횟수 제한: Agreement.maxRevisions (기본 2회)
```

- 의뢰인이 24시간 내 미확인 시 자동 APPROVED 처리

## 수정 횟수 제한 정책

| 항목 | 내용 |
|------|------|
| 기본 수정 횟수 | Agreement.maxRevisions (기본값: 2회) |
| 수정 요청 시 마감일 | 자동 +3일 연장 |
| 초과 수정 | 추가 협의 필요 (추가 결제 또는 현재 상태 승인) |
| 수정 횟수 추적 | Delivery 재제출 횟수로 카운트 |

## Enum 정의

| Enum | 값 |
|------|-----|
| `DeliveryType` | `SERVICE_COMPLETE`, `FILE_DELIVERY` |
| `DeliveryStatus` | `SUBMITTED`, `APPROVED`, `REVISION_REQUESTED` |
| `DeliveryFileType` | `IMAGE`, `VIDEO`, `FILE` |

## API 엔드포인트

| Method | URL | 설명 | 인증 |
|--------|-----|------|------|
| POST | `/v1/api/delivery` | [전문가] 작업물 전달 | JWT |
| POST | `/v1/api/delivery/{deliveryId}/approve` | [의뢰인] 작업물 승인 (거래 완료) | JWT |
| POST | `/v1/api/delivery/{deliveryId}/revision` | [의뢰인] 수정 요청 | JWT |
| POST | `/v1/api/delivery/{deliveryId}/resubmit` | [전문가] 수정된 작업물 재전달 | JWT |
| GET | `/v1/api/delivery/ticket/{ticketId}` | [공통] 티켓별 작업물 상세 조회 (합의서 정보 포함) | JWT |

## 알림

| 이벤트 | 수신자 | 메시지 |
|--------|--------|--------|
| 서비스 완료 보고 | 의뢰인 | "전문가가 서비스 완료를 보고했어요. 확인해주세요!" |
| 결과물 전달 | 의뢰인 | "전문가가 결과물을 전달했어요." |
| 완료 확인 | 전문가 | "의뢰인이 완료를 확인했어요!" |
| 수정 요청 | 전문가 | "의뢰인이 수정을 요청했어요." |
| 자동 확인 임박 (24h) | 의뢰인 | "내일 자동으로 완료 처리돼요. 확인해주세요." |

## 프론트엔드 구현 가이드

### FSD 파일 구조

```
src/
├── entities/delivery/
│   ├── api/
│   │   ├── delivery.schema.ts          # zod v4 스키마
│   │   └── delivery.service.ts         # Service Layer (clientFetch + zod 검증)
│   └── model/
│       └── delivery.query-keys.ts      # TanStack Query 키 팩토리
├── features/delivery/
│   ├── submit-delivery/                # [전문가] 작업물 전달
│   │   ├── model/use-submit-delivery.ts
│   │   └── ui/submit-delivery-form.tsx
│   ├── approve-delivery/              # [의뢰인] 작업물 승인
│   │   ├── model/use-approve-delivery.ts
│   │   └── ui/approve-button.tsx
│   ├── request-revision/              # [의뢰인] 수정 요청
│   │   ├── model/use-request-revision.ts
│   │   └── ui/revision-form.tsx
│   └── resubmit-delivery/            # [전문가] 작업물 재전달
│       ├── model/use-resubmit-delivery.ts
│       └── ui/resubmit-form.tsx
```

### Service 함수

| 함수 | 설명 | API |
|------|------|-----|
| `submitDelivery(input)` | 작업물 전달 (전문가) | POST `/v1/api/delivery` |
| `approveDelivery(deliveryId)` | 작업물 승인 (의뢰인) | POST `/v1/api/delivery/{id}/approve` |
| `requestRevision(deliveryId, input)` | 수정 요청 (의뢰인) | POST `/v1/api/delivery/{id}/revision` |
| `resubmitDelivery(deliveryId, input)` | 작업물 재전달 (전문가) | POST `/v1/api/delivery/{id}/resubmit` |
| `getDeliveryByTicket(ticketId)` | 티켓별 작업물 조회 | GET `/v1/api/delivery/ticket/{ticketId}` |

### Mutation 캐시 무효화 패턴

```typescript
const mutation = useMutation({
  mutationFn: approveDelivery,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: deliveryKeys.byTicket(ticketId) })
    queryClient.invalidateQueries({ queryKey: ticketKeys.detail(ticketId) })
    // 승인 시 ticket도 COMPLETED로 전이되므로 함께 무효화
  },
})
```

### UI 구현 시 고려사항

#### 역할별 UI 분기
- **전문가**: 작업물 전달 폼 (SERVICE_COMPLETE / FILE_DELIVERY 선택), 재전달 폼
- **의뢰인**: 작업물 확인 화면, 승인 버튼, 수정 요청 폼

#### 상태별 UI 렌더링
- `SUBMITTED`: 의뢰인에게 승인/수정 요청 버튼, 전문가에게 "확인 대기 중"
- `APPROVED`: 양쪽 모두 "완료" 상태
- `REVISION_REQUESTED`: 전문가에게 재전달 폼, `remainingRevisions`로 남은 횟수 안내

#### 수정 횟수 UI
- `remainingRevisions === 0`이면 수정 요청 버튼 비활성화
- "수정 요청 N/M회" 형태로 진행 상황 표시

## 데이터 상세

- **[delivery-data.md](references/delivery-data.md)** — Delivery, DeliveryAttachment 필드 상세
- **[matching-flow.md](references/matching-flow.md)** — 매칭 플로우 엔티티 상태 전이 상세

## 기능 체크리스트

### 전문가
- [x] 서비스 완료 보고 (SERVICE_COMPLETE + 메모)
- [x] 파일 전달 (FILE_DELIVERY + 첨부파일 + 메모)
- [x] 수정 요청 후 재제출

### 의뢰인
- [x] 작업물 확인 (상세 조회)
- [x] 완료 승인 (APPROVED)
- [x] 수정 요청 (REVISION_REQUESTED + 사유, maxRevisions 이내만 가능)

### 시스템
- [x] 24시간 미확인 시 자동 승인
- [x] 자동 승인 임박(24h 전) 알림
- [x] 수정 요청 시 마감일 자동 +3일 연장
- [x] 수정 횟수 초과 시 수정 요청 차단
