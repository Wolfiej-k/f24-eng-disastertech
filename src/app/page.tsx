import Header from "@/components/ui/header";
import ChatBox from "./chat-box";

export default async function Home() {
  return (
    <>
      <Header title="Welcome to Disaster Tech Lab!" subtitle="Send a message to chat with the Disaster Bot." />
      <ChatBox />
    </>
  );
}
