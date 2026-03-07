---
name: category
description: 카테고리(대분류/중분류) 도메인 프론트엔드 구현 가이드. MajorCategory, SubCategory 조회, 티켓 등록·전문가 등록·피드 필터링에서의 카테고리 사용 등. /category 로 호출하거나 카테고리 관련 작업 시 참고한다.
---

# Category 도메인

대분류(MajorCategory) → 중분류(SubCategory) 2단계 구조. 관리자가 등록/관리하며, Ticket과 ExpertProfile이 카테고리를 참조한다.

## 구조

```
[대분류]                        [중분류 예시]
─────────────────────────────────────────────────────
취미/자기개발 (v1 론칭)         골프, 테니스, 기타, 피아노, 타로 ...
외주/의뢰 (향후 확장)           디자인, 개발, 번역, 영상편집 ...
커리어/취업 (향후 확장)         이력서 첨삭, 면접코칭, 이직상담 ...
교육/과외 (향후 확장)           수학, 영어, 코딩, 자격증 ...
```

## 가능 의뢰 유형 (availableType)

SubCategory의 `availableType` 필드로 해당 카테고리에서 가능한 의뢰 유형을 제한:

| availableType | 설명 | 예시 |
|---------------|------|------|
| `OFFLINE` | 오프라인만 가능 | 골프, 피트니스, 댄스 |
| `ONLINE` | 온라인만 가능 | 작곡/프로듀싱 |
| `BOTH` | 오프/온라인 모두 | 기타, 보컬, 타로 |

> 현재 프론트엔드 zod 스키마에 `availableType` 필드가 누락되어 있음. 티켓 등록 시 의뢰 유형 제한 UI 구현 시 스키마에 추가 필요.

## 카테고리 사용처 (프론트엔드)

| 화면 | 사용 방식 |
|------|----------|
| **티켓 등록** | 대분류 → 중분류 선택. `subCategoryId` 1개를 티켓에 전달. `availableType`에 따라 의뢰 유형(오프/온라인) 선택지 제한 |
| **전문가 등록** | 중분류 최대 3개 선택. `subCategoryIds: number[]` 배열로 전달 |
| **티켓 피드 필터링** | `subCategoryId` 파라미터로 카테고리별 피드 조회 |
| **전문가 검색** | 카테고리별 전문가 필터링 |

## API 엔드포인트

| Method | URL | 설명 | 인증 | Service 함수 |
|--------|-----|------|------|-------------|
| GET | `/v1/api/category` | 전체 카테고리 조회 (active=true인 대분류 + 중분류) | 불필요 | `getCategories()` |

응답: `SuccessResponse<Category[]>`
- `Category`: id, name, subCategories
- `SubCategory`: id, name

## 프론트엔드 구현 가이드

### FSD 파일 구조

```
src/
├── entities/category/
│   ├── api/
│   │   ├── category.schema.ts      # zod v4 스키마
│   │   └── category.service.ts     # Service Layer
│   └── model/
│       └── category.query-keys.ts  # Query 키 팩토리
```

### Query Keys

```typescript
export const categoryQueryKeys = {
  all: ["category"] as const,
  list: ["category", "list"] as const,
}
```

### Query Hook 패턴

```typescript
export function useCategories() {
  return useQuery({
    queryKey: categoryQueryKeys.list,
    queryFn: getCategories,
    staleTime: 1000 * 60 * 60,  // 카테고리는 자주 바뀌지 않으므로 1시간 캐시
  })
}
```

> 카테고리 데이터는 정적 데이터에 가깝기 때문에 `staleTime`을 길게 설정하여 불필요한 리페치를 방지한다.

## 데이터 상세

- **[category-data.md](references/category-data.md)** — MajorCategory, SubCategory 필드 상세 + v1 론칭 카테고리 목록
