export const chatQueryKeys = {
  all: ["chat"] as const,
  rooms: (params?: { cursor?: string; size?: number }) => ["chat", "rooms", params] as const,
  roomMessages: (roomId: number, params?: { cursor?: string; size?: number }) =>
    ["chat", "rooms", roomId, "messages", params] as const,
}
