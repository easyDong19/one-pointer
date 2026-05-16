"use client"

import { create } from "zustand"

import type {
  BudgetType,
  EstimatedDurationUnit,
  TicketDetail,
  TicketLevel,
  TicketType,
} from "@/entities/ticket/api/ticket.schema"

export type TicketFormMode = "create" | "edit"

export type DesiredDateInput = {
  /** YYYY-MM-DD 또는 빈 문자열 (미선택) */
  date: string
  /** "HH:mm" 또는 빈 문자열 (미선택) */
  timeSlot: string
}

type FormState = {
  // Step 1 — 유형 & 카테고리 (+ 오프라인 위치)
  ticketType: TicketType | null
  selectedMajorCategoryId: number | null
  subCategoryId: number | null
  region: string | null
  locationDetail: string

  // Step 2 — 의뢰 내용
  title: string
  content: string
  /** uploadImages 호출 전의 로컬 File 배열 (최대 3) */
  localImages: File[]
  level: TicketLevel | null

  // Step 3 — 시간 & 예산
  estimatedDurationValue: number | null
  estimatedDurationUnit: EstimatedDurationUnit | null
  isNegotiableDuration: boolean
  budgetType: BudgetType | null
  budgetMin: number | null
  budgetMax: number | null

  // Step 4 — 희망 일시 (다중)
  desiredDates: DesiredDateInput[]

  // 직접의뢰 진입 시 prefill
  targetExpertId: number | null
  directRequest: boolean

  // edit mode (Wave 13) — 신규 작성에서는 항상 "create"/null/[]
  mode: TicketFormMode
  editingTicketId: number | null
  /** 편집 시 기존에 업로드된 이미지 URL (사용자가 X 로 지움 → 배열에서 제거) */
  existingImageUrls: string[]
}

type FormActions = {
  setField: <K extends keyof FormState>(key: K, value: FormState[K]) => void
  setBudgetType: (value: BudgetType) => void
  setNegotiableDuration: (negotiable: boolean) => void
  addLocalImage: (file: File) => void
  removeLocalImage: (index: number) => void
  removeExistingImage: (url: string) => void
  addDesiredDate: () => void
  updateDesiredDate: (index: number, patch: Partial<DesiredDateInput>) => void
  removeDesiredDate: (index: number) => void
  initFromTicket: (ticket: TicketDetail) => void
  reset: () => void
}

const initialState: FormState = {
  ticketType: "ONLINE", // mobile default
  selectedMajorCategoryId: null,
  subCategoryId: null,
  region: null,
  locationDetail: "",

  title: "",
  content: "",
  localImages: [],
  level: null,

  estimatedDurationValue: null,
  estimatedDurationUnit: null,
  isNegotiableDuration: false,
  budgetType: null,
  budgetMin: null,
  budgetMax: null,

  desiredDates: [{ date: "", timeSlot: "" }],

  targetExpertId: null,
  directRequest: false,

  mode: "create",
  editingTicketId: null,
  existingImageUrls: [],
}

const MAX_IMAGES = 3

/**
 * Wave 1.5 wizard 폼 state — 모바일 CreateTicketController 와 동일 구조.
 *
 * step 간 nav 시 unmount 되지 않도록 zustand 단일 store 로 보존. 제출 후 reset().
 */
export const useTicketCreateForm = create<FormState & FormActions>(
  (set) => ({
    ...initialState,

    setField: (key, value) => set({ [key]: value } as Partial<FormState>),

    setBudgetType: (value) =>
      set((state) => ({
        budgetType: value,
        // NEGOTIABLE 전환 시 입력값 초기화 — 부정확한 데이터 방지
        budgetMin: value === "NEGOTIABLE" ? null : state.budgetMin,
        budgetMax: value === "NEGOTIABLE" ? null : state.budgetMax,
      })),

    setNegotiableDuration: (negotiable) =>
      set(
        negotiable
          ? {
              isNegotiableDuration: true,
              estimatedDurationValue: null,
              estimatedDurationUnit: null,
            }
          : { isNegotiableDuration: false },
      ),

    addLocalImage: (file) =>
      set((state) =>
        state.localImages.length >= MAX_IMAGES
          ? {}
          : { localImages: [...state.localImages, file] },
      ),

    removeLocalImage: (index) =>
      set((state) => ({
        localImages: state.localImages.filter((_, i) => i !== index),
      })),

    removeExistingImage: (url) =>
      set((state) => ({
        existingImageUrls: state.existingImageUrls.filter((u) => u !== url),
      })),

    addDesiredDate: () =>
      set((state) => ({
        desiredDates: [...state.desiredDates, { date: "", timeSlot: "" }],
      })),

    updateDesiredDate: (index, patch) =>
      set((state) => ({
        desiredDates: state.desiredDates.map((d, i) =>
          i === index ? { ...d, ...patch } : d,
        ),
      })),

    removeDesiredDate: (index) =>
      set((state) => ({
        // 항상 1행 이상 유지
        desiredDates:
          state.desiredDates.length > 1
            ? state.desiredDates.filter((_, i) => i !== index)
            : state.desiredDates,
      })),

    initFromTicket: (ticket) =>
      set({
        ...initialState,
        mode: "edit",
        editingTicketId: ticket.id,

        ticketType: ticket.ticketType,
        selectedMajorCategoryId: null, // category 그룹 id 는 서버 응답에 없음 — step UI 가 subCategoryId 로부터 역추적
        subCategoryId: ticket.subCategoryId,
        region: ticket.region ?? null,
        locationDetail: ticket.locationDetail ?? "",

        title: ticket.title,
        content: ticket.content,
        localImages: [],
        existingImageUrls: (ticket.images ?? []).map((img) => img.imageUrl),
        level: ticket.level,

        estimatedDurationValue: ticket.estimatedDurationValue ?? null,
        estimatedDurationUnit: ticket.estimatedDurationUnit ?? null,
        isNegotiableDuration:
          ticket.estimatedDurationValue == null &&
          ticket.estimatedDurationUnit == null,
        budgetType: ticket.budgetType,
        budgetMin: ticket.budgetMin ?? null,
        budgetMax: ticket.budgetMax ?? null,

        desiredDates:
          ticket.desiredDates.length > 0
            ? ticket.desiredDates.map((d) => ({
                date: d.date,
                timeSlot: d.timeSlot,
              }))
            : [{ date: "", timeSlot: "" }],

        targetExpertId: ticket.targetExpertId ?? null,
        directRequest: false,
      }),

    reset: () => set(initialState),
  }),
)

export const TICKET_CREATE_MAX_IMAGES = MAX_IMAGES
