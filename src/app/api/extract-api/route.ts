import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

export async function POST(req: Request) {
  const { prompt }: { prompt: string } = await req.json();

  try {
    const prompt_text =
      "Extract exactly the fields per categories Visitor, Revenue, and Rating from this data API" +
      "Respond with a JSON object only, with numeric values. with summarize text too." +
      prompt;

    const { text } = await generateText({
      model: openai("gpt-4.1"),
      system: "You are a helpful assistant",
      prompt: prompt_text,
      maxSteps: 5,
    });

    return Response.json({ text });
  } catch (error) {
    console.error(error);
    return new Response("Internal server error", { status: 500 });
  }
}
