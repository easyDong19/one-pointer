import { ChevronDown, MapPin, ArrowUpDown } from "lucide-react"
import { Text } from "@/shared/ui/text"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/shared/ui/dropdown-menu"
import { cn } from "@/shared/lib/utils"
import {
  TICKET_TYPE_LABEL,
  ACTIVITY_METHOD_LABEL,
  TICKET_SORT_OPTIONS,
  EXPERT_SORT_OPTIONS,
  TICKET_TYPE_FILTER,
  RATING_FILTER,
  ACTIVITY_METHOD_FILTER,
} from "./category-detail.constants"

// ─── Primitives ───────────────────────────────────────────────────────────────

export function FilterChip({
  icon,
  label,
  active,
  onClick,
}: {
  icon?: React.ReactNode
  label: string
  active?: boolean
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "border-border bg-card flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 transition-colors hover:bg-neutral-100",
        active && "border-primary bg-primary/5",
      )}
    >
      {icon}
      <Text
        as="span"
        typography="caption1-medium"
        className={cn("text-foreground", active && "text-primary")}
      >
        {label}
      </Text>
    </button>
  )
}

export function FilterDropdown({
  label,
  options,
  onSelect,
  isSort,
}: {
  label: string
  options: { value: string; label: string }[]
  onSelect: (value: string) => void
  isSort?: boolean
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "border-border bg-card flex shrink-0 items-center gap-1 rounded-full border px-3.5 py-1.5 transition-colors hover:bg-neutral-100",
            isSort && "gap-1.5",
          )}
        >
          {isSort && <ArrowUpDown className="text-foreground h-3.5 w-3.5" />}
          <Text as="span" typography="caption1-medium" className="text-foreground">
            {label}
          </Text>
          <ChevronDown className="text-muted-foreground h-3.5 w-3.5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[120px]">
        {options.map((option) => (
          <DropdownMenuItem key={option.value ?? "all"} onSelect={() => onSelect(option.value)}>
            <Text as="span" typography="body3-medium">
              {option.label}
            </Text>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ─── Ticket Filter Bar ────────────────────────────────────────────────────────

export function TicketFilterBar({
  ticketType,
  ticketSort,
  region,
  onTicketTypeChange,
  onTicketSortChange,
  onRegionClick,
}: {
  ticketType: "OFFLINE" | "ONLINE" | undefined
  ticketSort: string
  region: string | undefined
  onTicketTypeChange: (value: "OFFLINE" | "ONLINE" | undefined) => void
  onTicketSortChange: (value: string) => void
  onRegionClick: () => void
}) {
  return (
    <>
      <FilterChip
        icon={<MapPin className="h-3.5 w-3.5" />}
        label={region ?? "지역"}
        active={!!region}
        onClick={onRegionClick}
      />

      <FilterDropdown
        label={ticketType ? (TICKET_TYPE_LABEL[ticketType]?.text ?? "유형") : "유형"}
        options={TICKET_TYPE_FILTER.map((o) => ({ value: o.value ?? "", label: o.label }))}
        onSelect={(val) =>
          onTicketTypeChange((val || undefined) as "OFFLINE" | "ONLINE" | undefined)
        }
      />

      <FilterDropdown
        label={TICKET_SORT_OPTIONS.find((o) => o.value === ticketSort)?.label ?? "최신순"}
        options={TICKET_SORT_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
        onSelect={onTicketSortChange}
        isSort
      />
    </>
  )
}

// ─── Expert Filter Bar ────────────────────────────────────────────────────────

export function ExpertFilterBar({
  minRating,
  activityMethod,
  expertSort,
  region,
  onMinRatingChange,
  onActivityMethodChange,
  onExpertSortChange,
  onRegionClick,
}: {
  minRating: number | undefined
  activityMethod: "OFFLINE" | "ONLINE" | "BOTH" | undefined
  expertSort: string
  region: string | undefined
  onMinRatingChange: (value: number | undefined) => void
  onActivityMethodChange: (value: "OFFLINE" | "ONLINE" | "BOTH" | undefined) => void
  onExpertSortChange: (value: string) => void
  onRegionClick: () => void
}) {
  return (
    <>
      <FilterChip
        icon={<MapPin className="h-3.5 w-3.5" />}
        label={region ?? "지역"}
        active={!!region}
        onClick={onRegionClick}
      />

      <FilterDropdown
        label={minRating ? `${minRating}점 이상` : "별점"}
        options={RATING_FILTER.map((o) => ({
          value: o.value != null ? String(o.value) : "",
          label: o.label,
        }))}
        onSelect={(val) => onMinRatingChange(val ? Number(val) : undefined)}
      />

      <FilterDropdown
        label={
          activityMethod ? (ACTIVITY_METHOD_LABEL[activityMethod] ?? "활동방식") : "활동방식"
        }
        options={ACTIVITY_METHOD_FILTER.map((o) => ({
          value: o.value ?? "",
          label: o.label,
        }))}
        onSelect={(val) =>
          onActivityMethodChange(
            (val || undefined) as "OFFLINE" | "ONLINE" | "BOTH" | undefined,
          )
        }
      />

      <FilterDropdown
        label={EXPERT_SORT_OPTIONS.find((o) => o.value === expertSort)?.label ?? "별점순"}
        options={EXPERT_SORT_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
        onSelect={onExpertSortChange}
        isSort
      />
    </>
  )
}
