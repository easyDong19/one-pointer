---
name: fe-delivery
description: 프론트엔드 작업물 전달(Delivery) 도메인 가이드. 온라인 의뢰에서 전문가의 작업물 제출, 의뢰인의 승인/수정 요청, 자동 승인 등 Delivery 관련 프론트엔드 구현 시 참고한다.
---

# Delivery 프론트엔드 가이드

## 개요

**온라인 의뢰 전용**. 전문가가 작업물을 전달하고 의뢰인이 확인하는 프로세스.
오프라인 의뢰에는 해당 없음 (대면 서비스이므로 별도 전달 불필요).

## 전달 유형

| 유형 | 설명 | 예시 |
|------|------|------|
| `SERVICE_COMPLETE` | 서비스 완료 보고 | 화상 레슨/코칭 완료 |
| `FILE_DELIVERY` | 파일 전달 | 첨삭 결과, 디자인 파일, 영상 |

## 상태 흐름

```
SUBMITTED (전문가 제출)
  ├── APPROVED (의뢰인 승인) → COMPLETED + 에스크로 정산
  └── REVISION_REQUESTED (의뢰인 수정 요청)
        └── SUBMITTED (전문가 재제출) → 반복
            ※ 수정 횟수 제한: Agreement.maxRevisions (기본 2회)
            ※ 수정 요청 시 마감일 자동 +3일 연장
```

- 의뢰인이 24시간 내 미확인 시 **자동 APPROVED**
- 자동 승인 4시간 전 리마인더 알림

---

## TypeScript 타입 정의

```typescript
// ========== Enums ==========

type DeliveryType = 'SERVICE_COMPLETE' | 'FILE_DELIVERY';
type DeliveryStatus = 'SUBMITTED' | 'APPROVED' | 'REVISION_REQUESTED';
type DeliveryFileType = 'IMAGE' | 'VIDEO' | 'FILE';

// ========== Request ==========

interface SubmitDeliveryRequest {
  ticketId: number;
  deliveryType: DeliveryType;
  memo: string;
  attachments?: AttachmentInput[];  // FILE_DELIVERY 시
}

interface AttachmentInput {
  fileType: DeliveryFileType;
  fileUrl: string;             // S3 업로드 후 URL
  originalFileName: string;
  fileSize: number;            // bytes
}

interface RequestRevisionRequest {
  reason: string;              // 수정 요청 사유 (필수)
}

// ========== Response ==========

interface DeliveryResponse {
  id: number;
  ticketId: number;
  expertId: number;
  deliveryType: DeliveryType;
  status: DeliveryStatus;
  memo: string;
  attachments: AttachmentResponse[];
  maxRevisions: number;        // 최대 수정 횟수
  remainingRevisions: number;  // 남은 수정 횟수
  workDeadline: string;        // 작업 마감일 (수정 요청 시 갱신)
  submittedAt: string;
  approvedAt: string | null;
  createdAt: string;
}

interface AttachmentResponse {
  id: number;
  fileType: DeliveryFileType;
  fileUrl: string;
  originalFileName: string;
  fileSize: number;
}
```

---

## API 엔드포인트

| Method | URL | 설명 | 인증 | 역할 |
|--------|-----|------|------|------|
| POST | `/v1/api/delivery` | 작업물 전달 | JWT | 전문가 |
| GET | `/v1/api/delivery/ticket/{ticketId}` | 작업물 조회 | JWT | 양쪽 |
| POST | `/v1/api/delivery/{id}/resubmit` | 작업물 재전달 | JWT | 전문가 |
| PATCH | `/v1/api/delivery/{id}/approve` | 작업물 승인 | JWT | 의뢰인 |
| PATCH | `/v1/api/delivery/{id}/revision` | 수정 요청 | JWT | 의뢰인 |

---

## 에러 코드

| 코드 | 설명 | UI 처리 |
|------|------|---------|
| 40030 | IN_PROGRESS가 아닌 티켓 | "서비스 진행 중 상태에서만 전달 가능합니다" |
| 40031 | 이미 작업물 존재 | "이미 작업물이 전달되었습니다" |
| 40032 | 수정 횟수 초과 | "수정 가능 횟수를 초과했습니다" |
| 40033 | SUBMITTED가 아닌 작업물 | "제출된 작업물만 승인/수정 요청할 수 있습니다" |

