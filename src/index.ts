/** 서버 구동 */

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StdDictMcpServer } from "./mcp-server.js";

async function main() {
  const transport = new StdioServerTransport();
  const server = new StdDictMcpServer().getServer();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});