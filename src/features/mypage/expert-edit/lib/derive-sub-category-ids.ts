import type { Category } from "@/entities/category/api/category.schema"
import type { MyExpertProfile } from "@/entities/user/api/user.schema"

/**
 * `getMyExpertProfile()` 응답에는 카테고리가 이름 문자열로만 들어온다
 * (`majorCategoryName` + `subCategoryNames[]`). `updateExpertProfile` 요청은
 * `subCategoryIds: number[]` 가 필요하므로 카테고리 목록과 매칭해 id 로 변환한다.
 *
 * 매칭은 (대분류 이름, 소분류 이름) 쌍으로 한다 — 다른 대분류에 동명 소분류가
 * 있을 수도 있으니 안전하게.
 */
export function deriveSubCategoryIds(
  profile: Pick<MyExpertProfile, "categories">,
  categories: ReadonlyArray<Category>,
): number[] {
  const ids: number[] = []
  for (const group of profile.categories ?? []) {
    const cat = categories.find((c) => c.name === group.majorCategoryName)
    if (!cat) continue
    for (const subName of group.subCategoryNames ?? []) {
      const sub = cat.subCategories.find((s) => s.name === subName)
      if (sub) ids.push(sub.id)
    }
  }
  return ids
}
