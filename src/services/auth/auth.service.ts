import { clientFetch } from "@/src/lib/http/client-fetch"

export type AuthUser = Record<string, unknown>

export function getMyProfile() {
  return clientFetch<AuthUser>({
    path: "/auth/me",
    method: "GET",
  })
}
