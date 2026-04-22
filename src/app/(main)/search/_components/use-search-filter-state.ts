"use client"

import { useReducer, useEffect } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

/* ─── Types ───────────────────────────────────────────────────────────────── */

export type TicketType = "OFFLINE" | "ONLINE"
export type TicketSort = "LATEST" | "BUDGET_HIGH" | "DEADLINE_SOON"

export type SearchFilterState = {
  keyword: string
  region: string | undefined
  ticketType: TicketType | undefined
  sortBy: TicketSort
  majorCategoryId: number | undefined
  subCategoryId: number | undefined
}

export type SearchFilterActions = {
  setKeyword: (v: string) => void
  setRegion: (v: string | undefined) => void
  setTicketType: (v: TicketType | undefined) => void
  setSortBy: (v: TicketSort) => void
  setMajorCategory: (v: number | undefined) => void
  setSubCategory: (v: number | undefined) => void
}

/* ─── Reducer ─────────────────────────────────────────────────────────────── */

type Action =
  | { type: "SET_KEYWORD"; payload: string }
  | { type: "SET_REGION"; payload: string | undefined }
  | { type: "SET_TICKET_TYPE"; payload: TicketType | undefined }
  | { type: "SET_SORT_BY"; payload: TicketSort }
  | { type: "SET_MAJOR_CATEGORY"; payload: number | undefined }
  | { type: "SET_SUB_CATEGORY"; payload: number | undefined }
  | { type: "SYNC_FROM_URL"; payload: SearchFilterState }

function reducer(state: SearchFilterState, action: Action): SearchFilterState {
  switch (action.type) {
    case "SET_KEYWORD":
      return { ...state, keyword: action.payload }
    case "SET_REGION":
      return { ...state, region: action.payload }
    case "SET_TICKET_TYPE":
      return { ...state, ticketType: action.payload }
    case "SET_SORT_BY":
      return { ...state, sortBy: action.payload }
    case "SET_MAJOR_CATEGORY":
      return { ...state, majorCategoryId: action.payload }
    case "SET_SUB_CATEGORY":
      return { ...state, subCategoryId: action.payload }
    case "SYNC_FROM_URL":
      return action.payload
  }
}

/* ─── URL ↔ State helpers ─────────────────────────────────────────────────── */

const VALID_TICKET_TYPES = new Set<TicketType>(["OFFLINE", "ONLINE"])
const VALID_SORTS = new Set<TicketSort>(["LATEST", "BUDGET_HIGH", "DEADLINE_SOON"])

function parseTicketType(v: string | null): TicketType | undefined {
  if (!v) return undefined
  return VALID_TICKET_TYPES.has(v as TicketType) ? (v as TicketType) : undefined
}

function parseSortBy(v: string | null): TicketSort {
  if (!v) return "LATEST"
  return VALID_SORTS.has(v as TicketSort) ? (v as TicketSort) : "LATEST"
}

function parseNumber(v: string | null): number | undefined {
  if (!v) return undefined
  const n = Number(v)
  return Number.isFinite(n) ? n : undefined
}

function stateFromSearchParams(sp: URLSearchParams): SearchFilterState {
  return {
    keyword: sp.get("keyword") ?? "",
    region: sp.get("region") ?? undefined,
    ticketType: parseTicketType(sp.get("ticketType")),
    sortBy: parseSortBy(sp.get("sortBy")),
    majorCategoryId: parseNumber(sp.get("majorCategoryId")),
    subCategoryId: parseNumber(sp.get("subCategoryId")),
  }
}

function stateToQueryString(state: SearchFilterState): string {
  const qs = new URLSearchParams()
  if (state.keyword) qs.set("keyword", state.keyword)
  if (state.region) qs.set("region", state.region)
  if (state.ticketType) qs.set("ticketType", state.ticketType)
  if (state.sortBy && state.sortBy !== "LATEST") qs.set("sortBy", state.sortBy)
  if (state.majorCategoryId !== undefined)
    qs.set("majorCategoryId", String(state.majorCategoryId))
  if (state.subCategoryId !== undefined)
    qs.set("subCategoryId", String(state.subCategoryId))
  return qs.toString()
}

/* ─── Hook ────────────────────────────────────────────────────────────────── */

/**
 * /search 페이지 필터 state + URL 양방향 동기화.
 *
 * - 초기값: `useSearchParams()` 에서 읽음 (reducer lazy initializer)
 * - state 변경 시: `router.replace(?qs)` (URL 이 이미 일치하면 no-op)
 * - URL 변경 시 (뒤로가기 등): state 가 URL 과 다르면 dispatch 로 재동기화
 *
 * 양방향 루프는 "qs 가 이미 일치하면 side-effect 를 내지 않는다" 는 수렴 조건으로 차단.
 */
export function useSearchFilterState(): [SearchFilterState, SearchFilterActions] {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [state, dispatch] = useReducer(
    reducer,
    searchParams,
    (sp) => stateFromSearchParams(new URLSearchParams(sp.toString())),
  )

  // state → URL
  useEffect(() => {
    const qs = stateToQueryString(state)
    const currentQs = searchParams.toString()
    if (qs === currentQs) return
    const url = qs ? `${pathname}?${qs}` : pathname
    router.replace(url, { scroll: false })
  }, [state, searchParams, pathname, router])

  // URL → state (뒤로가기/외부 네비게이션 대응)
  useEffect(() => {
    const urlState = stateFromSearchParams(
      new URLSearchParams(searchParams.toString()),
    )
    const urlQs = stateToQueryString(urlState)
    const stateQs = stateToQueryString(state)
    if (urlQs === stateQs) return
    dispatch({ type: "SYNC_FROM_URL", payload: urlState })
  }, [searchParams, state])

  const actions: SearchFilterActions = {
    setKeyword: (v) => dispatch({ type: "SET_KEYWORD", payload: v }),
    setRegion: (v) => dispatch({ type: "SET_REGION", payload: v }),
    setTicketType: (v) => dispatch({ type: "SET_TICKET_TYPE", payload: v }),
    setSortBy: (v) => dispatch({ type: "SET_SORT_BY", payload: v }),
    setMajorCategory: (v) => dispatch({ type: "SET_MAJOR_CATEGORY", payload: v }),
    setSubCategory: (v) => dispatch({ type: "SET_SUB_CATEGORY", payload: v }),
  }

  return [state, actions]
}
