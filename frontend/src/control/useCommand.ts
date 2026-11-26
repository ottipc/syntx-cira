import { useState } from "react";
import { ApiError, postJson } from "../access";

export interface CommandState<T> { pending: boolean; result: T | null; error: string | null }

/** Explicit confirmation precedes every POST (P11); 202/201 results are shown, never applied automatically. */
export function useCommand<T>() {
  const [s, set] = useState<CommandState<T>>({ pending: false, result: null, error: null });
  const run = async (path: string, body: unknown) => {
    set({ pending: true, result: null, error: null });
    try {
      const r = await postJson<T>(path, body);
      set({ pending: false, result: r.body, error: null });
      return r.body;
    } catch (e) {
      const code = e instanceof ApiError ? JSON.stringify((e.body as { error?: { code?: string } } | null)?.error?.code ?? e.status) : String(e);
      set({ pending: false, result: null, error: code });
      return null;
    }
  };
  return { ...s, run };
}
