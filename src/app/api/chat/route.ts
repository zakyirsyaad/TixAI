import { createClient } from "@/utils/supabase/server";
import { openai } from "@ai-sdk/openai";
import { appendResponseMessages, appendClientMessage, streamText } from "ai";
import { saveMessages } from "@/tools/chat-store";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    // get the last message from the client
    const { message, id } = await req.json();

    if (!message || !id) {
      return new Response("Missing message or chat ID", { status: 400 });
    }

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new Response("User not authenticated", { status: 401 });
    }

    // Load previous messages
    const { data: messageRows, error: messagesError } = await supabase
      .from("messages")
      .select("*")
      .eq("chat_id", id)
      .order("created_at", { ascending: true });

    if (messagesError) {
      console.error("Error loading messages:", messagesError);
      return new Response("Error loading chat messages", { status: 500 });
    }

    // Convert to AI SDK format
    const previousMessages = (messageRows || []).map((row) => ({
      id: row.id,
      role: row.role as "user" | "assistant" | "system",
      content: row.content,
    }));

    // append the new message to the previous messages
    const messages = appendClientMessage({
      messages: previousMessages,
      message,
    });

    // Get organization data
    const { data: organizations, error } = await supabase
      .from("organizations")
      .select("data_json")
      .eq("user_id", user.id);

    if (error) {
      console.error("Error fetching organizations:", error);
      return new Response("Error fetching organization data", {
        status: 500,
      });
    }

    // Check if organizations exist and have data
    if (!organizations || organizations.length === 0) {
      return new Response("Please Add Data Event Organizations First", {
        status: 400,
      });
    }

    const organizationData = organizations[0]?.data_json;

    const system = `
    You are an AI assistant specializing in data analysis and prediction for event organizers with 5 years experience. 
  Your main responsibilities are:
  - Analyzing data related to events, such as number of participants, tickets sold, expenses, feedback, and other relevant metrics.
  - Making predictions based on historical data (e.g., forecasting the number of attendees, estimating profits, identifying potential risks).
  - Providing suggestions, recommendations, and optimization strategies to help make future events more successful.
  - Focusing on optimizing aspects such as marketing, cost efficiency, venue and timing selection, and enhancing participant experience.
  - Explaining your analyses and recommendations clearly, logically, and based on the available data.
  - Always use professional yet easy-to-understand language.
  - Never go off-topic from event organizing and data analysis.
  - If the available data is insufficient, politely ask the user for additional necessary information.

  Never discuss topics outside of event organizing or make predictions without a data-driven basis.

  This is the user's organization data: ${JSON.stringify(
    organizationData || {}
  )}
  `;

    const result = streamText({
      model: openai("gpt-4"),
      system,
      messages,
      maxSteps: 5,
      async onFinish({ response }) {
        try {
          // Save all messages including the response
          await saveMessages(
            id,
            appendResponseMessages({
              messages,
              responseMessages: response.messages,
            })
          );
        } catch (saveError) {
          console.error("Error saving chat:", saveError);
        }
      },
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
