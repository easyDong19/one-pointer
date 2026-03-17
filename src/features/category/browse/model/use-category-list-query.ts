import { useQuery } from "@tanstack/react-query"
import { categoryQueryKeys } from "@/entities/category/model/category.query-keys"
import { getCategories } from "@/entities/category/api/category.service"

/** 카테고리 전체 목록을 CSR로 패칭하는 쿼리 훅 */
export function useCategoryListQuery() {
  return useQuery({
    queryKey: categoryQueryKeys.list,
    queryFn: getCategories,
    staleTime: 1000 * 60 * 5, // 5분
  })
}
