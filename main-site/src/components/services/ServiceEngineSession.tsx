"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import type { PublicServiceResult } from "@/system/services/public-service.types";

type ServiceSession = {
  draftQuery: string;
  submittedQuery: string;
  submittedResult: PublicServiceResult | null;
  analysisPending: boolean;
  error: string;
  setDraftQuery: (query: string) => void;
  analyse: (query?: string) => Promise<void>;
  reset: () => void;
};

const ServiceSessionContext = createContext<ServiceSession | null>(null);

export function ServiceEngineSessionProvider({ children }: { children: React.ReactNode }) {
  const [draftQuery, setDraftQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [submittedResult, setSubmittedResult] = useState<PublicServiceResult | null>(null);
  const [analysisPending, setAnalysisPending] = useState(false);
  const [error, setError] = useState("");
  const requestId = useRef(0);

  const analyse = useCallback(async (queryOverride?: string) => {
    const query = (queryOverride ?? draftQuery).trim();
    if (!query) return;
    const currentRequest = ++requestId.current;
    setAnalysisPending(true);
    setError("");
    try {
      const response = await fetch("/api/engine/analyse", {
        method: "POST",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      if (!response.ok) throw new Error("The enquiry could not be analysed.");
      const result = await response.json() as PublicServiceResult;
      if (currentRequest !== requestId.current) return;
      setSubmittedQuery(query);
      setSubmittedResult(result);
    } catch (cause) {
      if (currentRequest === requestId.current) setError(cause instanceof Error ? cause.message : "The enquiry could not be analysed.");
    } finally {
      if (currentRequest === requestId.current) setAnalysisPending(false);
    }
  }, [draftQuery]);

  const reset = useCallback(() => {
    requestId.current += 1;
    setDraftQuery("");
    setSubmittedQuery("");
    setSubmittedResult(null);
    setAnalysisPending(false);
    setError("");
  }, []);

  const value = useMemo(() => ({
    draftQuery, submittedQuery, submittedResult, analysisPending, error,
    setDraftQuery, analyse, reset,
  }), [analysisPending, analyse, draftQuery, error, reset, submittedQuery, submittedResult]);

  return <ServiceSessionContext.Provider value={value}>{children}</ServiceSessionContext.Provider>;
}

export function useServiceEngineSession() {
  const session = useContext(ServiceSessionContext);
  if (!session) throw new Error("useServiceEngineSession must be used within ServiceEngineSessionProvider.");
  return session;
}
