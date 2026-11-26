// While an experiment runs, StageEvents invalidate the dependent projections (GK-29).
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

export function useInvalidateOnProgress(signature: string | null): void {
  const qc = useQueryClient();
  const last = useRef<string | null>(null);
  useEffect(() => {
    if (signature !== null && last.current !== null && last.current !== signature) {
      void qc.invalidateQueries({ predicate: (q) => q.queryKey[0] === "cira" && q.queryKey[1] !== "/experiments" });
    }
    last.current = signature;
  }, [signature, qc]);
}
