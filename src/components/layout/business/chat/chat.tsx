"use client";

import { useChat, Message } from "@ai-sdk/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function Chat({
  id,
  initialMessages,
}: {
  id?: string;
  initialMessages?: Message[];
}) {
  const {
    input,
    handleInputChange,
    handleSubmit,
    messages,
    isLoading,
    error,
    append,
  } = useChat({
    id,
    initialMessages,
    sendExtraMessageFields: true,
    experimental_prepareRequestBody({ messages, id }) {
      return { message: messages[messages.length - 1], id };
    },
  });

  const searchParams = useSearchParams();
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  // Trigger streaming AI response if opened with ?initial=1
  useEffect(() => {
    const shouldStart = searchParams.get("initial") === "1";
    if (shouldStart && initialMessages?.length) {
      const lastUserMsg = initialMessages.at(-1);
      if (lastUserMsg?.role === "user") {
        append({
          role: "assistant",
          content: "",
        });
      }
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const displayError = error || localError;

  return (
    <div className="flex flex-col h-[600px] max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/organizations/chat")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Chats
        </Button>
        <h1 className="text-lg font-semibold">Chat Conversation</h1>
        {id && (
          <span className="text-sm text-muted-foreground ml-auto">
            ID: {id}
          </span>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, idx) => (
          <div
            key={m.id || m.content + m.role + idx}
            className={cn(
              "flex w-full",
              m.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "rounded-lg px-4 py-2 max-w-[80%]",
                m.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              )}
            >
              <div className="text-sm font-medium mb-1">
                {m.role === "user" ? "You" : "AI Assistant"}
              </div>
              <div className="whitespace-pre-wrap">{m.content}</div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg px-4 py-2">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {displayError && (
        <div className="p-4 text-sm text-destructive bg-destructive/10 rounded-lg mx-4">
          <strong>Error:</strong>{" "}
          {typeof displayError === "string"
            ? displayError
            : displayError.message}
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={handleInputChange}
            placeholder="Type your message..."
            className="min-h-[60px] resize-none"
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !input.trim()}
            className="self-end"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
