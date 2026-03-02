"use client"

import { Text } from "@/shared/ui/text"
import { ApiError } from "@/shared/api/http/api-error"
import { useMyProfileQuery } from "@/features/auth/me/model/use-my-profile-query"
import { LogoutButton } from "@/features/auth/sign-out/ui/logout-button"

export function HomeMyProfile() {
  const { data, isLoading, error } = useMyProfileQuery()

  if (isLoading) {
    return <Text typography="body2-regular">Loading my profile...</Text>
  }

  if (error) {
    const message = error instanceof ApiError ? error.message : "Failed to load my profile"
    return (
      <Text typography="body2-medium" className="text-destructive">
        {message}
      </Text>
    )
  }

  if (!data) {
    return <Text typography="body2-regular">No profile data.</Text>
  }

  return (
    <section className="space-y-3">
      <Text as="h2" typography="subtitle2-bold">
        My Profile
      </Text>
      <Text typography="body2-regular">
        {data.name} ({data.email})
      </Text>
      <Text typography="caption1-medium" className="text-muted-foreground">
        role: {data.role} / status: {data.status}
      </Text>
      <LogoutButton />
    </section>
  )
}
