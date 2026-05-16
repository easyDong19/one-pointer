"use client"

import { useState } from "react"
import { Check, ChevronLeft, Plus, X } from "lucide-react"
import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"
import { Text } from "@/shared/ui/text"
import { cn } from "@/shared/lib/utils"
import { CITY_LIST, REGION_MAP } from "@/shared/data/region-data"

type Props = {
  selected: string[]
  onChange: (regions: string[]) => void
}

export function RegionMultiSelect({ selected, onChange }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedCity, setSelectedCity] = useState<string | null>(null)

  const toggleRegion = (region: string) => {
    if (selected.includes(region)) {
      onChange(selected.filter((r) => r !== region))
    } else {
      onChange([...selected, region])
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((region) => (
            <Badge key={region} variant="secondary" className="gap-1 pr-1">
              {region}
              <button
                type="button"
                onClick={() => onChange(selected.filter((r) => r !== region))}
                aria-label={`${region} 제거`}
                className="hover:bg-foreground/10 rounded-full p-0.5"
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {!isOpen ? (
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => setIsOpen(true)}
        >
          <Plus className="mr-1 size-4" />
          지역 추가
        </Button>
      ) : !selectedCity ? (
        <div className="max-h-60 overflow-y-auto rounded-md border">
          <div className="bg-card sticky top-0 flex items-center justify-between border-b px-3 py-2">
            <Text typography="caption1-medium">시/도 선택</Text>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-muted-foreground hover:text-foreground text-xs"
            >
              닫기
            </button>
          </div>
          {CITY_LIST.map((city) => (
            <button
              key={city}
              type="button"
              onClick={() => setSelectedCity(city)}
              className="hover:bg-muted/50 flex w-full items-center justify-between px-3 py-2.5 text-left text-sm"
            >
              {city}
            </button>
          ))}
        </div>
      ) : (
        <div className="max-h-60 overflow-y-auto rounded-md border">
          <button
            type="button"
            onClick={() => setSelectedCity(null)}
            className="bg-card hover:bg-muted/50 sticky top-0 flex w-full items-center gap-2 border-b px-3 py-2"
          >
            <ChevronLeft className="size-4" />
            <Text typography="caption1-medium">{selectedCity}</Text>
          </button>
          {(REGION_MAP[selectedCity] ?? []).map((district) => {
            const fullRegion = `${selectedCity} ${district}`
            const isSelected = selected.includes(fullRegion)
            return (
              <button
                key={district}
                type="button"
                onClick={() => toggleRegion(fullRegion)}
                className={cn(
                  "hover:bg-muted/50 flex w-full items-center justify-between px-3 py-2.5 text-left text-sm",
                  isSelected && "bg-primary/5",
                )}
              >
                {district}
                {isSelected && <Check className="text-primary size-4" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
