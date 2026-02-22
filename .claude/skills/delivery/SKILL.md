---
name: delivery
description: 작업물 전달 도메인 기획. 온라인 의뢰에서 전문가의 결과물/서비스 완료 보고, 의뢰인 승인/수정 요청 등. 작업물 제출 화면, 확인/수정요청 화면 등 Delivery 관련 프론트엔드 작업 시 참고. /delivery 로 호출.
---

# Delivery 도메인 (프론트엔드)

**온라인 의뢰 전용**. 전문가가 결과물을 전달하거나 서비스 완료를 보고. 오프라인 의뢰에는 해당 없음.

## Enum/상태값

```typescript
type DeliveryType = 'SERVICE_COMPLETE' | 'FILE_DELIVERY'
type DeliveryStatus = 'SUBMITTED' | 'APPROVED' | 'REVISION_REQUESTED'
type DeliveryFileType = 'IMAGE' | 'VIDEO' | 'FILE'
```

### 상태 전이 + UI 라벨

| 상태 | UI 라벨 (의뢰인) | UI 라벨 (전문가) | 전이 조건 |
|------|-----------------|-----------------|-----------|
| `SUBMITTED` | 결과물 확인 대기 | 의뢰인 확인 대기 중 | 전문가 제출/재제출 |
| `APPROVED` | 완료됨 | 승인 완료! | 의뢰인 확인 / 24시간 자동 승인 |
| `REVISION_REQUESTED` | 수정 요청 완료 | 수정 요청됨 | 의뢰인 수정 요청 (사유 필수) |

```
SUBMITTED → APPROVED (의뢰인 승인 / 24시간 자동)
          → REVISION_REQUESTED (의뢰인 수정 요청)
              → SUBMITTED (전문가 재제출)
              * 수정 횟수 제한: Agreement.maxRevisions (기본 2회)
```

### 전달 유형

| DeliveryType | 설명 | 예시 |
|--------------|------|------|
| `SERVICE_COMPLETE` | 서비스 완료 보고 | 화상 레슨 완료, 타로 상담 완료 |
| `FILE_DELIVERY` | 파일 전달 | 첨삭 결과 PDF, 디자인 피드백, 작곡 파일 |

## 데이터 모델

```typescript
interface Delivery {
  id: number
  ticketId: number
  expertId: number
  deliveryType: DeliveryType
  memo: string                  // 작업 내용/레슨 요약 (필수)
  status: DeliveryStatus        // 기본: SUBMITTED
  revisionCount: number         // 기본: 0
  revisionMessage?: string      // 의뢰인의 수정 요청 사유
  submittedAt: string           // 제출/재제출 일시
  approvedAt?: string           // 승인 일시
  attachments: DeliveryAttachment[]
}

interface DeliveryAttachment {
  id: number
  fileType: DeliveryFileType
  fileUrl: string
  originalFileName: string
  fileSize?: number             // bytes
}
```

## 워크플로

### 전문가 — 작업물 제출

```
1. 전달 유형 선택 (SERVICE_COMPLETE / FILE_DELIVERY)
2. 메모 작성 (작업 내용, 레슨 요약) — 필수
3. (FILE_DELIVERY) 첨부파일 업로드
4. 제출 → SUBMITTED
5. 의뢰인에게 알림
```

### 의뢰인 — 작업물 확인

```
알림 수신 → 결과물/보고 확인
  ├─ 승인 (APPROVED) → 거래 완료 (COMPLETED) → 정산 + 리뷰
  └─ 수정 요청 (REVISION_REQUESTED)
       → 사유 입력 (필수)
       → 마감일 자동 +3일 연장
       → 전문가에게 알림 → 재제출 → 다시 확인...

* 24시간 미확인 시 자동 APPROVED
```

## 수정 요청 정책

| 항목 | 내용 |
|------|------|
| 기본 수정 횟수 | `Agreement.maxRevisions` (기본: **2회**) |
| 수정 요청 시 마감일 | 자동 **+3일** 연장 |
| 초과 시 | 수정 요청 **불가** → 승인 또는 추가 협의 |
| 수정 요청 사유 | **필수** 입력 |
| 24시간 미확인 | **자동 승인** (APPROVED) |
| 재제출 시 | 메모 갱신, 수정 사유 초기화 |

## UI 구현 참고

### 전문가 화면
- 전달 유형 선택 (라디오)
- SERVICE_COMPLETE: 메모만
- FILE_DELIVERY: 메모 + 파일 업로드 (IMAGE/VIDEO/FILE)
- 수정 요청 시: 의뢰인 수정 사유 표시 + 재제출 UI

### 의뢰인 화면
- 작업물 상세 (메모 + 첨부파일 다운로드)
- 승인 / 수정 요청 버튼
- 수정 요청 시 사유 입력 모달
- 남은 수정 횟수: `{maxRevisions - revisionCount}회 남음`
- 초과 시 수정 요청 버튼 **비활성화**
- 자동 승인 카운트다운 표시 (**24시간**)

## 악용 방지 (프론트 UX 고려사항)

| 위험 | 대응 |
|------|------|
| 허위 작업물 제출 | 의뢰인 확인/수정요청 보장, 신고 |
| 과도한 수정 요청 (의뢰인 악용) | maxRevisions 제한, 비정상 패턴 모니터링 |
| 자동 승인 악용 (고의 미확인) | 24시간 전 리마인더 알림 |
| 악성 파일 업로드 | 파일 유형/크기 제한 |

## 알림

| 이벤트 | 수신자 | 메시지 |
|--------|--------|--------|
| 서비스 완료 보고 | 의뢰인 | "전문가가 서비스 완료를 보고했어요. 확인해주세요!" |
| 결과물 전달 | 의뢰인 | "전문가가 결과물을 전달했어요." |
| 완료 확인 | 전문가 | "의뢰인이 완료를 확인했어요!" |
| 수정 요청 | 전문가 | "의뢰인이 수정을 요청했어요." |
| 자동 확인 임박 (24h) | 의뢰인 | "내일 자동으로 완료 처리돼요. 확인해주세요." |

## 기능 체크리스트

### 전문가
- [ ] 서비스 완료 보고 (메모)
- [ ] 파일 전달 (첨부파일 + 메모)
- [ ] 수정 요청 후 재제출

### 의뢰인
- [ ] 작업물 확인 (상세 조회)
- [ ] 완료 승인 (APPROVED)
- [ ] 수정 요청 (사유 입력, maxRevisions 이내)
