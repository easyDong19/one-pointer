import { notFound } from "next/navigation"
import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import { CategoryDetailContent } from "./_components/category-detail-content"

type Props = {
  params: Promise<{ categoryName: string }>
}

export default async function CategoryPage({ params }: Props) {
  const { categoryName } = await params
  const decodedName = decodeURIComponent(categoryName)

  if (!decodedName.trim()) notFound()

  return (
    <Suspense
      fallback={
        <div className="bg-background flex min-h-dvh items-center justify-center">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
        </div>
      }
    >
      <CategoryDetailContent categoryName={decodedName} />
    </Suspense>
  )
}
