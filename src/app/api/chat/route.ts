import { streamText, stepCountIs } from "ai";
import { google } from "@ai-sdk/google";
import { getKaprukaTools } from "@/lib/mcp-client";
import { getSystemPrompt } from "@/lib/system-prompt";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { messages, cart } = await req.json();

    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY === 'your_key_here') {
      return new Response(
        JSON.stringify({
          error: "API Key missing. Please get a FREE key from https://aistudio.google.com/app/apikey and add it to your .env.local file as GOOGLE_GENERATIVE_AI_API_KEY.",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Build cart summary for the system prompt
    let cartSummary = "Cart is empty";
    if (cart && Array.isArray(cart) && cart.length > 0) {
      const items = cart
        .map(
          (item: { name: string; quantity: number; price: number }) =>
            `• ${item.name} x${item.quantity} — Rs. ${(item.price * item.quantity).toLocaleString("en-LK")}`
        )
        .join("\n");
      const total = cart.reduce(
        (sum: number, item: { price: number; quantity: number }) =>
          sum + item.price * item.quantity,
        0
      );
      cartSummary = `${cart.length} item(s) in cart:\n${items}\nCart Total: Rs. ${total.toLocaleString("en-LK")}`;
    }


    const kaprukaTools = await getKaprukaTools();

    const result = streamText({
      model: google("gemini-2.5-flash"),
      system: getSystemPrompt(cartSummary),
      messages,
      tools: kaprukaTools,
      stopWhen: stepCountIs(10),
      onError: (error) => {
        console.error("Stream error:", error);
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to process chat request. Please try again.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}