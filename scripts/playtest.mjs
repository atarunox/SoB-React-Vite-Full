// Playtest runner — loads the simulation through Vite's SSR pipeline so the
// app's real modules (JSX, extensionless imports) resolve correctly.
import { createServer } from 'vite';

// Browser shims for modules that touch localStorage at import time
const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
  clear: () => store.clear(),
  key: (i) => [...store.keys()][i] ?? null,
  get length() { return store.size; },
};
globalThis.window = globalThis;

const server = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
  plugins: [], // skip basic-ssl etc.
  configFile: false,
  root: process.cwd(),
  optimizeDeps: { noDiscovery: true, include: [] },
});

try {
  const sim = await server.ssrLoadModule('/scripts/playtestSim.js');
  await sim.run();
} finally {
  await server.close();
}
