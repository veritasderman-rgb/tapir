import { useCallback } from 'react';
import { useGameStore } from '../../store/gameStore';
import {
  NPIType,
  ComplianceModel,
  type NPIConfig,
  getNPIMonthlyCost,
} from '@tapir/core';

let npiCounter = 0;

const NPI_TEMPLATES: { name: string; type: NPIType; value: number; targetSubMatrix?: string }[] = [
  { name: 'Zavreni skol', type: NPIType.ContactSubMatrixModifier, value: 0.3, targetSubMatrix: 'school' },
  { name: 'Prace z domova', type: NPIType.ContactSubMatrixModifier, value: 0.5, targetSubMatrix: 'work' },
  { name: 'Omezeni komunity', type: NPIType.BetaMultiplier, value: 0.7 },
  { name: 'Povinne rousky', type: NPIType.BetaMultiplier, value: 0.85 },
];

export default function ActionPanel() {
  const {
    pendingNPIs,
    addNPI,
    removeNPI,
    updateNPI,
    vaccinationEnabled,
    setVaccinationEnabled,
    vaccinationUnlocked,
    gameScenario,
    checkpoint,
    submitTurn,
    currentMonth,
    gamePhase,
  } = useGameStore();

  const socialCapital = checkpoint?.socialCapital ?? 100;

  const totalMonthlyCost = pendingNPIs.reduce((s, npi) => s + getNPIMonthlyCost(npi), 0);

  const handleAddNPI = useCallback((template: typeof NPI_TEMPLATES[number]) => {
    const npi: NPIConfig = {
      id: `game-npi-${++npiCounter}`,
      name: template.name,
      type: template.type,
      startDay: 0,
      endDay: 30,
      value: template.value,
      targetSubMatrix: template.targetSubMatrix as any,
      compliance: {
        model: ComplianceModel.ExponentialDecay,
        initial: 1.0,
        decayRate: 0,
      },
    };
    addNPI(npi);
  }, [addNPI]);

  const isFinished = gamePhase === 'finished';

  return (
    <div className="space-y-4">
      {/* Social capital gauge */}
      <div className="bg-white border border-gray-200 rounded-lg p-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold text-gray-600">Socialni kapital</span>
          <span className={`text-sm font-bold ${socialCapital < 20 ? 'text-red-600' : socialCapital < 50 ? 'text-amber-600' : 'text-green-600'}`}>
            {Math.round(socialCapital)}%
          </span>
        </div>
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden" role="progressbar" aria-valuenow={socialCapital} aria-valuemin={0} aria-valuemax={100}>
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              socialCapital < 20 ? 'bg-red-500' : socialCapital < 50 ? 'bg-amber-500' : 'bg-green-500'
            }`}
            style={{ width: `${socialCapital}%` }}
          />
        </div>
        {socialCapital < 20 && (
          <p className="text-[10px] text-red-600 mt-1 font-medium">
            Populace zacina ignorovat opatreni!
          </p>
        )}
        {totalMonthlyCost > 0 && (
          <p className="text-[10px] text-gray-500 mt-1">
            Naklady opatreni: ~{Math.round(totalMonthlyCost)} bodu/mesic
          </p>
        )}
      </div>

      {/* Available NPIs */}
      <div className="bg-white border border-gray-200 rounded-lg p-3">
        <h3 className="text-xs font-semibold text-gray-600 mb-2">Dostupna opatreni</h3>
        <div className="grid grid-cols-2 gap-2">
          {NPI_TEMPLATES.map((t, i) => {
            const isActive = pendingNPIs.some(n => n.name === t.name);
            const cost = getNPIMonthlyCost({
              id: '', name: t.name, type: t.type, startDay: 0, endDay: 30, value: t.value,
              compliance: { model: ComplianceModel.ExponentialDecay, initial: 1, decayRate: 0 },
            });
            return (
              <button
                key={i}
                onClick={() => {
                  if (isActive) {
                    const npi = pendingNPIs.find(n => n.name === t.name);
                    if (npi) removeNPI(npi.id);
                  } else {
                    handleAddNPI(t);
                  }
                }}
                disabled={isFinished}
                className={`text-left text-xs p-2 rounded border transition-colors ${
                  isActive
                    ? 'bg-blue-50 border-blue-300 text-blue-800'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                } ${isFinished ? 'opacity-50 cursor-not-allowed' : ''}`}
                aria-pressed={isActive}
              >
                <div className="font-medium">{t.name}</div>
                <div className="text-[10px] mt-0.5 opacity-70">
                  efekt: {Math.round((1 - t.value) * 100)}% redukce | cena: {Math.round(cost)}/mes
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active NPI intensity tuning */}
      {pendingNPIs.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-3 space-y-2">
          <h3 className="text-xs font-semibold text-gray-600">Aktivni opatreni — intenzita</h3>
          {pendingNPIs.map(npi => (
            <div key={npi.id} className="flex items-center gap-2">
              <span className="text-xs text-gray-700 w-28 truncate">{npi.name}</span>
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round((1 - npi.value) * 100)}
                onChange={(e) => updateNPI(npi.id, { value: 1 - parseInt(e.target.value) / 100 })}
                className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                aria-label={`Intenzita ${npi.name}`}
              />
              <span className="text-xs text-gray-500 w-10 text-right">{Math.round((1 - npi.value) * 100)}%</span>
            </div>
          ))}
        </div>
      )}

      {/* Vaccination toggle */}
      {vaccinationUnlocked && (
        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <label className="flex items-center gap-2 text-xs text-gray-700">
            <input
              type="checkbox"
              checked={vaccinationEnabled}
              onChange={(e) => setVaccinationEnabled(e.target.checked)}
              disabled={isFinished}
            />
            <span className="font-medium">Aktivovat ockovaci kampan</span>
          </label>
        </div>
      )}

      {/* Submit turn */}
      {!isFinished && (
        <button
          onClick={submitTurn}
          className="w-full py-3 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors"
        >
          Simulovat mesic {currentMonth + 1}
        </button>
      )}
    </div>
  );
}
