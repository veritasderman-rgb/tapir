import { useMemo } from 'react';
import { useGameStore } from '../../store/gameStore';
import { getMeasureById, getMeasuresByCategory, type GameMeasure } from '@tapir/core';
import TrustBar from './TrustBar';

const CATEGORY_LABELS: Record<string, string> = {
  masks: 'Rousky a respiratory',
  social_distancing: 'Socialni opatreni',
  testing: 'Testovani a trasovani',
  travel: 'Cestovni omezeni',
  vaccination: 'Vakcinace',
  military: 'Armada',
  international: 'Mezinarodni',
  economic: 'Ekonomicka podpora',
};

const CATEGORY_ORDER = ['masks', 'social_distancing', 'testing', 'travel', 'vaccination', 'military', 'international', 'economic'];

export default function ActionPanel() {
  const {
    activeMeasureIds,
    toggleMeasure,
    checkpoint,
    gameScenario,
    submitTurn,
    currentTurn,
    gamePhase,
    vaccinationPriority,
    setVaccinationPriority,
  } = useGameStore();

  const socialCapital = checkpoint?.socialCapital ?? 100;
  const economicState = checkpoint?.economicState;
  const unlockedIds = checkpoint?.unlockedMeasureIds ?? [];
  const isFinished = gamePhase === 'finished';

  // Group unlocked measures by category
  const categorizedMeasures = useMemo(() => {
    const result: { category: string; label: string; measures: GameMeasure[] }[] = [];
    for (const cat of CATEGORY_ORDER) {
      const measures = getMeasuresByCategory(cat as GameMeasure['category'])
        .filter(m => unlockedIds.includes(m.id));
      if (measures.length > 0) {
        result.push({ category: cat, label: CATEGORY_LABELS[cat] ?? cat, measures });
      }
    }
    return result;
  }, [unlockedIds]);

  const totalPoliticalCost = activeMeasureIds.reduce((s, id) => {
    const m = getMeasureById(id);
    return s + (m?.politicalCostPerTurn ?? 0);
  }, 0);

  const totalEconomicCost = activeMeasureIds.reduce((s, id) => {
    const m = getMeasureById(id);
    return s + (m?.economicCostPerTurn ?? 0);
  }, 0);

  // Check exclusive groups
  const getActiveInGroup = (group: string): string | null => {
    for (const id of activeMeasureIds) {
      const m = getMeasureById(id);
      if (m?.exclusiveGroup === group) return id;
    }
    return null;
  };

  const handleToggle = (measure: GameMeasure) => {
    if (isFinished) return;

    // If this measure has an exclusive group, deactivate the other one first
    if (measure.exclusiveGroup) {
      const active = getActiveInGroup(measure.exclusiveGroup);
      if (active && active !== measure.id) {
        toggleMeasure(active); // remove old
      }
    }
    toggleMeasure(measure.id);
  };

  // Check if vaccination capacity is available (any vax measure active)
  const hasVaxCapacity = activeMeasureIds.some(id =>
    id === 'vaccination_slow' || id === 'vaccination_fast' || id === 'vaccination_max',
  );

  return (
    <div className="space-y-3">
      {/* Trust / Crisis management bar */}
      <TrustBar />

      {/* Government down overlay */}
      {useGameStore.getState().governmentDownRounds > 0 && (
        <div className="bg-red-100 border-2 border-red-400 rounded-lg p-3 text-center">
          <p className="text-xs font-bold text-red-800">
            Vláda padla — opatření nelze měnit
          </p>
          <p className="text-[10px] text-red-600 mt-1">
            Zbývá {useGameStore.getState().governmentDownRounds} kol do ustanovení nové vlády
          </p>
        </div>
      )}

      {/* Social capital gauge */}
      <div className="bg-white border border-gray-200 rounded-lg p-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold text-gray-600">Socialni kapital</span>
          <span className={`text-sm font-bold ${socialCapital < 20 ? 'text-red-600' : socialCapital < 50 ? 'text-amber-600' : 'text-green-600'}`}>
            {Math.round(socialCapital)}
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
      </div>

      {/* Economic snapshot */}
      {economicState && (
        <div className="bg-white border border-gray-200 rounded-lg p-2">
          <div className="grid grid-cols-2 gap-1 text-[10px]">
            <div>
              <span className="text-gray-500">HDP:</span>
              <span className={`ml-1 font-bold ${economicState.gdpImpact < -2 ? 'text-red-600' : 'text-gray-700'}`}>
                {economicState.gdpImpact > 0 ? '+' : ''}{economicState.gdpImpact.toFixed(1)}%
              </span>
            </div>
            <div>
              <span className="text-gray-500">Nezam.:</span>
              <span className={`ml-1 font-bold ${economicState.unemploymentDelta > 3 ? 'text-red-600' : 'text-gray-700'}`}>
                +{economicState.unemploymentDelta.toFixed(1)}pp
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Cost summary */}
      {activeMeasureIds.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded p-2 text-[10px]">
          <span className="text-amber-800 font-medium">
            Politicka cena: {totalPoliticalCost > 0 ? '-' : '+'}{Math.abs(totalPoliticalCost)}/tah |
            Ekonomicka: -{(totalEconomicCost * 100).toFixed(0)}% HDP/tah
          </span>
        </div>
      )}

      {/* Categorized measures */}
      {categorizedMeasures.map(({ category, label, measures }) => (
        <div key={category} className="bg-white border border-gray-200 rounded-lg p-2">
          <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">{label}</h3>
          <div className="space-y-1">
            {measures.map(m => {
              const isActive = activeMeasureIds.includes(m.id);
              const isOneShot = m.oneShot && isActive; // already used
              return (
                <button
                  key={m.id}
                  onClick={() => handleToggle(m)}
                  disabled={isFinished || isOneShot}
                  className={`w-full text-left text-xs p-1.5 rounded border transition-colors ${
                    isActive
                      ? 'bg-blue-50 border-blue-300 text-blue-800'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                  } ${(isFinished || isOneShot) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  aria-pressed={isActive}
                  title={m.description}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium truncate">{m.name}</span>
                    <span className={`text-[9px] ml-1 flex-shrink-0 ${m.politicalCostPerTurn < 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {m.politicalCostPerTurn > 0 ? `-${m.politicalCostPerTurn}` : `+${Math.abs(m.politicalCostPerTurn)}`}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Vaccination priority (when vax measures active) */}
      {hasVaxCapacity && (
        <div className="bg-white border border-gray-200 rounded-lg p-2">
          <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Priorita ockovani</h3>
          <select
            value={vaccinationPriority?.stratumOrder[0] ?? -1}
            onChange={(e) => {
              const first = parseInt(e.target.value);
              if (first < 0) {
                setVaccinationPriority(null);
              } else {
                const order = [first, ...Array.from({ length: 6 }, (_, i) => i).filter(i => i !== first)];
                const capacity = activeMeasureIds.includes('vaccination_max') ? 25000 :
                  activeMeasureIds.includes('vaccination_fast') ? 10000 : 3000;
                setVaccinationPriority({ stratumOrder: order, dailyCapacity: capacity });
              }
            }}
            className="w-full text-xs border rounded px-2 py-1"
            disabled={isFinished}
          >
            <option value={-1}>Vypnout ockovani</option>
            <option value={4}>Seniori 65+ (vysokorizikovi)</option>
            <option value={5}>Seniori 65+ (nizkorizikovi)</option>
            <option value={2}>Dospeli 18-64 (vysokorizikovi)</option>
            <option value={3}>Dospeli 18-64 (nizkorizikovi)</option>
            <option value={0}>Mladi 0-17 (vysokorizikovi)</option>
            <option value={1}>Mladi 0-17 (nizkorizikovi)</option>
          </select>
        </div>
      )}

      {/* Submit turn */}
      {!isFinished && (
        <button
          onClick={submitTurn}
          className="w-full py-3 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors"
        >
          Zasedani stab — kolo {currentTurn + 1}
        </button>
      )}
    </div>
  );
}
