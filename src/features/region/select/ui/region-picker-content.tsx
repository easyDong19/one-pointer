"use client"

import { useState } from "react"
import { ChevronLeft, Check } from "lucide-react"
import { Text } from "@/shared/ui/text"
import { cn } from "@/shared/lib/utils"
import { REGION_MAP, CITY_LIST } from "@/shared/data/region-data"

type RegionPickerContentProps = {
  /** 현재 선택된 "시 구" 형태 값 */
  currentRegion: string | undefined
  /** 지역 선택 완료 시 호출. undefined = 전체(초기화) */
  onSelect: (region: string | undefined) => void
}

export function RegionPickerContent({ currentRegion, onSelect }: RegionPickerContentProps) {
  const [selectedCity, setSelectedCity] = useState<string | null>(() => {
    if (!currentRegion) return null
    const city = currentRegion.split(" ")[0]
    return CITY_LIST.includes(city) ? city : null
  })

  // ── 시/도 목록 (1 depth) ──
  if (!selectedCity) {
    return (
      <div className="flex flex-col">
        {/* 전체 (초기화) */}
        <button
          onClick={() => onSelect(undefined)}
          className={cn(
            "hover:bg-muted/50 flex items-center justify-between px-5 py-3.5 text-left transition-colors",
            !currentRegion && "bg-primary/5",
          )}
        >
          <Text as="span" typography="body2-medium" className="text-foreground">
            전체
          </Text>
          {!currentRegion && <Check className="text-primary h-4 w-4" />}
        </button>

        {CITY_LIST.map((city) => {
          const isCurrentCity = currentRegion?.startsWith(city)
          return (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={cn(
                "hover:bg-muted/50 flex items-center justify-between px-5 py-3.5 text-left transition-colors",
                isCurrentCity && "bg-primary/5",
              )}
            >
              <Text as="span" typography="body2-medium" className="text-foreground">
                {city}
              </Text>
              {isCurrentCity && (
                <Text as="span" typography="caption1-medium" className="text-primary">
                  {currentRegion?.split(" ").slice(1).join(" ")}
                </Text>
              )}
            </button>
          )
        })}
      </div>
    )
  }

  // ── 구/시/군 목록 (2 depth) ──
  const districts = REGION_MAP[selectedCity] ?? []

  return (
    <div className="flex flex-col">
      {/* 뒤로가기 헤더 */}
      <button
        onClick={() => setSelectedCity(null)}
        className="hover:bg-muted/50 border-border/50 flex items-center gap-2 border-b px-4 py-3 transition-colors"
      >
        <ChevronLeft className="text-foreground h-4 w-4" />
        <Text as="span" typography="body2-bold" className="text-foreground">
          {selectedCity}
        </Text>
      </button>

      {/* 시/도 전체 */}
      <button
        onClick={() => {
          onSelect(selectedCity)
        }}
        className={cn(
          "hover:bg-muted/50 flex items-center justify-between px-5 py-3.5 text-left transition-colors",
          currentRegion === selectedCity && "bg-primary/5",
        )}
      >
        <Text as="span" typography="body2-medium" className="text-foreground">
          {selectedCity} 전체
        </Text>
        {currentRegion === selectedCity && <Check className="text-primary h-4 w-4" />}
      </button>

      {districts.map((district) => {
        const fullRegion = `${selectedCity} ${district}`
        const isSelected = currentRegion === fullRegion
        return (
          <button
            key={district}
            onClick={() => onSelect(fullRegion)}
            className={cn(
              "hover:bg-muted/50 flex items-center justify-between px-5 py-3.5 text-left transition-colors",
              isSelected && "bg-primary/5",
            )}
          >
            <Text as="span" typography="body2-medium" className="text-foreground">
              {district}
            </Text>
            {isSelected && <Check className="text-primary h-4 w-4" />}
          </button>
        )
      })}
    </div>
  )
}
