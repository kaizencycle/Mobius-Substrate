export type TxHandle = {
  setMaintenanceMode: (enabled: boolean) => Promise<void>;
  epochNumber: number;
};

export class DB {
  maintenance = false;
  epochNumber = 1;

  async transaction<T>(fn: (tx: TxHandle) => Promise<T>): Promise<T> {
    // In a real DB, begin tx here
    const tx: TxHandle = {
      setMaintenanceMode: async (enabled: boolean) => { this.maintenance = enabled; },
      epochNumber: this.epochNumber
    };

    try {
      const result = await fn(tx);
      // commit
      this.epochNumber += 1;
      return result;
    } catch (e) {
      // rollback
      throw e;
    }
  }
}

export const db = new DB();

