{
  "name": "mente-em-teia",
  "version": "0.1.0",
  "description": "Infraestrutura local-first de conhecimento pessoal: Markdown + grafo semântico + busca híbrida + memória para agentes (MCP).",
  "type": "module",
  "private": true,
  "license": "MIT",
  "engines": { "node": ">=18" },
  "scripts": {
    "start": "node src/server.js",
    "mcp": "node src/agent/mcp-server.js",
    "test": "node --test"
  }
}
