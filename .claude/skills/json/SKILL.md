---
name: json
description: API 엔드포인트의 Request/Response JSON 형식을 알려주는 커맨드. "/json POST /v1/api/user/expert" 또는 "/json /v1/api/delivery" 형태로 호출한다. HTTP 메서드를 생략하면 해당 경로의 모든 메서드를 보여준다. 프론트엔드 프로젝트에서 zod 스키마와 서비스 함수를 기반으로 JSON 형식을 출력한다.
user-invokable: true
---

# /json 커맨드

사용자가 API 엔드포인트를 입력하면 해당 API의 Request Body와 Response Body JSON 형식을 알려준다.

## 사용법

```
/json [HTTP메서드] <엔드포인트 경로>
```

예시:
- `/json POST /v1/api/user/expert`
- `/json /v1/api/delivery`
- `/json GET /v1/api/ticket/feed`

## 실행 절차

1. 사용자가 입력한 엔드포인트 경로에서 HTTP 메서드와 URL 경로를 파싱한다
2. `src/entities/*/api/*.service.ts` 파일에서 해당 URL을 호출하는 서비스 함수를 검색한다
3. 해당 서비스 함수가 사용하는 zod 스키마를 `src/entities/*/api/*.schema.ts`에서 찾는다
4. Request 스키마(있다면)와 Response 스키마의 필드 구조를 파악한다
5. 도메인별 SKILL.md의 API 엔드포인트 표에서 해당 API의 설명과 인증 요구사항을 확인한다
6. JSON 예시 + 필드 설명 표를 출력한다

### 검색 순서

```
1. Grep: src/entities/*/api/*.service.ts 에서 URL 경로 검색
2. Read: 해당 service 파일 → 함수 시그니처와 사용 스키마 파악
3. Read: 해당 schema 파일 → zod 스키마 필드 구조 파악
4. (선택) .claude/skills/*/SKILL.md 에서 API 설명 확인
```

## 출력 형식

```
**{HTTP메서드} {경로}**

### Request

{Request JSON 예시 — 각 필드 옆에 // 주석으로 설명}

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| ... | ... | ... | ... |

### Response (성공)

{Response JSON 예시 — SuccessResponse 래퍼 포함}

```json
{
  "success": true,
  "message": "성공",
  "data": {
    // 실제 응답 데이터
  }
}
```

| 필드 | 타입 | 설명 |
|------|------|------|
| ... | ... | ... |

### zod 스키마 위치

- Request: `src/entities/{domain}/api/{domain}.schema.ts` → `{schemaName}`
- Response: `src/entities/{domain}/api/{domain}.schema.ts` → `{schemaName}`
```

## 규칙

- Response는 `{ success, message, data }` 래퍼를 포함하여 실제 응답 형태 그대로 보여준다
- 커서 페이지네이션 응답은 `{ content: [...], nextCursor, hasNext }` 구조로 보여준다
- Enum 타입은 가능한 값을 모두 나열한다
- 중첩 객체/리스트는 JSON 안에 포함하여 보여준다
- `@RequestBody`가 없는 API(GET 등)는 Query Parameter / Path Variable을 표로 정리한다
- zod 스키마 파일의 위치를 항상 표기하여 프론트엔드 개발자가 바로 참조할 수 있게 한다
