import { createClient } from "@/utils/supabase/client";
import { generateId, Message } from "ai";

const supabase = await createClient();

export async function createChat({
  userId,
  message,
}: {
  userId: string;
  message?: string;
}): Promise<string> {
  const chatId = generateId();

  const messages = message ? [{ role: "user", content: message }] : [];

  const { error } = await supabase.from("chats").insert([
    {
      id: chatId,
      user_id: userId,
      title: message?.slice(0, 100) || "New Chat",
      messages,
    },
  ]);

  if (error) throw new Error(error.message);
  return chatId;
}

export async function getChat(id: string) {
  const { data, error } = await supabase
    .from("chats")
    .select("messages")
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(`Failed to fetch chat: ${error.message}`);
  }

  return data.messages;
}

export async function loadChat(id: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from("chats")
    .select("messages")
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);

  return (data.messages ?? []) as Message[];
}

export async function saveChat({
  id,
  messages,
}: {
  id: string;
  messages: Message[];
}): Promise<void> {
  const { error } = await supabase
    .from("chats")
    .update({ messages })
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to save chat: ${error.message}`);
  }
}
