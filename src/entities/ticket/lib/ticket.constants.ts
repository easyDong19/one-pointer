export const STATUS_LABEL: Record<
  string,
  { text: string; variant: "default" | "secondary" | "outline" | "destructive" }
> = {
  DRAFT: { text: "임시저장", variant: "secondary" },
  OPEN: { text: "모집중", variant: "default" },
  IN_REVIEW: { text: "검토중", variant: "default" },
  MATCHED: { text: "매칭 완료", variant: "secondary" },
  PAYMENT_PENDING: { text: "결제 대기", variant: "outline" },
  PAID: { text: "결제 완료", variant: "secondary" },
  IN_PROGRESS: { text: "진행중", variant: "default" },
  DELIVERED: { text: "전달 완료", variant: "secondary" },
  COMPLETED: { text: "완료", variant: "secondary" },
  CANCELLED: { text: "취소됨", variant: "destructive" },
  EXPIRED: { text: "만료됨", variant: "destructive" },
}

export const LEVEL_LABEL: Record<string, string> = {
  BEGINNER: "초급",
  INTERMEDIATE: "중급",
  ADVANCED: "고급",
}

export const TICKET_TYPE_LABEL: Record<string, string> = {
  ONLINE: "온라인",
  OFFLINE: "오프라인",
}
