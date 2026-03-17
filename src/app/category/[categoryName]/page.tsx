import { CategoryDetailContent } from "./_components/category-detail-content"

type Props = {
  params: Promise<{ categoryName: string }>
}

export default async function CategoryPage({ params }: Props) {
  const { categoryName } = await params
  const decodedName = decodeURIComponent(categoryName)

  return <CategoryDetailContent categoryName={decodedName} />
}
