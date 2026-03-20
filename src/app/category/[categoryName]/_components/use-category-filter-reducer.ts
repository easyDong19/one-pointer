import { useReducer } from "react"

// ─── State ────────────────────────────────────────────────────────────────────

export type MainTab = "tickets" | "experts"

type TicketSort = "LATEST" | "BUDGET_HIGH" | "DEADLINE_SOON"
type ExpertSort = "RATING_DESC" | "MATCH_COUNT_DESC" | "LATEST"
type TicketType = "OFFLINE" | "ONLINE"
type ActivityMethod = "OFFLINE" | "ONLINE" | "BOTH"

export type CategoryFilterState = {
  mainTab: MainTab
  subCategoryId: number | undefined
  ticketType: TicketType | undefined
  ticketSort: TicketSort
  expertSort: ExpertSort
  minRating: number | undefined
  activityMethod: ActivityMethod | undefined
  /** 지역 필터 ("서울 강남구" 형태, undefined = 전체) */
  region: string | undefined
}

// ─── Actions ──────────────────────────────────────────────────────────────────

type Action =
  | { type: "SET_MAIN_TAB"; payload: MainTab }
  | { type: "SET_SUB_CATEGORY"; payload: number | undefined }
  | { type: "SET_TICKET_TYPE"; payload: TicketType | undefined }
  | { type: "SET_TICKET_SORT"; payload: TicketSort }
  | { type: "SET_EXPERT_SORT"; payload: ExpertSort }
  | { type: "SET_MIN_RATING"; payload: number | undefined }
  | { type: "SET_ACTIVITY_METHOD"; payload: ActivityMethod | undefined }
  | { type: "SET_REGION"; payload: string | undefined }

// ─── Reducer ──────────────────────────────────────────────────────────────────

const initialState: CategoryFilterState = {
  mainTab: "tickets",
  subCategoryId: undefined,
  ticketType: undefined,
  ticketSort: "LATEST",
  expertSort: "RATING_DESC",
  minRating: undefined,
  activityMethod: undefined,
  region: undefined,
}

function categoryFilterReducer(state: CategoryFilterState, action: Action): CategoryFilterState {
  switch (action.type) {
    case "SET_MAIN_TAB":
      return { ...state, mainTab: action.payload }
    case "SET_SUB_CATEGORY":
      return { ...state, subCategoryId: action.payload }
    case "SET_TICKET_TYPE":
      return { ...state, ticketType: action.payload }
    case "SET_TICKET_SORT":
      return { ...state, ticketSort: action.payload }
    case "SET_EXPERT_SORT":
      return { ...state, expertSort: action.payload }
    case "SET_MIN_RATING":
      return { ...state, minRating: action.payload }
    case "SET_ACTIVITY_METHOD":
      return { ...state, activityMethod: action.payload }
    case "SET_REGION":
      return { ...state, region: action.payload }
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCategoryFilterReducer(initialMainTab?: MainTab) {
  const [state, dispatch] = useReducer(categoryFilterReducer, {
    ...initialState,
    ...(initialMainTab && { mainTab: initialMainTab }),
  })

  const actions = {
    setMainTab: (tab: MainTab) => dispatch({ type: "SET_MAIN_TAB", payload: tab }),
    setSubCategory: (id: number | undefined) =>
      dispatch({ type: "SET_SUB_CATEGORY", payload: id }),
    setTicketType: (value: TicketType | undefined) =>
      dispatch({ type: "SET_TICKET_TYPE", payload: value }),
    setTicketSort: (value: TicketSort) =>
      dispatch({ type: "SET_TICKET_SORT", payload: value }),
    setExpertSort: (value: ExpertSort) =>
      dispatch({ type: "SET_EXPERT_SORT", payload: value }),
    setMinRating: (value: number | undefined) =>
      dispatch({ type: "SET_MIN_RATING", payload: value }),
    setActivityMethod: (value: ActivityMethod | undefined) =>
      dispatch({ type: "SET_ACTIVITY_METHOD", payload: value }),
    setRegion: (value: string | undefined) =>
      dispatch({ type: "SET_REGION", payload: value }),
  }

  return [state, actions] as const
}
