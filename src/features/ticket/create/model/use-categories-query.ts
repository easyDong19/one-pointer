"use client"

import { useQuery } from "@tanstack/react-query"

import { getCategories } from "@/entities/category/api/category.service"

/**
 * `GET /v1/api/category` — 카테고리 목록 (각 major + 하위 sub).
 *
 * staleTime 1시간 — 카테고리는 거의 안 바뀜. 다른 페이지 (탐색·검색) 와 캐시 공유.
 */
export function useCategoriesQuery() {
  return useQuery({
    queryKey: ["category", "list"],
    queryFn: getCategories,
    staleTime: 60 * 60 * 1000,
  })
}
