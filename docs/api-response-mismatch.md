# API 응답 Swagger 명세 불일치 리포트

> **작성일:** 2026-03-10
> **작성자:** FE
> **상태:** 수정 요청

---

## 요약

Swagger 명세 기준으로 프론트엔드 스키마 검증(zod)을 적용했으나, 실제 API 응답에 nullable 필드가 명세에 반영되지 않아 파싱 에러가 발생하고 있습니다.

---

## 1. `GET /v1/api/ticket/popular`

### 불일치 필드

| 필드 | Swagger 명세 | 실제 응답 | 발생 조건 |
|---|---|---|---|
| `region` | `string` (non-nullable) | `null` | `ticketType`이 `ONLINE`일 때 |
| `locationDetail` | `string` (non-nullable) | `null` | `ticketType`이 `ONLINE`일 때 |

### 실제 응답 예시

```json
{
  "id": 9,
  "majorCategoryName": "음악",
  "subCategoryName": "기타",
  "ticketType": "ONLINE",
  "title": "기타 코드 연습",
  "budgetType": "RANGE",
  "budgetMin": 50000,
  "budgetMax": 80000,
  "desiredDuration": "ONE_HOUR",
  "region": null,
  "locationDetail": null,
  "createdAt": "2026-03-10T00:05:04.272431",
  "proposalCount": 3,
  "daysUntilDeadline": 7,
  "thumbnailUrl": "https://images.unsplash.com/...",
  "new": true
}
```

---

## 2. `GET /v1/api/expert/popular`

### 불일치 필드

| 필드 | Swagger 명세 | 실제 응답 | 발생 조건 |
|---|---|---|---|
| `averageRating` | `number` (non-nullable) | `null` | `reviewCount`가 0일 때 |

### 실제 응답 예시

```json
{
  "expertProfileId": 10,
  "userId": 20,
  "nickname": "음악프로듀서임",
  "profileImageUrl": null,
  "introduction": "실용음악 프로듀싱",
  "activityMethod": "BOTH",
  "grade": "STANDARD",
  "careerPeriod": "9년",
  "categoryNames": ["피아노", "기타"],
  "regions": [],
  "averageRating": null,
  "reviewCount": 0,
  "matchCount": 2
}
```

---

## 요청사항

1. Swagger 명세에 해당 필드들의 `nullable: true` 반영 부탁드립니다.
2. 동일 스키마를 사용하는 다른 엔드포인트(`/v1/api/ticket/feed`, `/v1/api/expert` 등)도 함께 확인 부탁드립니다.

> **FE 대응:** 프론트에서는 우선 해당 필드들을 nullable로 수정하여 대응 완료한 상태입니다.
