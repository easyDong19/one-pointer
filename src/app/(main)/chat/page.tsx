import { ChatNoSelection } from "@/features/chat/list/ui/chat-no-selection"

export const metadata = {
  title: "채팅",
}

/**
 * `/chat` 진입.
 *
 * - 모바일: layout 이 main 슬롯을 hidden 처리하므로 이 컴포넌트는 화면에 노출되지 않는다.
 *   사용자는 layout 의 sidebar (full-width) 만 보게 된다.
 * - 데스크탑: 좌측 sidebar + 우측 이 empty state.
 */
export default function ChatPage() {
  return <ChatNoSelection />
}
