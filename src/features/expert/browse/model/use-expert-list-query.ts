import { useInfiniteQuery } from "@tanstack/react-query"
import { getExperts } from "@/entities/expert/api/expert.service"
import { expertQueryKeys } from "@/entities/expert/model/expert.query-keys"
import type { ExpertListParams } from "@/entities/expert/api/expert.schema"

export function useExpertListQuery(params: ExpertListParams, enabled = true) {
  return useInfiniteQuery({
    queryKey: expertQueryKeys.list(params),
    queryFn: ({ pageParam }) =>
      getExperts({ ...params, cursor: pageParam ?? undefined }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.nextCursor : undefined),
    enabled,
  })
}
