import { tools } from "@/tools/tools";
import { createClient } from "@/utils/supabase/server";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

export async function POST(req: Request) {
  const { prompt }: { prompt: string } = await req.json();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  try {
    const prompt_text = `
    Extract the fields for each of these categories: Visitor, Revenue, and Rating from the provided API data.
    For each category:
    - Use the corresponding tool (visitor, revenue, or rating) to save the data.
    - Respond with a JSON object containing the extracted numeric values.
    - Also provide a summary text of the extraction.

    use this user_id: ${user?.id}
    
    API Data:
    ${prompt}
    `;

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      system: "You are a helpful assistant",
      prompt: prompt_text,
      tools,
      maxSteps: 5,
    });

    return Response.json({ text });
  } catch (error) {
    console.error(error);
    return new Response("Internal server error", { status: 500 });
  }
}
