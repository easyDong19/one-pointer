---
name: category
description: 카테고리(대분류/중분류) 도메인 기획. 2단계 카테고리 구조, 티켓 등록 시 카테고리 선택, 전문가 전문 분야 설정, v1 론칭 목록 등. 카테고리 선택 UI, 피드 필터 등 Category 관련 프론트엔드 작업 시 참고. /category 로 호출.
---

# Category 도메인 (프론트엔드)

대분류 → 중분류 **2단계 구조**. 의뢰인이 티켓 등록 시 중분류 선택, 전문가는 전문 분야로 등록.

## Enum

```typescript
// ActivityMethod (user 도메인과 공유)
type ActivityMethod = 'OFFLINE' | 'ONLINE' | 'BOTH'
```

## 데이터 모델

```typescript
interface MajorCategory {
  id: number
  name: string            // "취미/자기개발"
  description?: string
  iconUrl?: string
  sortOrder: number
  active: boolean         // v1: "취미/자기개발"만 true
  subCategories: SubCategory[]
}

interface SubCategory {
  id: number
  name: string            // "골프", "피아노/건반"
  iconUrl?: string        // 이모지 또는 이미지 URL
  availableType: ActivityMethod  // 가능 의뢰 유형
  sortOrder: number
  active: boolean         // 비활성 시 비노출
}
```

## 카테고리 사용처

### 티켓 등록 시
- 중분류 **1개** 선택 (대분류 → 중분류 드릴다운)
- **availableType에 따라 의뢰 유형 자동 제한**:
  - `OFFLINE` → 오프라인 고정 (온라인 선택 불가)
  - `ONLINE` → 온라인 고정 (오프라인 선택 불가)
  - `BOTH` → 선택 가능

### 전문가 프로필 등록 시
- 전문 분야 중분류 **최대 3개** 선택
- 3개 초과 시 추가 불가

## v1 론칭 카테고리

대분류: **취미/자기개발** (23개 중분류)

| # | 중분류 | availableType | 예시 |
|---|--------|:------------:|------|
| 1 | 골프 | OFFLINE | 스윙 교정, 어프로치, 퍼팅 |
| 2 | 라켓 스포츠 | OFFLINE | 테니스, 배드민턴, 탁구 |
| 3 | 피트니스 | OFFLINE | PT, 필라테스, 요가 |
| 4 | 구기/팀스포츠 | OFFLINE | 축구, 농구, 배구, 볼링 |
| 5 | 수상/겨울 스포츠 | OFFLINE | 수영, 서핑, 스키, 보드 |
| 6 | 아웃도어 | OFFLINE | 러닝, 자전거, 클라이밍 |
| 7 | 무술/격투기 | OFFLINE | 복싱, 주짓수, 킥복싱 |
| 8 | 기타/베이스 | BOTH | 통기타, 일렉, 베이스 |
| 9 | 피아노/건반 | BOTH | 피아노, 키보드 |
| 10 | 현악/관악 | BOTH | 바이올린, 첼로, 플루트 |
| 11 | 드럼/타악기 | OFFLINE | 드럼, 카혼, 젬베 |
| 12 | 보컬/노래 | BOTH | 보컬 트레이닝, 발성, 랩 |
| 13 | 작곡/프로듀싱 | ONLINE | 미디, 작곡, 믹싱 |
| 14 | 타로/운세 | BOTH | 타로 리딩, 사주, 수비학 |
| 15 | 명상/마음관리 | BOTH | 명상, 호흡법 |
| 16 | 사진/영상 | BOTH | 촬영 기법, 보정, 영상 편집 |
| 17 | 미술/드로잉 | BOTH | 드로잉, 수채화, 디지털 일러스트 |
| 18 | 공예/핸드메이드 | OFFLINE | 뜨개질, 가죽공예, 캔들 |
| 19 | 요리/베이킹 | OFFLINE | 가정식, 베이킹, 칵테일 |
| 20 | 댄스 | OFFLINE | K-pop, 스트릿, 살사, 발레 |
| 21 | 외국어 | BOTH | 영어회화, 일본어, 중국어 |
| 22 | 보드게임/두뇌 | BOTH | 체스, 바둑, 마술 |
| 23 | 라이프스타일 | BOTH | 꽃꽂이, 인테리어, 가드닝 |

## UI 구현 참고

### 카테고리 선택 UI (티켓 등록)

```
1. 대분류 목록 표시 (active만, sortOrder 정렬)
   - active: false → "준비 중" 비활성 표시
2. 대분류 선택 → 중분류 목록 (active만, sortOrder 정렬)
3. 중분류 선택
4. availableType에 따라 의뢰 유형 UI 분기:
   - OFFLINE → ticketType 오프라인 고정
   - ONLINE → ticketType 온라인 고정
   - BOTH → 오프라인/온라인 선택 라디오
```

### 전문가 전문 분야 선택 UI

```
1. 중분류에서 복수 선택 (최대 3개)
2. 3개 선택 시 추가 불가 안내
3. 선택된 카테고리 칩/태그로 표시
```

## 정책

- **2단계 구조**: 대분류 → 중분류 (소분류 없음)
- **v1**: "취미/자기개발" 대분류만 활성 (23개 중분류)
- 향후 확장: 외주/의뢰, 커리어/취업, 교육/과외
- 카테고리 추가/수정/비활성화는 **관리자만** 가능
- 각 중분류별 **availableType으로 의뢰 유형 제한**

## 악용 방지

| 위험 | 대응 |
|------|------|
| 전문가 무관 분야 등록 | 최대 3개 제한, 심사 시 확인 |
| 부적절 카테고리 의뢰 | availableType 제한 (오프라인 분야에 온라인 불가) |

## 기능 체크리스트

### 의뢰인
- [ ] 티켓 등록 시 카테고리 2단계 선택
- [ ] 카테고리별 의뢰 피드 탐색

### 전문가
- [ ] 전문 분야 카테고리 등록 (최대 3개)
- [ ] 내 카테고리 기반 피드 자동 필터링
