import { type ScenarioConfig, type SimulationResult } from '@tapir/core';
import { runSimulation } from '@tapir/core';
import { validateScenario } from '@tapir/core';

export type WorkerRequest =
  | { type: 'run'; scenario: ScenarioConfig; id: string }
  | { type: 'cancel'; id: string };

export type WorkerResponse =
  | { type: 'result'; result: SimulationResult; id: string }
  | { type: 'progress'; completedRuns: number; totalRuns: number; id: string }
  | { type: 'error'; message: string; id: string }
  | { type: 'validation-error'; errors: { path: string; message: string }[]; id: string };

let cancelledIds = new Set<string>();

self.onmessage = (event: MessageEvent<WorkerRequest>) => {
  const msg = event.data;

  if (msg.type === 'cancel') {
    cancelledIds.add(msg.id);
    return;
  }

  if (msg.type === 'run') {
    const { scenario, id } = msg;

    // Validate
    const errors = validateScenario(scenario);
    if (errors.length > 0) {
      self.postMessage({ type: 'validation-error', errors, id } satisfies WorkerResponse);
      return;
    }

    cancelledIds.delete(id);

    try {
      const result = runSimulation(
        scenario,
        (progress) => {
          self.postMessage({
            type: 'progress',
            completedRuns: progress.completedRuns,
            totalRuns: progress.totalRuns,
            id,
          } satisfies WorkerResponse);
        },
        () => cancelledIds.has(id),
      );

      if (!cancelledIds.has(id)) {
        self.postMessage({ type: 'result', result, id } satisfies WorkerResponse);
      }
    } catch (err) {
      self.postMessage({
        type: 'error',
        message: err instanceof Error ? err.message : String(err),
        id,
      } satisfies WorkerResponse);
    }
  }
};
