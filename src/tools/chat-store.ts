import { Message } from "ai";
import { createClient } from "@/utils/supabase/client";
import { Database } from "@/types/supabase";

export class ChatError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ChatError";
  }
}

type Chat = Database["public"]["Tables"]["chats"]["Row"];
type ChatInsert = Database["public"]["Tables"]["chats"]["Insert"];
// type ChatUpdate = Database["public"]["Tables"]["chats"]["Update"];
type MessageRow = Database["public"]["Tables"]["messages"]["Row"];
type MessageInsert = Database["public"]["Tables"]["messages"]["Insert"];
type StreamRow = Database["public"]["Tables"]["streams"]["Row"];
type StreamInsert = Database["public"]["Tables"]["streams"]["Insert"];
type Json = Database["public"]["Tables"]["messages"]["Row"]["meta_json"];

const supabase = createClient();

/**
 * Create a new chat and return the chat ID
 */
export async function createChat(title?: string): Promise<string> {
  try {
    console.log("Creating new chat with title:", title);

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error("User authentication error:", userError);
      throw new ChatError("User not authenticated");
    }

    if (!user?.id) {
      throw new ChatError("User ID not found");
    }

    // Create chat in database
    const chatData: ChatInsert = {
      user_id: user.id,
      title: title || null,
    };

    const { data: chat, error: chatError } = await supabase
      .from("chats")
      .insert([chatData])
      .select()
      .single();

    if (chatError) {
      console.error("Error creating chat:", chatError);
      throw new ChatError(`Failed to create chat: ${chatError.message}`);
    }

    if (!chat?.id) {
      throw new ChatError("Chat created but no ID returned");
    }

    console.log("Chat created successfully with ID:", chat.id);
    return chat.id;
  } catch (error) {
    console.error("createChat error:", error);
    throw new ChatError(
      `Failed to create chat: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Load all messages for a specific chat
 */
export async function loadChat(chatId: string): Promise<Message[]> {
  try {
    console.log("Loading chat messages for ID:", chatId);

    if (!chatId) {
      throw new ChatError("Chat ID is required");
    }

    // Load messages from database
    const { data: messageRows, error: messagesError } = await supabase
      .from("messages")
      .select("*")
      .eq("chat_id", chatId)
      .order("created_at", { ascending: true });

    console.log("Database response:", { messageRows, messagesError });

    if (messagesError) {
      console.error("Error loading messages:", messagesError);
      throw new ChatError(`Failed to load messages: ${messagesError.message}`);
    }

    // Convert database rows to AI SDK Message format
    const messages: Message[] = (messageRows || []).map((row: MessageRow) => ({
      id: row.id,
      role: row.role as "user" | "assistant" | "system",
      content: row.content,
      createdAt: new Date(row.created_at),
      ...(row.meta_json && { meta: row.meta_json }),
    }));

    console.log("Converted messages:", messages);
    return messages;
  } catch (error) {
    console.error("loadChat error:", error);
    throw new ChatError(
      `Failed to load chat: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Save messages to a chat
 */
export async function saveMessages(
  chatId: string,
  messages: Message[]
): Promise<void> {
  try {
    console.log(
      "Saving messages for chat ID:",
      chatId,
      "Messages count:",
      messages.length
    );

    if (!chatId) {
      throw new ChatError("Chat ID is required");
    }

    if (!messages || messages.length === 0) {
      console.log("No messages to save");
      return;
    }

    // Get existing messages to avoid duplicates
    const { data: existingMessages, error: loadError } = await supabase
      .from("messages")
      .select("id")
      .eq("chat_id", chatId);

    if (loadError) {
      console.error("Error loading existing messages:", loadError);
      throw new ChatError(
        `Failed to load existing messages: ${loadError.message}`
      );
    }

    const existingIds = new Set((existingMessages || []).map((msg) => msg.id));

    // Filter out messages that already exist
    const messagesToAdd = messages.filter((msg) => !existingIds.has(msg.id));

    console.log("Messages to add:", messagesToAdd.length);

    if (messagesToAdd.length > 0) {
      // Insert new messages
      const messageData: MessageInsert[] = messagesToAdd.map((msg) => ({
        id: msg.id,
        chat_id: chatId,
        role: msg.role,
        content: msg.content,
        meta_json: (msg as Message & { meta?: Record<string, unknown> })
          .meta as Json | undefined,
      }));

      const { error: insertError } = await supabase
        .from("messages")
        .insert(messageData);

      if (insertError) {
        console.error("Error inserting messages:", insertError);
        throw new ChatError(
          `Failed to insert messages: ${insertError.message}`
        );
      }

      console.log("Successfully inserted", messagesToAdd.length, "messages");
    }

    // Update chat's updated_at timestamp
    const { error: updateError } = await supabase
      .from("chats")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", chatId);

    if (updateError) {
      console.error("Error updating chat timestamp:", updateError);
      // Don't throw error for timestamp update failure
    } else {
      console.log("Successfully updated chat timestamp");
    }
  } catch (error) {
    console.error("saveMessages error:", error);
    throw new ChatError(
      `Failed to save messages: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Create or update a stream for a chat
 */
export async function createStream(
  chatId: string,
  streamId: string
): Promise<void> {
  try {
    console.log("Creating stream for chat ID:", chatId, "Stream ID:", streamId);

    if (!chatId || !streamId) {
      throw new ChatError("Chat ID and Stream ID are required");
    }

    const streamData: StreamInsert = {
      id: streamId,
      chat_id: chatId,
      status: "active",
    };

    const { error: streamError } = await supabase
      .from("streams")
      .upsert([streamData], { onConflict: "id" });

    if (streamError) {
      console.error("Error creating stream:", streamError);
      throw new ChatError(`Failed to create stream: ${streamError.message}`);
    }

    console.log("Stream created/updated successfully");
  } catch (error) {
    console.error("createStream error:", error);
    throw new ChatError(
      `Failed to create stream: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Update stream status
 */
export async function updateStreamStatus(
  streamId: string,
  status: "active" | "closed" | "error"
): Promise<void> {
  try {
    console.log("Updating stream status:", streamId, "Status:", status);

    const { error } = await supabase
      .from("streams")
      .update({ status })
      .eq("id", streamId);

    if (error) {
      console.error("Error updating stream status:", error);
      throw new ChatError(`Failed to update stream status: ${error.message}`);
    }

    console.log("Stream status updated successfully");
  } catch (error) {
    console.error("updateStreamStatus error:", error);
    throw new ChatError(
      `Failed to update stream status: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Get the latest active stream for a chat
 */
export async function getLatestStream(
  chatId: string
): Promise<StreamRow | null> {
  try {
    console.log("Getting latest stream for chat ID:", chatId);

    const { data: stream, error } = await supabase
      .from("streams")
      .select("*")
      .eq("chat_id", chatId)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "no rows returned" which is not an error
      console.error("Error getting latest stream:", error);
      throw new ChatError(`Failed to get latest stream: ${error.message}`);
    }

    return stream;
  } catch (error) {
    console.error("getLatestStream error:", error);
    throw new ChatError(
      `Failed to get latest stream: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Update chat title
 */
export async function updateChatTitle(
  chatId: string,
  title: string
): Promise<void> {
  try {
    console.log("Updating chat title:", chatId, "Title:", title);

    const { error } = await supabase
      .from("chats")
      .update({ title, updated_at: new Date().toISOString() })
      .eq("id", chatId);

    if (error) {
      console.error("Error updating chat title:", error);
      throw new ChatError(`Failed to update chat title: ${error.message}`);
    }

    console.log("Chat title updated successfully");
  } catch (error) {
    console.error("updateChatTitle error:", error);
    throw new ChatError(
      `Failed to update chat title: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Delete a chat and all its messages
 */
export async function deleteChat(chatId: string): Promise<void> {
  try {
    console.log("Deleting chat:", chatId);

    const { error } = await supabase.from("chats").delete().eq("id", chatId);

    if (error) {
      console.error("Error deleting chat:", error);
      throw new ChatError(`Failed to delete chat: ${error.message}`);
    }

    console.log("Chat deleted successfully");
  } catch (error) {
    console.error("deleteChat error:", error);
    throw new ChatError(
      `Failed to delete chat: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Get all chats for the current user
 */
export async function getUserChats(): Promise<Chat[]> {
  try {
    console.log("Getting user chats");

    const { data: chats, error } = await supabase
      .from("chats")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error getting user chats:", error);
      throw new ChatError(`Failed to get user chats: ${error.message}`);
    }

    console.log("User chats retrieved:", chats?.length || 0);
    return chats || [];
  } catch (error) {
    console.error("getUserChats error:", error);
    throw new ChatError(
      `Failed to get user chats: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

// Legacy function for backward compatibility
export async function saveChat({
  id,
  messages,
}: {
  id: string;
  messages: Message[];
}): Promise<void> {
  return saveMessages(id, messages);
}
