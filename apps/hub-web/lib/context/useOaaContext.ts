// Stub module for OAA context hook
import { createContext, useContext } from 'react';

interface OaaContextData {
  version?: string;
  updatedAt?: string;
  companions?: unknown[];
  ledger?: unknown;
  system?: unknown;
}

interface OaaContextType {
  user: unknown | null;
  isLoading: boolean;
  error: string | null;
  status: "loading" | "error" | "ready";
  data: OaaContextData | null;
}

export const OaaContext = createContext<OaaContextType>({
  user: null,
  isLoading: false,
  error: null,
  status: "ready",
  data: null
});

export function useOaaContext() {
  return useContext(OaaContext);
}

export default useOaaContext;
