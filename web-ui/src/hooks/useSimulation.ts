import { useCallback, useEffect, useRef, useState } from 'react';
import type { ScenarioConfig, SimulationResult, ValidationError } from '@tapir/core';
import type { WorkerRequest, WorkerResponse } from '../../worker-types';

export interface SimulationState {
  status: 'idle' | 'running' | 'done' | 'error' | 'validation-error';
  result: SimulationResult | null;
  errors: ValidationError[];
  errorMessage: string | null;
  progress: { completed: number; total: number } | null;
}

let idCounter = 0;

export function useSimulation() {
  const workerRef = useRef<Worker | null>(null);
  const currentIdRef = useRef<string | null>(null);

  const [state, setState] = useState<SimulationState>({
    status: 'idle',
    result: null,
    errors: [],
    errorMessage: null,
    progress: null,
  });

  useEffect(() => {
    workerRef.current = new Worker(
      new URL('../../worker/simulation-worker.ts', import.meta.url),
      { type: 'module' },
    );

    workerRef.current.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const msg = event.data;

      if (msg.id !== currentIdRef.current) return;

      switch (msg.type) {
        case 'result':
          setState({
            status: 'done',
            result: msg.result,
            errors: [],
            errorMessage: null,
            progress: null,
          });
          break;
        case 'progress':
          setState(prev => ({
            ...prev,
            progress: { completed: msg.completedRuns, total: msg.totalRuns },
          }));
          break;
        case 'error':
          setState({
            status: 'error',
            result: null,
            errors: [],
            errorMessage: msg.message,
            progress: null,
          });
          break;
        case 'validation-error':
          setState({
            status: 'validation-error',
            result: null,
            errors: msg.errors,
            errorMessage: null,
            progress: null,
          });
          break;
      }
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const run = useCallback((scenario: ScenarioConfig) => {
    const id = `sim-${++idCounter}`;
    currentIdRef.current = id;

    setState({
      status: 'running',
      result: null,
      errors: [],
      errorMessage: null,
      progress: null,
    });

    workerRef.current?.postMessage({ type: 'run', scenario, id } satisfies WorkerRequest);
  }, []);

  const cancel = useCallback(() => {
    if (currentIdRef.current) {
      workerRef.current?.postMessage({ type: 'cancel', id: currentIdRef.current } satisfies WorkerRequest);
      setState(prev => ({ ...prev, status: 'idle', progress: null }));
    }
  }, []);

  return { ...state, run, cancel };
}
