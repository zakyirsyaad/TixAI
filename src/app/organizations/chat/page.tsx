"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createChat } from "@/tools/chat-store";

export default function ChatPage() {
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const createNewChat = async () => {
      try {
        const id = await createChat();
        if (isMounted) {
          router.push(`/organizations/chat/${id}`);
        }
      } catch (error) {
        console.error("Error creating chat:", error);
        if (isMounted) {
          router.push("/organizations/chat/list");
        }
      }
    };

    createNewChat();

    return () => {
      isMounted = false;
    };
  }, [router]); // Empty dependency array - run only once

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Creating new chat...</div>
      </div>
    </div>
  );
}
