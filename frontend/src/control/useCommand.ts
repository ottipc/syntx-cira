import { useState } from "react";
import { ApiError, postJson } from "../access";

/** A failed command: the contract error code (shown via its catalog term) and the HTTP status (shown as data). */
export interface CommandError { code: string | null; status: number | null }
export interface CommandState<T> { pending: boolean; result: T | null; error: CommandError | null }

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
      const code = e instanceof ApiError ? (e.body as { error?: { code?: string } } | null)?.error?.code ?? null : null;
      set({ pending: false, result: null, error: { code, status: e instanceof ApiError ? e.status : null } });
      return null;
    }
  };
  return { ...s, run };
}
