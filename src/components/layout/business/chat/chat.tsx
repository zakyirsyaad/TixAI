"use client";

import { Input } from "@/components/ui/input";
import { Message, useChat } from "@ai-sdk/react";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function Chat({
  id,
  initialMessages,
}: {
  id?: string;
  initialMessages?: Message[];
}) {
  const { input, handleInputChange, handleSubmit, messages, append } = useChat({
    id,
    initialMessages,
    sendExtraMessageFields: true,
  });

  const searchParams = useSearchParams();

  // Jika halaman dipanggil dari awal (setelah chat baru dibuat)
  useEffect(() => {
    const shouldStart = searchParams.get("initial") === "1";
    if (shouldStart && initialMessages?.length) {
      const lastUserMsg = initialMessages.at(-1);
      if (lastUserMsg?.role === "user") {
        append({
          role: "assistant",
          content: "",
        }); // trigger AI response via useChat
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-4 p-4">
      <div className="space-y-2">
        {messages.map((m, idx) => (
          <div key={m.id || m.content + m.role + idx}>
            <strong>{m.role === "user" ? "User" : "AI"}:</strong> {m.content}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="mt-4">
        <Input
          value={input}
          onChange={handleInputChange}
          placeholder="Type your message..."
        />
      </form>
    </div>
  );
}
