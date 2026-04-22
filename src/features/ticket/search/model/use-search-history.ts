"use client"

import { useCallback, useSyncExternalStore } from "react"

/**
 * 검색 히스토리 localStorage 훅.
 *
 * - Key: "ticket.search.history"
 * - 최대 10개 (초과 시 오래된 것부터 제거)
 * - 중복 추가 시 기존 제거 후 맨 앞에 재삽입 (LRU)
 * - SSR 안전: server snapshot 은 빈 배열
 * - 다중 인스턴스 싱크: 같은 탭은 CustomEvent, 다른 탭은 `storage` 이벤트
 * - 구현: `useSyncExternalStore` (React 19 권장 패턴)
 */

const STORAGE_KEY = "ticket.search.history"
const MAX_HISTORY = 10
const SYNC_EVENT = "ticket.search.history.change"
const EMPTY: readonly string[] = []

/* ─── Snapshot cache ─────────────────────────────────────────────────────── */

// useSyncExternalStore 는 snapshot 의 referential stability 를 요구하므로
// 동일 raw 문자열일 때는 같은 배열 참조를 돌려줘야 한다.
let cachedRaw: string | null | undefined = undefined
let cachedParsed: string[] = EMPTY as string[]

function getSnapshot(): string[] {
  if (typeof window === "undefined") return cachedParsed
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (raw === cachedRaw) return cachedParsed
  cachedRaw = raw
  if (!raw) {
    cachedParsed = EMPTY as string[]
    return cachedParsed
  }
  try {
    const parsed = JSON.parse(raw)
    cachedParsed = Array.isArray(parsed)
      ? parsed.filter((v): v is string => typeof v === "string")
      : (EMPTY as string[])
  } catch {
    cachedParsed = EMPTY as string[]
  }
  return cachedParsed
}

function getServerSnapshot(): string[] {
  return EMPTY as string[]
}

function subscribe(callback: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) callback()
  }
  window.addEventListener("storage", onStorage)
  window.addEventListener(SYNC_EVENT, callback)
  return () => {
    window.removeEventListener("storage", onStorage)
    window.removeEventListener(SYNC_EVENT, callback)
  }
}

/* ─── Write helpers ──────────────────────────────────────────────────────── */

function writeStorage(next: string[]) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    window.dispatchEvent(new CustomEvent(SYNC_EVENT))
  } catch {
    // 쿼터 초과 / private 모드 등 silent fail
  }
}

/* ─── Hook ───────────────────────────────────────────────────────────────── */

export function useSearchHistory() {
  const history = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const add = useCallback((keyword: string) => {
    const trimmed = keyword.trim()
    if (!trimmed) return
    const current = getSnapshot()
    const deduped = current.filter((k) => k !== trimmed)
    const next = [trimmed, ...deduped].slice(0, MAX_HISTORY)
    writeStorage(next)
  }, [])

  const remove = useCallback((keyword: string) => {
    const current = getSnapshot()
    writeStorage(current.filter((k) => k !== keyword))
  }, [])

  const clear = useCallback(() => {
    writeStorage([])
  }, [])

  return { history, add, remove, clear }
}
