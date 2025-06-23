"use client";
import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { createChat } from "@/tools/chat-store";
import { useRouter } from "next/navigation";
import useGetUser from "@/hooks/getUser";

export default function ChatBox() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const MAX_LENGTH = 2000;
  const router = useRouter();

  const { user } = useGetUser();

  async function createNewChat() {
    if (!message.trim() || isCreating) return;
    if (!user) return;

    try {
      setIsCreating(true);
      setError(null);

      const chatId = await createChat({
        userId: user.id,
        message,
      });

      // Pass `initialMessage` via query param (or use Supabase)
      router.push(`/organizations/chat/${chatId}?initial=1`);
    } catch (err) {
      console.error("Chat creation error:", err);
      setError(err instanceof Error ? err.message : "Failed to create chat.");
    } finally {
      setIsCreating(false);
    }
  }

  const handleKeyPress = async (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      createNewChat();
    }
  };

  return (
    <section className="space-y-5 mt-10">
      <h1 className="text-center text-5xl font-medium">
        How Can TixAI Assist You?
      </h1>
      <div className="relative">
        <Textarea
          className="resize-none h-40 bg-secondary overflow-hidden"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          maxLength={MAX_LENGTH}
          placeholder="Type your message here..."
          disabled={isCreating}
        />
        <Button
          size={"icon"}
          variant={"outline"}
          className="absolute right-3 bottom-3 z-20"
          onClick={createNewChat}
          disabled={isCreating || !message.trim()}
        >
          {isCreating ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
          ) : (
            <ArrowRight />
          )}
        </Button>
        <p className="absolute left-3 bottom-3 z-20 text-muted-foreground">
          {message.length}/{MAX_LENGTH}
        </p>
      </div>
      {error && <p className="text-destructive text-center mt-2">{error}</p>}
    </section>
  );
}
