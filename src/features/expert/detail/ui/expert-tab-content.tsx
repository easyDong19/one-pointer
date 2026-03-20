"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs"
import type { ExpertDetail } from "@/entities/expert/api/expert.schema"
import { ExpertIntroTab } from "./expert-intro-tab"
import { ExpertPortfolioTab } from "./expert-portfolio-tab"
import { ExpertCertificationTab } from "./expert-certification-tab"
import { ExpertReviewTab } from "./expert-review-tab"

export function ExpertTabContent({ expert }: { expert: ExpertDetail }) {
  const portfolioCount = expert.portfolios?.length ?? 0
  const certificationCount = expert.certifications?.length ?? 0
  const reviewCount = expert.reviewSummary?.reviewCount ?? 0

  return (
    <Tabs defaultValue="intro" className="w-full">
      <TabsList variant="line" className="grid w-full grid-cols-4">
        <TabsTrigger value="intro">소개</TabsTrigger>
        <TabsTrigger value="portfolio">포트폴리오 {portfolioCount}</TabsTrigger>
        <TabsTrigger value="certification">자격증 {certificationCount}</TabsTrigger>
        <TabsTrigger value="review">리뷰 {reviewCount}</TabsTrigger>
      </TabsList>

      <TabsContent value="intro">
        <ExpertIntroTab expert={expert} />
      </TabsContent>
      <TabsContent value="portfolio">
        <ExpertPortfolioTab expert={expert} />
      </TabsContent>
      <TabsContent value="certification">
        <ExpertCertificationTab expert={expert} />
      </TabsContent>
      <TabsContent value="review">
        <ExpertReviewTab expert={expert} />
      </TabsContent>
    </Tabs>
  )
}
