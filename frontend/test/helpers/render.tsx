// Render the full app (composition root) at a session URL against the snapshot server.
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, cleanup, render } from "@testing-library/react";
import { vi } from "vitest";
import { App } from "../../src/App";
import { SessionProvider } from "../../src/session";
import { type Server, snapshotFetch } from "./snapshots";

export function newServer(): Server {
  return { requests: [], misses: [], posts: [], override: new Map(), hold: new Map() };
}

/** Waits until no block is LOADING and no query is in flight (bounded). */
export async function settle(root: HTMLElement, client: QueryClient, rounds = 60): Promise<void> {
  for (let i = 0; i < rounds; i += 1) {
    await act(async () => { await new Promise((r) => setTimeout(r, 5)); });
    if (client.isFetching() === 0 && root.querySelector('[data-state="LOADING"]') === null) {
      await act(async () => { await new Promise((r) => setTimeout(r, 5)); });
      if (client.isFetching() === 0 && root.querySelector('[data-state="LOADING"]') === null) return;
    }
  }
  throw new Error("render did not settle");
}

export async function renderAt(url: string, server: Server = newServer(), wait = true) {
  cleanup();
  vi.stubGlobal("fetch", snapshotFetch(server));
  window.history.replaceState(null, "", url);
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Infinity, refetchOnWindowFocus: false } } });
  const r = render(<QueryClientProvider client={client}><SessionProvider><App /></SessionProvider></QueryClientProvider>);
  if (wait) await settle(r.container, client);
  return { ...r, client, server, root: r.container };
}

export const sems = (root: ParentNode): string[] => [...root.querySelectorAll("[data-sem]")].map((e) => e.getAttribute("data-sem") ?? "");
export const workspace = (root: ParentNode): HTMLElement => {
  const z = root.querySelector('[data-zone="C"]');
  if (!(z instanceof HTMLElement)) throw new Error("zone C missing");
  return z;
};
