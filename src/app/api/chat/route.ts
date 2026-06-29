import { streamText, stepCountIs } from "ai";
import { google } from "@ai-sdk/google";
import { getKaprukaTools } from "@/lib/mcp-client";
import { getSystemPrompt } from "@/lib/system-prompt";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    let { messages, cart } = await req.json();

    // Input Sanitization and Context Window Management
    if (!Array.isArray(messages)) {
      messages = [];
    }

    // Keep only the last 20 messages to prevent context explosion
    if (messages.length > 20) {
      messages = messages.slice(-20);
    }

    // Sanitize the latest user message to prevent massive text inputs
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'user' && typeof lastMessage.content === 'string') {
        const MAX_LENGTH = 2000;
        if (lastMessage.content.length > MAX_LENGTH) {
          lastMessage.content = lastMessage.content.substring(0, MAX_LENGTH) + "\n\n[SYSTEM NOTE: User message was truncated due to length limits.]";
        }
      }
    }

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


    // Implement Timeout & Graceful Degradation for MCP Tools
    const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> => {
      let timeoutId: NodeJS.Timeout;
      const timeoutPromise = new Promise<T>((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error('MCP Tool Fetch Timeout')), ms);
      });
      return Promise.race([
        promise,
        timeoutPromise
      ]).finally(() => clearTimeout(timeoutId));
    };

    let kaprukaTools = {};
    let mcpErrorContext = "";
    try {
      kaprukaTools = await withTimeout(getKaprukaTools(), 5000);
    } catch (error) {
      console.error("Failed to fetch MCP tools. Running in degraded mode.", error);
      mcpErrorContext = "\n\nCRITICAL SYSTEM NOTE: The Kapruka MCP Server is currently unreachable or timed out. You have NO tools available. You MUST inform the user that live searching, checking delivery, and creating orders are temporarily unavailable due to a connection issue, and answer questions generally if possible.";
    }

    const finalSystemPrompt = getSystemPrompt(cartSummary) + mcpErrorContext;

    const result = streamText({
      model: google("gemini-2.5-flash"),
      system: finalSystemPrompt,
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