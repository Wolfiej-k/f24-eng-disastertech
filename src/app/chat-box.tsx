"use client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ChatInput } from "@/components/ui/chat/chat-input";
import { ChatMessageList } from "@/components/ui/chat/chat-message-list";
import { SendHorizontal, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import ChatMessage, { Message } from "./chat-message";

export default function ChatBox() {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const pushHistory = (message: Message) => {
    setHistory((prevHistory) => {
      const newHistory = [...prevHistory, message];
      localStorage.setItem("messageHistory", JSON.stringify(newHistory));
      return newHistory;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.setItem("messageHistory", JSON.stringify([]));
    window.location.reload();
  };

  const updateRecent = (message: Message) => {
    setHistory((prevHistory) => {
      const newHistory = [...prevHistory.slice(0, -1), message];
      localStorage.setItem("messageHistory", JSON.stringify(newHistory));
      return newHistory;
    });
  };

  useEffect(() => {
    const storedJson = localStorage.getItem("messageHistory");
    const storedHistory = storedJson ? JSON.parse(storedJson) : [];

    if (storedHistory) {
      setHistory(storedHistory);
    } else {
      pushHistory({
        content: "Hi! How can I help you?",
        type: "response",
        time: new Date(),
      });
    }
  }, []);

  const onSubmit = async () => {
    if (!input) {
      return;
    }

    const query = input;
    setInput("");
    setIsLoading(true);
    window.scrollTo(0, document.body.scrollHeight);

    pushHistory({
      content: query,
      type: "query",
      time: new Date(),
    });

    pushHistory({
      content: "",
      type: "response",
      time: new Date(),
    });

    const message: Message = {
      content: "",
      type: "response",
      time: new Date(),
    };

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: query }),
      });

      if (!response.ok || !response.body) {
        throw Error("Query failed");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        message.content = buffer;
        updateRecent(message);
      }

      if (buffer == "") {
        throw Error("Query failed");
      }
    } catch {
      message.content = "Query failed. Please try again.";
      updateRecent(message);
    }

    window.scrollTo(0, document.body.scrollHeight);
    setIsLoading(false);
  };

  return (
    <>
      <div className="m-8 flex h-full flex-col">
        <div className="flex-grow overflow-y-auto" style={{ marginBottom: "90px", overscrollBehavior: "contain" }}>
          <ChatMessageList className="overflow-y-auto">
            {history.map((message, index) => (
              <ChatMessage message={message} key={index} />
            ))}
          </ChatMessageList>
        </div>

        <div className="flex-shrink-0">
          <div className="fixed inset-x-4 bottom-0 flex items-center bg-white p-4 shadow-md">
            <form
              className="flex w-full items-center rounded-lg border bg-background p-2 focus-within:ring-1 focus-within:ring-ring"
              onSubmit={(e) => {
                e.preventDefault();
                onSubmit();
              }}
            >
              <ChatInput
                placeholder="Type your message here..."
                className="min-h-12 flex-grow resize-none rounded-lg border-0 bg-background p-3 shadow-none focus-visible:ring-0"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    onSubmit();
                  }
                }}
              />
              <Button type="submit" size="sm" className="ml-4 gap-1.5" disabled={isLoading || !input}>
                <SendHorizontal />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button className="ml-2 gap-1.5" size="sm" variant="destructive">
                    <Trash2 />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will clear your local chat history. It cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={clearHistory}>Continue</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
