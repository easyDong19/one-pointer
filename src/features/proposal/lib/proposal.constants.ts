export const PROPOSED_DURATION_LABEL: Record<string, string> = {
  THIRTY_MIN: "30분",
  ONE_HOUR: "1시간",
  ONE_HALF_HOUR: "1시간 30분",
  TWO_HOUR: "2시간",
  NEGOTIABLE: "협의",
}

export const PROPOSED_DURATION_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "THIRTY_MIN", label: "30분" },
  { value: "ONE_HOUR", label: "1시간" },
  { value: "ONE_HALF_HOUR", label: "1시간 30분" },
  { value: "TWO_HOUR", label: "2시간" },
  { value: "NEGOTIABLE", label: "협의" },
]

export const METHOD_LABEL: Record<"OFFLINE" | "ONLINE" | "BOTH", string> = {
  OFFLINE: "오프라인",
  ONLINE: "온라인",
  BOTH: "둘 다 가능",
}

export const PROPOSAL_STATUS_LABEL: Record<string, string> = {
  PENDING: "대기 중",
  SELECTED: "수락됨",
  COMPLETED: "완료",
  REJECTED: "거절됨",
  WITHDRAWN: "철회",
}
