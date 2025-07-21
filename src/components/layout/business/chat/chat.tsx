"use client";

import React, { useEffect, useState } from "react";
import { Message, useChat } from "@ai-sdk/react";
import { useSearchParams } from "next/navigation";

import {
  AIConversation,
  AIConversationContent,
  AIConversationScrollButton,
} from "@/components/ui/kibo-ui/ai/conversation";
import {
  AIInput,
  AIInputButton,
  AIInputSubmit,
  AIInputTextarea,
  AIInputToolbar,
  AIInputTools,
} from "@/components/ui/kibo-ui/ai/input";
import { GlobeIcon, MicIcon, PlusIcon } from "lucide-react";
import {
  AIMessage,
  AIMessageContent,
} from "@/components/ui/kibo-ui/ai/message";

import { AIResponse } from "@/components/ui/kibo-ui/ai/response";
import {
  AITool,
  AIToolResult,
  AIToolContent,
  AIToolParameters,
  AIToolHeader,
} from "@/components/ui/kibo-ui/ai/tool";
import { ChartRenderer } from "@/components/ui/kibo-ui/ai/chart-renderer";
import {
  AISuggestion,
  AISuggestions,
} from "@/components/ui/kibo-ui/ai/suggestion";
import useGetUser from "@/hooks/getUser";

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
  const { user } = useGetUser();
  const searchParams = useSearchParams();
  const [autoTriggered, setAutoTriggered] = useState(false);

  // Jika halaman dipanggil dari awal (setelah chat baru dibuat)
  useEffect(() => {
    if (!user || autoTriggered) return; // Jangan trigger jika user belum siap atau sudah pernah trigger
    const shouldStart = searchParams.get("initial") === "1";
    if (shouldStart && initialMessages?.length) {
      const lastUserMsg = initialMessages.at(-1);
      // Cek jika pesan terakhir user dan belum ada balasan assistant
      const hasAssistantReply = initialMessages.some(
        (msg, idx) =>
          msg.role === "assistant" && idx > initialMessages.length - 2
      );
      if (lastUserMsg?.role === "user" && !hasAssistantReply) {
        append({
          role: "assistant",
          content: "",
        });
        setAutoTriggered(true); // Supaya tidak retrigger
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, autoTriggered]);

  return (
    <div>
      <AIConversation>
        <AIConversationContent>
          {messages
            .filter(
              (message) =>
                message.role === "user" || message.role === "assistant"
            )
            .map(({ content, ...message }, index) => (
              <AIMessage
                from={message.role as "user" | "assistant"}
                key={index}
              >
                <AIMessageContent>
                  <AIResponse className="mb-5">{content}</AIResponse>
                  {message.toolInvocations?.map((toolCall, toolIndex) => (
                    <AITool key={`${toolCall.toolName}-${toolIndex}`}>
                      <AIToolHeader
                        description={toolCall.toolName}
                        name={toolCall.toolName}
                        status={
                          toolCall.state === "result" ? "completed" : "running"
                        }
                      />
                      <AIToolContent>
                        <AIToolParameters parameters={toolCall.args} />
                        {toolCall.state === "result" && (
                          <AIToolResult
                            result={
                              toolCall.toolName === "generateChart" &&
                              toolCall.result?.chart ? (
                                <ChartRenderer
                                  chartData={toolCall.result.chart}
                                />
                              ) : (
                                <AIResponse>
                                  {JSON.stringify(toolCall.result, null, 2)}
                                </AIResponse>
                              )
                            }
                          />
                        )}
                      </AIToolContent>
                    </AITool>
                  ))}
                </AIMessageContent>
              </AIMessage>
            ))}
        </AIConversationContent>
        <AIConversationScrollButton />
      </AIConversation>

      <AISuggestions>
        {suggestions.map((suggestion) => (
          <AISuggestion
            key={suggestion}
            // onClick={handleSuggestionClick}
            suggestion={suggestion}
          />
        ))}
      </AISuggestions>
      <AIInput onSubmit={handleSubmit}>
        <AIInputTextarea value={input} onChange={handleInputChange} />
        <AIInputToolbar>
          <AIInputTools>
            <AIInputButton>
              <PlusIcon size={16} />
            </AIInputButton>
            <AIInputButton>
              <MicIcon size={16} />
            </AIInputButton>
            <AIInputButton>
              <GlobeIcon size={16} />
              <span>Search</span>
            </AIInputButton>
          </AIInputTools>
          <AIInputSubmit disabled={!input} />
        </AIInputToolbar>
      </AIInput>
    </div>
  );
}

const suggestions = [
  "What are the latest trends in AI?",
  "How does machine learning work?",
  "Explain quantum computing",
  "Best practices for React development",
  "Tell me about TypeScript benefits",
  "How to optimize database queries?",
  "What is the difference between SQL and NoSQL?",
  "Explain cloud computing basics",
];
