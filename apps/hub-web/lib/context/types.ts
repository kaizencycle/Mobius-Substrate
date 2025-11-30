export interface CompanionInfo {
  id: string;
  name: string;
  status: "active" | "inactive";
  lastSeen: string;
  capabilities: string[];
}

export interface ConstitutionHistory {
  version: string;
  sha256: string;
  timestamp: string;
}

export interface OaaContext {
  version: string;
  updatedAt: string;
  constitution: {
    current: string;
    sha256: string;
    history: ConstitutionHistory[];
  };
  companions: CompanionInfo[];
  ledger: {
    baseUrl: string;
    status: "connected" | "disconnected" | "error";
    lastSync: string;
  };
  system: {
    environment: "development" | "production" | "test";
    nodeVersion: string;
    uptime: number;
  };
}
