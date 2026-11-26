// Entry: fonts (TX30), token-only styles, query client, session provider (URL is the session SSOT).
import "@fontsource/dejavu-mono/400.css";
import "@fontsource/ibm-plex-sans/400.css";
import "@fontsource/ibm-plex-sans/600.css";
import "./app.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { SessionProvider } from "./session";

const client = new QueryClient({ defaultOptions: { queries: { staleTime: Infinity, refetchOnWindowFocus: false } } });
const root = document.getElementById("root");
if (root) {
  createRoot(root).render(
    <StrictMode>
      <QueryClientProvider client={client}><SessionProvider><App /></SessionProvider></QueryClientProvider>
    </StrictMode>,
  );
}
