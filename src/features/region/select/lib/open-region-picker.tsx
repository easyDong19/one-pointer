"use client"

import { overlay } from "overlay-kit"
import { RegionPickerOverlay } from "../ui/region-picker-overlay"

/**
 * overlay-kit을 통해 지역 선택 오버레이를 열고,
 * 사용자가 선택한 region 값을 Promise로 반환한다.
 *
 * @param currentRegion - 현재 선택된 지역 값
 * @returns 선택된 지역 문자열 또는 undefined(전체). 닫기만 한 경우 null.
 *
 * @example
 * const region = await openRegionPicker(state.region)
 * if (region !== null) actions.setRegion(region)
 */
export function openRegionPicker(
  currentRegion: string | undefined,
): Promise<string | undefined | null> {
  return new Promise((resolve) => {
    overlay.open(({ isOpen, close, unmount }) => {
      return (
        <RegionPickerOverlay
          isOpen={isOpen}
          currentRegion={currentRegion}
          onSelect={(region) => {
            resolve(region)
            close()
            setTimeout(unmount, 300)
          }}
          onClose={() => {
            resolve(null)
            close()
            setTimeout(unmount, 300)
          }}
        />
      )
    })
  })
}
