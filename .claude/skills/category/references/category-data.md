# Category 도메인 데이터 상세

## 목차
1. [MajorCategory 엔티티](#1-majorcategory-엔티티)
2. [SubCategory 엔티티](#2-subcategory-엔티티)
3. [Ticket의 카테고리 참조](#3-ticket의-카테고리-참조)
4. [ExpertCategory 매핑 엔티티](#4-expertcategory-매핑-엔티티)
5. [v1 론칭 카테고리 목록](#5-v1-론칭-카테고리-목록)

---

## 1. MajorCategory 엔티티

엔티티: `one_pointer.domain.category.entity.MajorCategory`
테이블: `major_category`

| 필드명 | 컬럼명 | 타입 | 필수 | 설명 |
|--------|--------|------|------|------|
| `id` | `major_category_id` | Long (PK, IDENTITY) | 자동 | 대분류 고유 식별자 |
| `name` | `name` | String | ✅ | 대분류명 (예: "취미/자기개발") |
| `description` | `description` | String | ⬜ | 대분류 설명 |
| `iconUrl` | `icon_url` | String | ⬜ | 아이콘 URL |
| `sortOrder` | `sort_order` | Integer | ✅ | 정렬 순서 (기본값: 0) |
| `active` | `active` | Boolean | ✅ | 활성 여부 (기본값: true). v1에서는 취미/자기개발만 true |
| `createDateTime` | `create_date_time` | LocalDateTime | 자동 | BaseTimeEntity |
| `modifiedDateTime` | `modified_date_time` | LocalDateTime | 자동 | BaseTimeEntity |

연관 엔티티: `subCategories` → SubCategory (OneToMany, cascade ALL)

---

## 2. SubCategory 엔티티

엔티티: `one_pointer.domain.category.entity.SubCategory`
테이블: `sub_category`

| 필드명 | 컬럼명 | 타입 | 필수 | 설명 |
|--------|--------|------|------|------|
| `id` | `sub_category_id` | Long (PK, IDENTITY) | 자동 | 중분류 고유 식별자 |
| `majorCategory` | `major_category_id` (FK) | MajorCategory | ✅ | 소속 대분류 (ManyToOne, LAZY, 같은 도메인) |
| `name` | `name` | String | ✅ | 중분류명 (예: "골프", "피아노/건반") |
| `iconUrl` | `icon_url` | String | ⬜ | 이모지 또는 아이콘 URL |
| `availableType` | `available_type` | `ActivityMethod` | ✅ | 가능 의뢰 유형 — OFFLINE / ONLINE / BOTH |
| `sortOrder` | `sort_order` | Integer | ✅ | 정렬 순서 (기본값: 0) |
| `active` | `active` | Boolean | ✅ | 활성 여부 (기본값: true) |
| `createDateTime` | `create_date_time` | LocalDateTime | 자동 | BaseTimeEntity |
| `modifiedDateTime` | `modified_date_time` | LocalDateTime | 자동 | BaseTimeEntity |

---

## 3. Ticket의 카테고리 참조

Ticket은 카테고리를 1개만 가지므로 별도 매핑 테이블 없이 `Ticket` 엔티티에 컬럼으로 직접 보유한다.

| 필드명 | 컬럼명 | 타입 | 필수 | 설명 |
|--------|--------|------|------|------|
| `subCategoryId` | `sub_category_id` | Long | ✅ | 중분류 PK (다른 도메인 PK 참조) |

---

## 4. ExpertCategory 매핑 엔티티

엔티티: `one_pointer.domain.user.entity.ExpertCategory`
테이블: `expert_category`
소속 도메인: **User** (ExpertProfile과 같은 도메인 → JPA 연관관계, SubCategory와는 다른 도메인 → PK만 보유)

| 필드명 | 컬럼명 | 타입 | 필수 | 설명 |
|--------|--------|------|------|------|
| `id` | `expert_category_id` | Long (PK, IDENTITY) | 자동 | 고유 식별자 |
| `expertProfile` | `expert_profile_id` (FK) | ExpertProfile | ✅ | 소속 전문가 프로필 (ManyToOne, LAZY, 같은 도메인) |
| `subCategoryId` | `sub_category_id` | Long | ✅ | 중분류 PK (다른 도메인 PK 참조) |

> 전문가 카테고리는 최대 3개까지 등록 가능 (서비스 로직에서 검증)

---

## 5. v1 론칭 카테고리 목록

대분류: **취미/자기개발**

| # | 중분류 | availableType | 예시 |
|---|--------|---------------|------|
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
