# Delivery 도메인 데이터 상세

## 목차
1. [Delivery 엔티티](#1-delivery-엔티티)
2. [DeliveryAttachment 엔티티](#2-deliveryattachment-엔티티)

---

## 1. Delivery 엔티티

엔티티: `one_pointer.domain.delivery.entity.Delivery`
테이블: `delivery` (인덱스: `idx_delivery_ticket` on ticket_id, `idx_delivery_expert` on expert_id)

| 필드명 | 컬럼명 | 타입 | 필수 | 설명 |
|--------|--------|------|------|------|
| `id` | `delivery_id` | Long (PK, IDENTITY) | 자동 | 작업물 고유 식별자 |
| `ticketId` | `ticket_id` | Long | ✅ | 연결된 티켓 ID (Ticket PK, 다른 도메인) |
| `expertId` | `expert_id` | Long | ✅ | 전문가 사용자 ID (User PK, 다른 도메인) |
| `deliveryType` | `delivery_type` | `DeliveryType` | ✅ | 전달 유형 — SERVICE_COMPLETE / FILE_DELIVERY |
| `memo` | `memo` | Text (@Lob) | ✅ | 전문가 메모 (작업 내용, 레슨 요약 등) |
| `status` | `status` | `DeliveryStatus` | ✅ | 상태 — SUBMITTED / APPROVED / REVISION_REQUESTED (기본값: SUBMITTED) |
| `revisionCount` | `revision_count` | Integer | ✅ | 수정 요청 횟수 (기본값: 0) |
| `revisionMessage` | `revision_message` | Text (@Lob) | ⬜ | 의뢰인의 수정 요청 사유. 수정 요청 시 설정, 재제출 시 초기화 |
| `submittedAt` | `submitted_at` | LocalDateTime | ✅ | 제출/재제출 일시 |
| `approvedAt` | `approved_at` | LocalDateTime | ⬜ | 승인(완료 확인) 일시 |
| `createDateTime` | `create_date_time` | LocalDateTime | 자동 | 최초 생성일시 (BaseTimeEntity) |
| `modifiedDateTime` | `modified_date_time` | LocalDateTime | 자동 | 수정일시 (BaseTimeEntity) |

### 연관 엔티티
| 엔티티 | 필드명 | 관계 | 설명 |
|--------|--------|------|------|
| `DeliveryAttachment` | `attachments` | OneToMany (cascade ALL, orphanRemoval) | 첨부파일 목록 |

### 비즈니스 메서드
- `approve()` — 상태를 APPROVED로, approvedAt 기록
- `requestRevision(String message)` — 상태를 REVISION_REQUESTED로, 수정 사유 설정, revisionCount 증가
- `resubmit(String memo)` — 상태를 SUBMITTED로, 메모 갱신, revisionMessage 초기화, submittedAt 갱신
- `addAttachment(DeliveryAttachment)` — 첨부파일 추가

---

## 2. DeliveryAttachment 엔티티

엔티티: `one_pointer.domain.delivery.entity.DeliveryAttachment`
테이블: `delivery_attachment`

| 필드명 | 컬럼명 | 타입 | 필수 | 설명 |
|--------|--------|------|------|------|
| `id` | `delivery_attachment_id` | Long (PK, IDENTITY) | 자동 | 첨부파일 고유 식별자 |
| `delivery` | `delivery_id` (FK) | Delivery | ✅ | 소속 작업물 (ManyToOne LAZY) |
| `fileType` | `file_type` | `DeliveryFileType` | ✅ | 파일 유형 — IMAGE / VIDEO / FILE |
| `fileUrl` | `file_url` | String | ✅ | 업로드된 파일 URL |
| `originalFileName` | `original_file_name` | String | ✅ | 원본 파일명 (다운로드 시 표시용) |
| `fileSize` | `file_size` | Long | ⬜ | 파일 크기 (bytes) |
| `createDateTime` | `create_date_time` | LocalDateTime | 자동 | 업로드일시 (BaseTimeEntity) |
| `modifiedDateTime` | `modified_date_time` | LocalDateTime | 자동 | 수정일시 (BaseTimeEntity) |
