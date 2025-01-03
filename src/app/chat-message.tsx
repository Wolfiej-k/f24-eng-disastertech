import { ChatBubble, ChatBubbleMessage } from "@/components/ui/chat/chat-bubble";
import Link from "next/link";

export interface Message {
  content: string;
  type: "query" | "response";
  sources?: number[];
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
            {message.sources && message.sources.length > 0 && (
              <span>
                , Sources:
                {message.sources.map((source) => (
                  <span key={source} className="ml-1">
                    <Link
                      className="inline-flex items-center rounded-full bg-blue-100 p-1 text-xs font-medium text-blue-800"
                      href={`/documents/${source}`}
                    >
                      {source}
                    </Link>
                  </span>
                ))}
              </span>
            )}
          </div>
        </ChatBubbleMessage>
      </ChatBubble>
    </>
  );
}
