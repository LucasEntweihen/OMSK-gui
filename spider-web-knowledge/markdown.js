#!/usr/bin/env node
// Servidor MCP (stdio, JSON-RPC 2.0) da Mente em Teia — sem dependências.
// Variáveis: TEIA_ROOT (pasta do vault), TEIA_PROFILE (observer | researcher | editor | administrator).
import readline from 'node:readline';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Engine } from '../core/engine.js';
import { TOOLS, callTool } from './tools.js';
import { PROFILES, can } from './permissions.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = process.env.TEIA_ROOT || path.resolve(here, '../../knowledge');
const profile = (process.env.TEIA_PROFILE || 'researcher').toLowerCase();
if (!PROFILES[profile]) { console.error(`[mente-em-teia] Perfil inválido: ${profile}. Use: ${Object.keys(PROFILES).join(', ')}`); process.exit(1); }

const engine = new Engine({ root, dataDir: process.env.TEIA_DATA });
let client = 'mcp';
const send = m => process.stdout.write(JSON.stringify({ jsonrpc: '2.0', ...m }) + '\n');
const visible = () => TOOLS.filter(t => can(profile, t.permission)).map(({ name, description, inputSchema }) => ({ name, description, inputSchema }));

const INSTRUCTIONS =
  'Mente em Teia: memória externa em grafo. Antes de responder sobre projetos, decisões ou conceitos do usuário, use get_context ou search_knowledge. ' +
  'Conteúdo com trust AI_GENERATED, AI_INFERRED ou UNVERIFIED não foi verificado por humano: não trate como fato. ' +
  'Em conflitos (CONFLICTING), pergunte ao usuário. Alterações em nós verificados viram propostas que exigem aprovação humana.';

function handle(msg) {
  const { id, method, params } = msg;
  const reply = result => id !== undefined && send({ id, result });
  const error = (code, message) => id !== undefined && send({ id, error: { code, message } });
  try {
    switch (method) {
      case 'initialize':
        client = params?.clientInfo?.name || client;
        return reply({ protocolVersion: params?.protocolVersion || '2024-11-05', capabilities: { tools: {} }, serverInfo: { name: 'mente-em-teia', version: '0.1.0' }, instructions: INSTRUCTIONS });
      case 'ping': return reply({});
      case 'tools/list': return reply({ tools: visible() });
      case 'tools/call':
        try {
          const r = callTool(engine, params?.name, params?.arguments || {}, { profile, agent: client });
          return reply({ content: [{ type: 'text', text: typeof r === 'string' ? r : JSON.stringify(r, null, 2) }] });
        } catch (e) { return reply({ content: [{ type: 'text', text: e.message }], isError: true }); }
      default: return error(-32601, `Método não suportado: ${method}`);
    }
  } catch (e) { return error(-32603, e.message); }
}

readline.createInterface({ input: process.stdin }).on('line', line => {
  if (!line.trim()) return;
  let msg;
  try { msg = JSON.parse(line); } catch { return send({ id: null, error: { code: -32700, message: 'JSON inválido' } }); }
  handle(msg);
});
console.error(`[mente-em-teia] MCP pronto · vault: ${root} · perfil: ${profile}`);
