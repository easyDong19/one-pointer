import { create } from "zustand"
import { persist } from "zustand/middleware"

type Role = "client" | "expert"

type RoleStore = {
  role: Role
  setRole: (role: Role) => void
  toggleRole: () => void
}

export const useRoleStore = create<RoleStore>()(
  persist(
    (set, get) => ({
      role: "client",
      setRole: (role) => set({ role }),
      toggleRole: () =>
        set({ role: get().role === "client" ? "expert" : "client" }),
    }),
    {
      name: "one-pointer-role",
    },
  ),
)
