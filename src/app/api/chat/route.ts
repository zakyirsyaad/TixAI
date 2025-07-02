import { saveChat } from "@/tools/chat-store";
import { createClient } from "@/utils/supabase/server";
import { openai } from "@ai-sdk/openai";
import { appendClientMessage, appendResponseMessages, streamText } from "ai";
import { chartstool } from "@/tools/tools";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    // get the last message from the client
    const { messages, id } = await req.json();

    if (!messages || !Array.isArray(messages) || !id) {
      return new Response("Missing messages or chat ID", { status: 400 });
    }

    const previousMessages = messages.slice(0, -1);
    const newMessage = messages.at(-1);

    if (!newMessage) {
      return new Response("No new message provided", { status: 400 });
    }

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new Response("User not authenticated", { status: 401 });
    }

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

    //   const system = `
    //   You are an AI assistant specializing in data analysis and prediction for event organizers with 5 years experience.
    // Your main responsibilities are:
    // - Analyzing data related to events, such as number of participants, tickets sold, expenses, feedback, and other relevant metrics.
    // - Making predictions based on historical data (e.g., forecasting the number of attendees, estimating profits, identifying potential risks).
    // - Providing suggestions, recommendations, and optimization strategies to help make future events more successful.
    // - Focusing on optimizing aspects such as marketing, cost efficiency, venue and timing selection, and enhancing participant experience.
    // - Explaining your analyses and recommendations clearly, logically, and based on the available data.
    // - Always use professional yet easy-to-understand language.
    // - Never go off-topic from event organizing and data analysis.
    // - If the available data is insufficient, politely ask the user for additional necessary information.

    // Never discuss topics outside of event organizing or make predictions without a data-driven basis.

    // This is the user's organization data: ${JSON.stringify(
    //   organizationData || {}
    // )}
    // `;

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

  Additionally, the user is interested in esports-related data. You are expected to:
  - Be capable of analyzing and utilizing data specific to esports events, including player/team statistics, tournament formats, match results, audience engagement, sponsorships, and viewership metrics.
  - Make comparisons or derive insights from both general and esports-specific event data to improve planning and decision-making.
  - Provide esports-relevant recommendations when applicable, tailored to the competitive gaming ecosystem.

  Never discuss topics outside of event organizing or make predictions without a data-driven basis.

  This is the user's organization data: ${JSON.stringify(
    organizationData || {}
  )}
`;

    const allMessages = appendClientMessage({
      messages: previousMessages,
      message: newMessage,
    });
    const result = streamText({
      model: openai("gpt-4"),
      system,
      maxSteps: 5,
      messages: allMessages,
      tools: {
        generateChart: chartstool,
      },
      toolCallStreaming: true,
      async onFinish({ response }) {
        await saveChat({
          id,
          messages: appendResponseMessages({
            messages: allMessages,
            responseMessages: response.messages,
          }),
        });
      },
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
