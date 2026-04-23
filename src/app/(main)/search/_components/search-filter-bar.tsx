"use client"

import { MapPin } from "lucide-react"
import {
  FilterChip,
  FilterDropdown,
} from "@/features/category/browse/ui/category-filters"
import {
  TICKET_TYPE_LABEL,
  TICKET_SORT_OPTIONS,
  TICKET_TYPE_FILTER,
} from "@/entities/category/lib/category.constants"
import type {
  SearchFilterActions,
  SearchFilterState,
} from "./use-search-filter-state"

type Props = {
  state: SearchFilterState
  actions: SearchFilterActions
  onRegionClick: () => void
}

/**
 * /search 페이지의 필터 바.
 *
 * 지역(바텀시트 or Dialog, 상위에서 핸들) · 유형(드롭다운) · 정렬(드롭다운).
 * 카테고리 상세 페이지와 동일한 `FilterChip` / `FilterDropdown` 재사용.
 */
export function SearchFilterBar({ state, actions, onRegionClick }: Props) {
  return (
    <div className="border-border/50 -mx-4 border-b bg-background md:-mx-6 lg:-mx-8">
      <div className="scrollbar-none flex items-center gap-2 overflow-x-auto px-4 py-2.5 md:px-6 lg:px-8">
        <FilterChip
          icon={<MapPin className="h-3.5 w-3.5" />}
          label={state.region ?? "지역"}
          active={!!state.region}
          onClick={onRegionClick}
        />

        <FilterDropdown
          label={
            state.ticketType
              ? (TICKET_TYPE_LABEL[state.ticketType]?.text ?? "유형")
              : "유형"
          }
          options={TICKET_TYPE_FILTER.map((o) => ({
            value: o.value ?? "",
            label: o.label,
          }))}
          onSelect={(val) =>
            actions.setTicketType((val || undefined) as "OFFLINE" | "ONLINE" | undefined)
          }
        />

        <FilterDropdown
          label={
            TICKET_SORT_OPTIONS.find((o) => o.value === state.sortBy)?.label ??
            "최신순"
          }
          options={TICKET_SORT_OPTIONS.map((o) => ({
            value: o.value,
            label: o.label,
          }))}
          onSelect={(val) =>
            actions.setSortBy(val as SearchFilterState["sortBy"])
          }
          isSort
        />
      </div>
    </div>
  )
}
