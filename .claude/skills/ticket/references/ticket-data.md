# Ticket 도메인 데이터 상세

## 목차
1. [Ticket 엔티티](#1-ticket-엔티티)
2. [TicketDesiredDate 엔티티](#2-ticketdesireddate-엔티티)
3. [TicketAttachment 엔티티](#3-ticketattachment-엔티티)
4. [Proposal 엔티티](#4-proposal-엔티티)
5. [ProposalAvailableDate 엔티티](#5-proposalavailabledate-엔티티)
6. [Agreement 엔티티](#6-agreement-엔티티)

---

## 1. Ticket 엔티티

엔티티: `one_pointer.domain.ticket.entity.Ticket`
테이블: `ticket` (인덱스: `idx_ticket_client` on client_id, `idx_ticket_status` on status)

| 필드명 | 컬럼명 | 타입 | 필수 | 설명 |
|--------|--------|------|------|------|
| `id` | `ticket_id` | Long (PK, IDENTITY) | 자동 | 티켓 고유 식별자 |
| `clientId` | `client_id` | Long | ✅ | 의뢰인 User PK (도메인 간 PK 참조) |
| `ticketType` | `ticket_type` | `TicketType` | ✅ | 의뢰 유형 — OFFLINE / ONLINE |
| `title` | `title` | String(80) | ✅ | 의뢰 제목 |
| `content` | `content` | Text (@Lob) | ✅ | 의뢰 내용 (배우고/맡기고 싶은 것) |
| `level` | `level` | `LevelType` | ⬜ | 현재 수준 — BEGINNER / INTERMEDIATE / ADVANCED |
| `desiredDuration` | `desired_duration` | `DesiredDuration` | ✅ | 희망 시간 — THIRTY_MIN / ONE_HOUR / ONE_HALF_HOUR / TWO_HOUR / NEGOTIABLE |
| `budgetType` | `budget_type` | `BudgetType` | ✅ | 예산 유형 — RANGE / NEGOTIABLE |
| `budgetMin` | `budget_min` | Integer | ⬜ | 최소 예산 (RANGE일 때) |
| `budgetMax` | `budget_max` | Integer | ⬜ | 최대 예산 (RANGE일 때) |
| `region` | `region` | String | ⬜ | 오프라인 시 지역 (시/구 단위) |
| `locationDetail` | `location_detail` | String | ⬜ | 상세 장소 선호 (예: "강남역 근처") |
| `deadline` | `deadline` | LocalDateTime | 자동 | 모집 마감일 (공개 티켓: +7일, 직접 의뢰: +48시간) |
| `status` | `status` | `TicketStatus` | 자동 | 티켓 상태 (기본값: DRAFT) |
| `targetExpertId` | `target_expert_id` | Long | ⬜ | 직접 의뢰 대상 전문가 User PK. null이면 공개 티켓 |
| `sourceType` | `source_type` | `TicketSourceType` | ✅ | 티켓 생성 채널 — TICKET_FEED / DIRECT_REQUEST (기본값: TICKET_FEED) |
| `matchedExpertId` | `matched_expert_id` | Long | ⬜ | 매칭된 전문가 User PK (도메인 간 PK 참조) |
| `matchedProposal` | `matched_proposal_id` (FK) | Proposal | ⬜ | 매칭된 제안서 (ManyToOne, LAZY) |
| `matchedAt` | `matched_at` | LocalDateTime | ⬜ | 매칭 시점 |
| `createDateTime` | `create_date_time` | LocalDateTime | 자동 | 등록일시 (BaseTimeEntity) |
| `modifiedDateTime` | `modified_date_time` | LocalDateTime | 자동 | 수정일시 (BaseTimeEntity) |

연관 엔티티 (OneToMany, cascade ALL, orphanRemoval):
- `desiredDates` → TicketDesiredDate
- `attachments` → TicketAttachment

비즈니스 메서드: `open()` — status를 OPEN으로 변경

> 쿠폰(FK → Coupon), 태그(Array)는 해당 도메인 구현 시 추가 예정
> 카테고리는 `subCategoryId` 컬럼으로 직접 보유 (category skill 참고)

---

## 2. TicketDesiredDate 엔티티

엔티티: `one_pointer.domain.ticket.entity.TicketDesiredDate`
테이블: `ticket_desired_date`
관계: Ticket과 ManyToOne (LAZY)

| 필드명 | 컬럼명 | 타입 | 필수 | 설명 |
|--------|--------|------|------|------|
| `id` | `ticket_desired_date_id` | Long (PK, IDENTITY) | 자동 | 고유 식별자 |
| `ticket` | `ticket_id` (FK) | Ticket | ✅ | 소속 티켓 |
| `desiredDate` | `desired_date` | LocalDate | ✅ | 희망 날짜 |
| `timeSlot` | `time_slot` | String | ✅ | 시간대 — AM / PM |

---

## 3. TicketAttachment 엔티티

엔티티: `one_pointer.domain.ticket.entity.TicketAttachment`
테이블: `ticket_attachment`
관계: Ticket과 ManyToOne (LAZY)

| 필드명 | 컬럼명 | 타입 | 필수 | 설명 |
|--------|--------|------|------|------|
| `id` | `ticket_attachment_id` | Long (PK, IDENTITY) | 자동 | 고유 식별자 |
| `ticket` | `ticket_id` (FK) | Ticket | ✅ | 소속 티켓 |
| `fileUrl` | `file_url` | String | ✅ | 첨부 파일 URL |
| `fileName` | `file_name` | String | ⬜ | 원본 파일명 |

---

## 4. Proposal 엔티티

엔티티: `one_pointer.domain.ticket.entity.Proposal`
테이블: `proposal` (인덱스: `idx_proposal_ticket` on ticket_id, `idx_proposal_expert` on expert_id)

| 필드명 | 컬럼명 | 타입 | 필수 | 설명 |
|--------|--------|------|------|------|
| `id` | `proposal_id` | Long (PK, IDENTITY) | 자동 | 제안서 고유 식별자 |
| `ticket` | `ticket_id` (FK) | Ticket | ✅ | 대상 티켓 (ManyToOne, LAZY) |
| `expertId` | `expert_id` | Long | ✅ | 제안 전문가 User PK (도메인 간 PK 참조) |
| `price` | `price` | Integer | ✅ | 제안 금액 (온라인: 에스크로 결제 기준) |
| `proposedDuration` | `proposed_duration` | `DesiredDuration` | ✅ | 제안 시간 |
| `method` | `method` | `ActivityMethod` | ✅ | 진행 방식 — OFFLINE / ONLINE |
| `locationProposal` | `location_proposal` | String | ⬜ | 장소 제안 (오프라인 시) |
| `onlineTool` | `online_tool` | String | ⬜ | 온라인 도구 (예: "Zoom", "Google Meet") |
| `appeal` | `appeal` | Text (@Lob) | ✅ | 자기 어필 |
| `status` | `status` | `ProposalStatus` | 자동 | 제안서 상태 — PENDING / SELECTED / REJECTED / WITHDRAWN (기본값: PENDING) |
| `createDateTime` | `create_date_time` | LocalDateTime | 자동 | 제안일시 (BaseTimeEntity) |
| `modifiedDateTime` | `modified_date_time` | LocalDateTime | 자동 | 수정일시 (BaseTimeEntity) |

연관 엔티티: `availableDates` → ProposalAvailableDate (OneToMany, cascade ALL, orphanRemoval)

---

## 5. ProposalAvailableDate 엔티티

엔티티: `one_pointer.domain.ticket.entity.ProposalAvailableDate`
테이블: `proposal_available_date`
관계: Proposal과 ManyToOne (LAZY)

| 필드명 | 컬럼명 | 타입 | 필수 | 설명 |
|--------|--------|------|------|------|
| `id` | `proposal_available_date_id` | Long (PK, IDENTITY) | 자동 | 고유 식별자 |
| `proposal` | `proposal_id` (FK) | Proposal | ✅ | 소속 제안서 |
| `availableDate` | `available_date` | LocalDate | ✅ | 가능 날짜 |
| `timeSlot` | `time_slot` | String | ✅ | 시간대 — AM / PM |

---

## 6. Agreement 엔티티

엔티티: `one_pointer.domain.ticket.entity.Agreement`
테이블: `agreement` (인덱스: `idx_agreement_ticket` on ticket_id (unique), `idx_agreement_expert` on expert_id, `idx_agreement_client` on client_id)

| 필드명 | 컬럼명 | 타입 | 필수 | 설명 |
|--------|--------|------|------|------|
| `id` | `agreement_id` | Long (PK, IDENTITY) | 자동 | 합의서 고유 식별자 |
| `ticket` | `ticket_id` (FK, unique) | Ticket | ✅ | 대상 티켓 (OneToOne, LAZY) |
| `expertId` | `expert_id` | Long | ✅ | 전문가 User PK (도메인 간 PK 참조) |
| `clientId` | `client_id` | Long | ✅ | 의뢰인 User PK (도메인 간 PK 참조) |
| `finalPrice` | `final_price` | Integer | ✅ | 최종 합의 금액 (원) |
| `workDeadline` | `work_deadline` | LocalDateTime | ✅ | 작업 마감일 |
| `scope` | `scope` | Text (@Lob) | ⬜ | 합의된 작업 범위/조건 요약 |
| `maxRevisions` | `max_revisions` | Integer | ✅ | 최대 수정 요청 횟수 (기본값: 2) |
| `deliveryFormat` | `delivery_format` | String | ⬜ | 전달물 형식 (예: "PDF", "Zoom 녹화본") |
| `status` | `status` | `AgreementStatus` | 자동 | 합의서 상태 (기본값: PROPOSED) |
| `proposedBy` | `proposed_by` | Long | ✅ | 의뢰인 User PK (의뢰인만 제안 가능) |
| `proposedAt` | `proposed_at` | LocalDateTime | ✅ | 제안 시점 |
| `confirmedAt` | `confirmed_at` | LocalDateTime | ⬜ | 확정 시점 (CONFIRMED 시 기록) |
| `createDateTime` | `create_date_time` | LocalDateTime | 자동 | 등록일시 (BaseTimeEntity) |
| `modifiedDateTime` | `modified_date_time` | LocalDateTime | 자동 | 수정일시 (BaseTimeEntity) |

비즈니스 메서드:
- `confirm()` — status를 CONFIRMED로 변경 + confirmedAt 기록
- `reject()` — status를 REJECTED로 변경
