import { useAppStore } from '../store/useAppStore';
import { SimulationMode, type StochasticConfig } from '@tapir/core';
import { useCallback } from 'react';

export default function StochasticPanel() {
  const { scenario, updateScenario } = useAppStore();
  const stoch = scenario.stochastic;

  const update = useCallback((partial: Partial<StochasticConfig>) => {
    updateScenario({ stochastic: { ...stoch, ...partial } });
  }, [stoch, updateScenario]);

  return (
    <div className="space-y-3">
      <span className="text-xs font-semibold text-gray-600">Stochastika</span>

      <div>
        <label className="block text-xs text-gray-500">Režim simulace</label>
        <select
          value={stoch.mode}
          onChange={(e) => update({ mode: e.target.value as SimulationMode })}
          className="w-full text-xs border border-gray-300 rounded px-2 py-1"
        >
          <option value={SimulationMode.Deterministic}>Deterministický</option>
          <option value={SimulationMode.StochasticSingle}>Stochastický (jeden běh)</option>
          <option value={SimulationMode.MonteCarlo}>Monte Carlo</option>
        </select>
      </div>

      <div>
        <label className="block text-xs text-gray-500">RNG Seed</label>
        <input
          type="number"
          value={stoch.seed}
          onChange={(e) => update({ seed: parseInt(e.target.value) || 0 })}
          className="w-full text-xs border border-gray-300 rounded px-2 py-1"
        />
      </div>

      {stoch.mode === SimulationMode.MonteCarlo && (
        <div>
          <label className="block text-xs text-gray-500">Počet MC běhů</label>
          <input
            type="number"
            value={stoch.monteCarloRuns}
            onChange={(e) => update({ monteCarloRuns: parseInt(e.target.value) || 10 })}
            min={10}
            max={1000}
            className="w-full text-xs border border-gray-300 rounded px-2 py-1"
          />
        </div>
      )}

      <div className="text-xs text-gray-400 mt-2">
        {stoch.mode === SimulationMode.Deterministic && 'Přechody počítány spojitě (rate × pool).'}
        {stoch.mode === SimulationMode.StochasticSingle && 'Přechody jako binomický výběr (seedovaný).'}
        {stoch.mode === SimulationMode.MonteCarlo && `${stoch.monteCarloRuns} nezávislých běhů, výstup: medián + p5/p95.`}
      </div>
    </div>
  );
}
