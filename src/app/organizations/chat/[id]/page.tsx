import { loadChat } from "@/tools/chat-store";
import Chat from "@/components/layout/business/chat/chat";
import { redirect } from "next/navigation";

export default async function Page(props: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await props.params; // get the chat ID from the URL

    if (!id) {
      console.error("No chat ID provided");
      redirect("/organizations/chat");
    }

    const messages = await loadChat(id); // load the chat messages
    return <Chat id={id} initialMessages={messages} />; // display the chat
  } catch (error) {
    console.error("Error loading chat:", error);

    // If it's a specific error about chat not found or user not authenticated, redirect
    if (error instanceof Error) {
      if (
        error.message.includes("not found") ||
        error.message.includes("not authenticated") ||
        error.message.includes("User not authenticated")
      ) {
        redirect("/organizations/chat");
      }
    }

    // For other errors, redirect to chat list
    redirect("/organizations/chat");
  }
}
