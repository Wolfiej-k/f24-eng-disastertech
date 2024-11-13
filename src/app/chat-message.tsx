import { ChatBubble, ChatBubbleMessage } from "@/components/ui/chat/chat-bubble";

export interface Message {
  content: string;
  type: "query" | "response";
  time: Date;
}

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isQuery = message.type === "query";
  const time = new Date(message.time);

  return (
    <>
      <ChatBubble variant={isQuery ? "sent" : "received"}>
        <ChatBubbleMessage isLoading={!message.content}>
          {message.content}
          <div className={`mt-1 text-xs ${isQuery ? "text-gray-200" : "text-gray-500"}`}>
            {time
              .toLocaleTimeString([], {
                year: "numeric",
                month: "numeric",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
              .split("T")
              .join(", ")}
          </div>
        </ChatBubbleMessage>
      </ChatBubble>
    </>
  );
}
