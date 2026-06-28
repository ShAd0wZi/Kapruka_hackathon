import { experimental_createMCPClient } from "@ai-sdk/mcp";

let mcpClientInstance: Awaited<ReturnType<typeof experimental_createMCPClient>> | null = null;
let connectionPromise: Promise<Awaited<ReturnType<typeof experimental_createMCPClient>>> | null = null;

async function connectMCP() {
  const client = await experimental_createMCPClient({
    transport: {
      type: "http",
      url: "https://mcp.kapruka.com/mcp",
    },
  });
  return client;
}

export async function getMCPClient() {
  if (mcpClientInstance) {
    return mcpClientInstance;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = connectMCP().then((client) => {
    mcpClientInstance = client;
    connectionPromise = null;
    return client;
  }).catch((err) => {
    connectionPromise = null;
    throw err;
  });

  return connectionPromise;
}

export async function getKaprukaTools() {
  const client = await getMCPClient();
  return await client.tools();
}
