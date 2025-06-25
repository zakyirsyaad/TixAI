"use client";

import React, { useRef, useEffect } from "react";
import { Message, useChat } from "@ai-sdk/react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

import {
  AIConversation,
  AIConversationContent,
  AIConversationScrollButton,
} from "@/components/ui/kibo-ui/ai/conversation";
import {
  AIInput,
  AIInputButton,
  AIInputModelSelect,
  AIInputModelSelectContent,
  AIInputModelSelectItem,
  AIInputModelSelectTrigger,
  AIInputModelSelectValue,
  AIInputSubmit,
  AIInputTextarea,
  AIInputToolbar,
  AIInputTools,
} from "@/components/ui/kibo-ui/ai/input";
import { GlobeIcon, MicIcon, PlusIcon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
// import {
//   AIMessage,
//   AIMessageContent,
// } from "@/components/ui/kibo-ui/ai/message";

const codeStyle = vscDarkPlus;

interface ChatBubbleProps {
  role: "user" | "assistant";
  children: React.ReactNode;
  logo?: string;
  nameInitial: string;
}

interface ToolInvocationResult {
  to: string;
  amount: string;
}

interface ToolInvocation {
  toolName: string;
  toolCallId: string;
  state: "running" | "result";
  result?: ToolInvocationResult;
  txHash?: string;
}

// Replace all 'any' with explicit types:
type MarkdownComponentProps = React.PropsWithChildren<
  React.HTMLAttributes<HTMLElement>
>;

const ChatBubble: React.FC<ChatBubbleProps> = ({
  role,
  children,
  logo,
  nameInitial,
}) => {
  const isUser = role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`flex mb-5 ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-prose p-4 rounded-lg flex shadow ${
          isUser ? "bg-primary text-primary-foreground" : "bg-secondary"
        }`}
      >
        <div className="prose prose-sm dark:prose-invert overflow-x-auto">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({
                inline,
                className,
                children,
                ...props
              }: {
                inline?: boolean;
                className?: string;
                children?: React.ReactNode;
              }) {
                const match = /language-(\w+)/.exec(className || "");
                return !inline && match ? (
                  <SyntaxHighlighter
                    style={codeStyle}
                    language={match[1]}
                    PreTag="div"
                    {...props}
                  >
                    {String(children).replace(/\n$/, "")}
                  </SyntaxHighlighter>
                ) : (
                  <code
                    className="bg-gray-100 dark:bg-gray-800 rounded px-1 "
                    {...props}
                  >
                    {children}
                  </code>
                );
              },
              p: (props: MarkdownComponentProps) => (
                <p className="mb-2" {...props} />
              ),
              ul: (props: MarkdownComponentProps) => (
                <ul className="list-disc pl-5 mb-2" {...props} />
              ),
              ol: (props: MarkdownComponentProps) => (
                <ol className="list-decimal pl-5 mb-2" {...props} />
              ),
              li: (props: MarkdownComponentProps) => (
                <li className="mb-1" {...props} />
              ),
              blockquote: (props: MarkdownComponentProps) => (
                <blockquote
                  className="border-l-4 border-gray-300 pl-4 italic my-2"
                  {...props}
                />
              ),
            }}
          >
            {children as string}
          </ReactMarkdown>
        </div>
      </div>
    </motion.div>
  );
};

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

  const [visibleMessages, setVisibleMessages] = React.useState<Message[]>([]);

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

  useEffect(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < messages.length) {
        setVisibleMessages((prev) => [...prev, messages[currentIndex]]);
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Dummy function for renderToolInvocations
  function renderToolInvocations(toolInvocations: any) {
    return null;
  }

  return (
    <div className="space-y-5">
      <ScrollArea className=" h-[550px]">
        <AIConversation>
          <AIConversationContent>
            <AnimatePresence initial={false} mode="wait">
              {visibleMessages.map((msg, idx) => (
                <ChatBubble
                  key={msg.id ?? idx}
                  role={msg.role as "user" | "assistant"}
                  nameInitial={msg.role === "user" ? "U" : "A"}
                >
                  {msg.content}
                </ChatBubble>
              ))}
            </AnimatePresence>
          </AIConversationContent>
          <AIConversationScrollButton />
        </AIConversation>
      </ScrollArea>

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
            {/* <AIInputModelSelect onValueChange={setModel} value={model}>
              <AIInputModelSelectTrigger>
                <AIInputModelSelectValue />
              </AIInputModelSelectTrigger>
              <AIInputModelSelectContent>
                {models.map((model) => (
                  <AIInputModelSelectItem key={model.id} value={model.id}>
                    {model.name}
                  </AIInputModelSelectItem>
                ))}
              </AIInputModelSelectContent>
            </AIInputModelSelect> */}
          </AIInputTools>
          <AIInputSubmit disabled={!input} />
        </AIInputToolbar>
      </AIInput>
    </div>
  );
}
