import { useAppStore } from '../store/useAppStore';
import { NPIType, ComplianceModel, type NPIConfig, type ContactMatrix } from '@tapir/core';
import { useCallback } from 'react';

let npiCounter = 0;

function createDefaultNPI(): NPIConfig {
  return {
    id: `npi-${++npiCounter}`,
    name: 'Nová NPI',
    type: NPIType.BetaMultiplier,
    startDay: 30,
    endDay: 90,
    value: 0.7,
    compliance: {
      model: ComplianceModel.ExponentialDecay,
      initial: 1.0,
      decayRate: 0.01,
    },
  };
}

export default function NpiPanel() {
  const { scenario, updateScenario } = useAppStore();
  const npis = scenario.npis;

  const addNPI = useCallback(() => {
    updateScenario({ npis: [...npis, createDefaultNPI()] });
  }, [npis, updateScenario]);

  const removeNPI = useCallback((id: string) => {
    updateScenario({ npis: npis.filter(n => n.id !== id) });
  }, [npis, updateScenario]);

  const updateNPI = useCallback((id: string, partial: Partial<NPIConfig>) => {
    updateScenario({
      npis: npis.map(n => n.id === id ? { ...n, ...partial } : n),
    });
  }, [npis, updateScenario]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-600">Intervence (NPIs)</span>
        <button
          onClick={addNPI}
          className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 border border-blue-200"
        >
          + Přidat NPI
        </button>
      </div>

      {npis.length === 0 && (
        <p className="text-xs text-gray-400">Žádné intervence. Klikněte na "+ Přidat NPI".</p>
      )}

      {npis.map((npi) => (
        <div key={npi.id} className="border border-gray-200 rounded p-3 space-y-2 bg-white">
          <div className="flex items-center justify-between">
            <input
              type="text"
              value={npi.name}
              onChange={(e) => updateNPI(npi.id, { name: e.target.value })}
              className="text-sm font-medium border-b border-transparent hover:border-gray-300 focus:border-blue-500 outline-none"
            />
            <button
              onClick={() => removeNPI(npi.id)}
              className="text-xs text-red-500 hover:text-red-700"
              aria-label={`Odebrat ${npi.name}`}
            >
              Odebrat
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-500">Typ</label>
              <select
                value={npi.type}
                onChange={(e) => updateNPI(npi.id, { type: e.target.value as NPIType })}
                className="w-full text-xs border border-gray-300 rounded px-1 py-1"
              >
                <option value={NPIType.BetaMultiplier}>Beta multiplikátor</option>
                <option value={NPIType.GammaMultiplier}>Gamma multiplikátor</option>
                <option value={NPIType.ContactSubMatrixModifier}>Sub-matice kontaktů</option>
              </select>
            </div>

            {npi.type === NPIType.ContactSubMatrixModifier && (
              <div>
                <label className="block text-xs text-gray-500">Sub-matice</label>
                <select
                  value={npi.targetSubMatrix ?? 'school'}
                  onChange={(e) => updateNPI(npi.id, { targetSubMatrix: e.target.value as keyof ContactMatrix })}
                  className="w-full text-xs border border-gray-300 rounded px-1 py-1"
                >
                  <option value="home">Home</option>
                  <option value="school">School</option>
                  <option value="work">Work</option>
                  <option value="community">Community</option>
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs text-gray-500">Den start</label>
              <input
                type="number"
                value={npi.startDay}
                onChange={(e) => updateNPI(npi.id, { startDay: parseInt(e.target.value) || 0 })}
                min={0}
                className="w-full text-xs border border-gray-300 rounded px-1 py-1"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500">Den konec</label>
              <input
                type="number"
                value={npi.endDay}
                onChange={(e) => updateNPI(npi.id, { endDay: parseInt(e.target.value) || 0 })}
                min={0}
                className="w-full text-xs border border-gray-300 rounded px-1 py-1"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500">Hodnota</label>
              <input
                type="number"
                value={npi.value}
                onChange={(e) => updateNPI(npi.id, { value: parseFloat(e.target.value) || 0 })}
                min={0}
                max={2}
                step={0.05}
                className="w-full text-xs border border-gray-300 rounded px-1 py-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-500">Model compliance</label>
              <select
                value={npi.compliance.model}
                onChange={(e) => updateNPI(npi.id, {
                  compliance: { ...npi.compliance, model: e.target.value as ComplianceModel },
                })}
                className="w-full text-xs border border-gray-300 rounded px-1 py-1"
              >
                <option value={ComplianceModel.ExponentialDecay}>Exponenciální decay</option>
                <option value={ComplianceModel.PiecewiseLinear}>Piecewise linear</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500">Počáteční compliance</label>
              <input
                type="number"
                value={npi.compliance.initial}
                onChange={(e) => updateNPI(npi.id, {
                  compliance: { ...npi.compliance, initial: parseFloat(e.target.value) || 0 },
                })}
                min={0}
                max={1}
                step={0.05}
                className="w-full text-xs border border-gray-300 rounded px-1 py-1"
              />
            </div>
          </div>

          {npi.compliance.model === ComplianceModel.ExponentialDecay && (
            <div>
              <label className="block text-xs text-gray-500">Decay rate (per den)</label>
              <input
                type="number"
                value={npi.compliance.decayRate ?? 0}
                onChange={(e) => updateNPI(npi.id, {
                  compliance: { ...npi.compliance, decayRate: parseFloat(e.target.value) || 0 },
                })}
                min={0}
                max={1}
                step={0.001}
                className="w-full text-xs border border-gray-300 rounded px-1 py-1"
              />
            </div>
          )}

          <div className="text-xs text-gray-400">
            Mechanismus: {npi.type === NPIType.BetaMultiplier ? `beta × ${npi.value}` :
              npi.type === NPIType.GammaMultiplier ? `gamma × ${npi.value}` :
              `${npi.targetSubMatrix ?? 'school'} kontakty × ${npi.value}`}
          </div>
        </div>
      ))}
    </div>
  );
}
