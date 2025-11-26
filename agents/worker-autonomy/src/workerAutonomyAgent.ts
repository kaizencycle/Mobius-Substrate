import {
  analyzeWorkload,
  auditContract,
  analyzeWageFairness
} from "../../../apps/civic-os/labor/src";
import {
  ContractAuditInput,
  ContractAuditResult
} from "../../../apps/civic-os/labor/src/contractGuardian";
import {
  WorkloadAnalysisInput,
  WorkloadAnalysisResult
} from "../../../apps/civic-os/labor/src/workloadAnalyzer";
import {
  WageFairnessInput,
  WageFairnessResult
} from "../../../apps/civic-os/labor/src/wageFairnessAgent";

export interface WorkerAutonomyContext {
  workerId: string;
  orgId: string;
  jurisdiction?: string;
}

/**
 * High-level facade for Worker Autonomy flows.
 * This is an orchestration layer; UI and persistence are handled elsewhere.
 */
export class WorkerAutonomyAgent {
  private context: WorkerAutonomyContext;

  constructor(context: WorkerAutonomyContext) {
    this.context = context;
  }

  async reviewContract(
    contractText: string
  ): Promise<ContractAuditResult> {
    const input: ContractAuditInput = {
      workerId: this.context.workerId,
      contractText,
      orgId: this.context.orgId,
      requesterId: this.context.workerId,
      jurisdiction: this.context.jurisdiction
    };
    return auditContract(input);
  }

  async analyzeWorkload(
    input: Omit<WorkloadAnalysisInput, "orgId" | "requesterId">
  ): Promise<WorkloadAnalysisResult> {
    return analyzeWorkload({
      ...input,
      orgId: this.context.orgId,
      requesterId: this.context.workerId
    });
  }

  async checkWageFairness(
    input: Omit<WageFairnessInput, "orgId" | "requesterId">
  ): Promise<WageFairnessResult> {
    return analyzeWageFairness({
      ...input,
      orgId: this.context.orgId,
      requesterId: this.context.workerId
    });
  }
}
