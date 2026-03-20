import { useQuery } from "@tanstack/react-query"
import { expertQueryKeys } from "@/entities/expert/model/expert.query-keys"
import { getExpertDetail } from "@/entities/expert/api/expert.service"

export function useExpertDetailQuery(expertProfileId: number) {
  return useQuery({
    queryKey: expertQueryKeys.detail(expertProfileId),
    queryFn: () => getExpertDetail(expertProfileId),
    enabled: expertProfileId > 0,
  })
}
