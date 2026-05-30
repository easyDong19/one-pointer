import type { Metadata } from "next"
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import {
  getCategoriesOnServer,
  type Category,
} from "@/entities/category/api/category.server-service"
import { categoryQueryKeys } from "@/entities/category/model/category.query-keys"
import { CategoryDetailContent } from "./_components/category-detail-content"

type Props = {
  params: Promise<{ categoryName: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categoryName } = await params
  const decodedName = decodeURIComponent(categoryName)
  if (!decodedName.trim()) return {}

  const title = `${decodedName} - 카테고리`
  const description = `${decodedName} 분야의 1회성 레슨 의뢰와 전문가를 만나보세요.`
  return {
    title,
    description,
    openGraph: { title, description },
  }
}

export default async function CategoryPage({ params }: Props) {
  const { categoryName } = await params
  const decodedName = decodeURIComponent(categoryName)

  if (!decodedName.trim()) notFound()

  // 카테고리 목록을 서버에서 미리 받아 캐시에 시드 → 카테고리 lookup 워터폴 제거.
  // 실패 시 빈 캐시로 두어 클라이언트가 패칭하도록 폴백한다(복원력 유지).
  const queryClient = new QueryClient()
  let categories: Category[] | null = null
  try {
    categories = await getCategoriesOnServer()
  } catch {
    categories = null
  }

  if (categories) {
    queryClient.setQueryData(categoryQueryKeys.list, categories)
    // notFound() 는 try 밖에서 호출 — 특수 throw 가 catch 에 삼켜지지 않도록.
    if (!categories.some((c) => c.name === decodedName)) notFound()
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense
        fallback={
          <div className="bg-background flex min-h-dvh items-center justify-center">
            <Loader2 className="text-primary h-8 w-8 animate-spin" />
          </div>
        }
      >
        <CategoryDetailContent categoryName={decodedName} />
      </Suspense>
    </HydrationBoundary>
  )
}