---

## 프론트엔드 구현 가이드

### 페이지 구조 (추천)

```
/delivery
├── /submit?ticketId=         # 작업물 전달 폼 (전문가)
└── /[id]                     # 작업물 상세 (의뢰인 확인용)
    ├── 승인 버튼
    ├── 수정 요청 버튼
    └── 첨부파일 다운로드
```

### 전문가: 작업물 전달 흐름

```
1. 채팅방에서 "작업물 전달하기" 버튼 클릭
2. 전달 유형 선택
   - SERVICE_COMPLETE: 메모만 작성 (화상 레슨 완료 보고)
   - FILE_DELIVERY: 파일 업로드 + 메모
3. POST /v1/api/delivery
4. 채팅에 시스템 메시지 자동 생성
5. 의뢰인에게 알림
```

### 의뢰인: 작업물 확인 흐름

```
1. 알림 수신 → 작업물 상세 페이지 이동
2. 파일 다운로드 / 내용 확인
3. 선택:
   ├── "승인" → PATCH /v1/api/delivery/{id}/approve
   │   → 거래 완료(COMPLETED) + 에스크로 정산
   │
   └── "수정 요청" → PATCH /v1/api/delivery/{id}/revision
       → 사유 입력 (필수)
       → 마감일 자동 +3일 연장
       → 전문가에게 알림
       ※ remainingRevisions 확인 후 0이면 버튼 비활성화
```

### 수정 횟수 표시

```typescript
function DeliveryActions({ delivery }: { delivery: DeliveryResponse }) {
  const canRequestRevision = delivery.remainingRevisions > 0;

  return (
    <div>
      <p>수정 가능 횟수: {delivery.remainingRevisions}/{delivery.maxRevisions}</p>
      <Button onClick={handleApprove}>승인</Button>
      <Button
        onClick={handleRevision}
        disabled={!canRequestRevision}
      >
        수정 요청
        {!canRequestRevision && ' (횟수 초과)'}
      </Button>
    </div>
  );
}
```

### 자동 승인 타이머

```typescript
// 작업물 제출 후 24시간 내 미확인 시 자동 승인
function AutoApproveTimer({ submittedAt }: { submittedAt: string }) {
  const autoApproveAt = new Date(submittedAt);
  autoApproveAt.setHours(autoApproveAt.getHours() + 24);

  const remaining = autoApproveAt.getTime() - Date.now();

  if (remaining <= 0) return <span>자동 승인됨</span>;

  const hours = Math.floor(remaining / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

  return (
    <span>
      {hours}시간 {minutes}분 후 자동 승인
    </span>
  );
}
```

### 파일 업로드 (첨부파일)

```typescript
// S3 presigned URL로 파일 업로드 후 URL을 attachments에 추가
async function uploadAndSubmitDelivery(
  ticketId: number,
  files: File[],
  memo: string,
) {
  const attachments = await Promise.all(
    files.map(async (file) => {
      const fileUrl = await uploadFile(file); // S3 업로드
      return {
        fileType: getFileType(file), // IMAGE / VIDEO / FILE
        fileUrl,
        originalFileName: file.name,
        fileSize: file.size,
      };
    })
  );

  return api.post('/v1/api/delivery', {
    ticketId,
    deliveryType: files.length > 0 ? 'FILE_DELIVERY' : 'SERVICE_COMPLETE',
    memo,
    attachments,
  });
}

function getFileType(file: File): DeliveryFileType {
  if (file.type.startsWith('image/')) return 'IMAGE';
  if (file.type.startsWith('video/')) return 'VIDEO';
  return 'FILE';
}
```

### 중요 비즈니스 룰

1. **온라인 의뢰 전용**: 오프라인 의뢰에서는 작업물 전달 UI 미표시
2. **24시간 자동 승인**: 의뢰인이 확인하지 않으면 자동 승인 → 에스크로 정산
3. **수정 횟수 제한**: `maxRevisions` 초과 시 수정 요청 불가
4. **마감일 연장**: 수정 요청마다 마감일 +3일 자동 연장
5. **승인 = 거래 완료**: 승인 시 티켓 COMPLETED + 에스크로 정산 트리거
