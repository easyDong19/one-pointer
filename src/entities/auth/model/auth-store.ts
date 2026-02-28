import { create } from "zustand"
import { isApiError } from "@/shared/api/http/api-error"
import { getMyProfile, type AuthUser } from "@/entities/auth/api/auth.service"

type AuthStatus = "idle" | "loading" | "authenticated" | "unauthenticated" | "error"

type AuthStore = {
  status: AuthStatus
  initialized: boolean
  user: AuthUser | null
  bootstrap: () => Promise<void>
  setAuthenticated: (user: AuthUser) => void
  setUnauthenticated: () => void
}

let bootstrapLock: Promise<void> | null = null

export const useAuthStore = create<AuthStore>((set, get) => ({
  status: "idle",
  initialized: false,
  user: null,
  bootstrap: async () => {
    if (get().initialized) {
      return
    }

    if (bootstrapLock) {
      await bootstrapLock
      return
    }

    bootstrapLock = (async () => {
      set({ status: "loading" })

      try {
        const profile = await getMyProfile()
        set({
          status: "authenticated",
          initialized: true,
          user: profile,
        })
        return
      } catch (error) {
        if (isApiError(error) && error.status === 401) {
          set({
            status: "unauthenticated",
            initialized: true,
            user: null,
          })
          return
        }

        set({
          status: "error",
          initialized: true,
        })
      }
    })().finally(() => {
      bootstrapLock = null
    })

    await bootstrapLock
  },
  setAuthenticated: (user) =>
    set({
      status: "authenticated",
      initialized: true,
      user,
    }),
  setUnauthenticated: () =>
    set({
      status: "unauthenticated",
      initialized: true,
      user: null,
    }),
}))

export function syncAuthStateFromError(error: unknown) {
  if (isApiError(error) && error.status === 401) {
    useAuthStore.getState().setUnauthenticated()
  }
}
