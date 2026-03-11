import { useState, useMemo } from 'react';
import { useGameStore } from '../../store/gameStore';
import { getMeasureById, getMeasuresByCategory, type GameMeasure, NPIType } from '@tapir/core';
import TrustBar from './TrustBar';

const CATEGORY_LABELS: Record<string, string> = {
  masks: 'Roušky a respirátory',
  social_distancing: 'Sociální opatření',
  testing: 'Testování a trasování',
  travel: 'Cestovní omezení',
  vaccination: 'Vakcinace',
  military: 'Armáda',
  international: 'Mezinárodní',
  economic: 'Ekonomická podpora',
};

const CATEGORY_ORDER = ['masks', 'social_distancing', 'testing', 'travel', 'vaccination', 'military', 'international', 'economic'];

/** Human-readable effectiveness label from NPI effect. */
function effectivenessLabel(m: GameMeasure): string {
  const e = m.npiEffect;
  if (e.type === NPIType.BetaMultiplier) {
    const pct = Math.round((1 - e.value) * 100);
    if (pct <= 0) return 'Nepřímo';
    if (pct <= 5) return `Mírný (−${pct} % přenos)`;
    if (pct <= 15) return `Střední (−${pct} % přenos)`;
    return `Silný (−${pct} % přenos)`;
  }
  if (e.type === NPIType.ContactSubMatrixModifier) {
    const pct = Math.round((1 - e.value) * 100);
    const target = e.targetSubMatrix === 'school' ? 'školy' : e.targetSubMatrix === 'work' ? 'práce' : 'komunita';
    return `−${pct} % kontaktů (${target})`;
  }
  return '—';
}

function costLabel(cost: number): string {
  if (cost <= 0.01) return 'Zanedbatelná';
  if (cost <= 0.05) return 'Nízká';
  if (cost <= 0.15) return 'Střední';
  if (cost <= 0.3) return 'Vysoká';
  return 'Extrémní';
}

function politicalLabel(cost: number): string {
  if (cost <= -3) return 'Získává podporu';
  if (cost < 0) return 'Mírně populární';
  if (cost === 0) return 'Neutrální';
  if (cost <= 3) return 'Nízká';
  if (cost <= 8) return 'Střední';
  if (cost <= 15) return 'Vysoká';
  return 'Extrémní';
}

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
    crisisLeader,
    requestFinancialSupport,
    setRequestFinancialSupport,
    trust,
  } = useGameStore();

  const socialCapital = checkpoint?.socialCapital ?? 100;
  const economicState = checkpoint?.economicState;
  const unlockedIds = checkpoint?.unlockedMeasureIds ?? [];
  const isFinished = gamePhase === 'finished';

  const categorizedMeasures = useMemo(() => {
    const result: { category: string; label: string; measures: GameMeasure[] }[] = [];
    for (const cat of CATEGORY_ORDER) {
      const measures = getMeasuresByCategory(cat as GameMeasure['category'])
        .filter(m => unlockedIds.includes(m.id));
      if (measures.length > 0) {
        result.push({ category: cat, label: CATEGORY_LABELS[cat] || cat, measures });
      }
    }
    return result;
  }, [unlockedIds]);

  /** Whether a measure is available to the current leader */
  const isMeasureAvailable = (m: GameMeasure): boolean => {
    const auth = m.authority ?? 'both';
    if (auth === 'both' || auth === 'hygienik') return true;
    return crisisLeader === 'premier';
  };

  const hasVaxCapacity = activeMeasureIds.some(id => id.startsWith('vaccination_'));
  const [hoveredMeasure, setHoveredMeasure] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Stav společnosti</h3>
        <div className="space-y-3">
          <TrustBar label="Důvěra veřejnosti" value={trust} />
          <div>
            <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase mb-1">
              <span>Sociální kapitál</span>
              <span>{Math.round(socialCapital)} %</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ${socialCapital < 30 ? 'bg-red-500' : 'bg-green-500'}`}
                style={{ width: `${socialCapital}%` }}
              />
            </div>
          </div>
          {economicState && (
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div>
                <span className="text-gray-400 uppercase">HDP:</span>
                <span className={`ml-1 font-bold ${economicState.gdpImpact < 0 ? 'text-red-500' : 'text-gray-700'}`}>
                  {economicState.gdpImpact.toFixed(1)} %
                </span>
              </div>
              <div>
                <span className="text-gray-400 uppercase">Nezaměst.:</span>
                <span className="ml-1 font-bold text-gray-700">+{economicState.unemploymentDelta.toFixed(1)} %</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Government Support Request */}
      {!isFinished && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <h3 className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-2">Vládní podpora</h3>
          <button
            onClick={() => setRequestFinancialSupport(true)}
            disabled={requestFinancialSupport}
            className={`w-full py-2 text-xs font-bold rounded border transition-colors ${
                requestFinancialSupport
                ? 'bg-blue-100 text-blue-400 border-blue-200 cursor-not-allowed'
                : 'bg-white text-blue-600 border-blue-300 hover:bg-blue-100'
            }`}
          >
            {requestFinancialSupport ? '⏳ Žádost odeslána' : '💰 Žádat o finanční podporu'}
          </button>
          <p className="text-[9px] text-blue-400 mt-1 italic leading-tight">
            Snižuje ekonomické škody a pnutí, ale vyžaduje schválení MF.
          </p>
        </div>
      )}

      {categorizedMeasures.map(cat => (
        <div key={cat.category} className="space-y-1.5">
          <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider px-1">{cat.label}</h3>
          <div className="space-y-1">
            {cat.measures.map(m => {
              const isActive = activeMeasureIds.includes(m.id);
              const isHovered = hoveredMeasure === m.id;
              const available = isMeasureAvailable(m);
              const disabled = isFinished || !available;
              return (
                <div
                  key={m.id}
                  onMouseEnter={() => setHoveredMeasure(m.id)}
                  onMouseLeave={() => setHoveredMeasure(null)}
                >
                  <button
                    onClick={() => available && toggleMeasure(m.id)}
                    disabled={disabled}
                    className={`w-full text-left px-3 py-2 rounded-lg border text-xs transition-all ${
                      !available
                        ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed opacity-60'
                        : isActive
                        ? 'bg-blue-50 border-blue-300 text-blue-700 ring-1 ring-blue-300'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-bold flex justify-between items-center">
                      <span>{m.name}</span>
                      {!available && <span className="text-[9px] text-gray-400">🔒 Premiér</span>}
                      {available && isActive && <span className="text-[10px]">✓</span>}
                    </div>
                  </button>
                  {isHovered && (
                    <div className="mx-1 mt-0.5 mb-1 px-2.5 py-2 bg-gray-50 border border-gray-200 rounded-md text-[10px] text-gray-600 leading-relaxed space-y-1.5 animate-in fade-in">
                      <p>{m.description}</p>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[9px] font-medium text-gray-500">
                        <span title="Účinnost">⚕ {effectivenessLabel(m)}</span>
                        <span title="Ekonomická cena">💰 {costLabel(m.economicCostPerTurn)}</span>
                        <span title="Politická cena">🏛 {politicalLabel(m.politicalCostPerTurn)}</span>
                        {m.rampUpDays > 0 && <span title="Náběh">⏱ {m.rampUpDays} dní náběh</span>}
                        {m.detectionRateBonus && <span title="Záchyt">🔍 +{Math.round(m.detectionRateBonus * 100)} % záchyt</span>}
                        {m.hospitalCapacityMultiplier && m.hospitalCapacityMultiplier > 1 && <span title="Kapacita">🏥 ×{m.hospitalCapacityMultiplier} lůžek</span>}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {hasVaxCapacity && (
        <div className="bg-white border border-gray-200 rounded-lg p-2">
          <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Priorita očkování</h3>
          <select
            value={vaccinationPriority?.stratumOrder[0] ?? -1}
            onChange={(e) => {
              const first = parseInt(e.target.value);
              if (first < 0) {
                setVaccinationPriority(null);
              } else {
                const order = [first, ...Array.from({ length: 6 }, (_, i) => i).filter(i => i !== first)];
                let capacity = 3000;
                if (activeMeasureIds.includes('vaccination_max')) capacity = 25000;
                else if (activeMeasureIds.includes('vaccination_centers')) capacity = 15000;
                else if (activeMeasureIds.includes('vaccination_standard')) capacity = 5000;

                setVaccinationPriority({ stratumOrder: order, dailyCapacity: capacity });
              }
            }}
            className="w-full text-xs border rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 outline-none"
            disabled={isFinished}
          >
            <option value={-1}>Vypnout očkování</option>
            <option value={4}>Senioři 65+ (vysokorizikoví)</option>
            <option value={5}>Senioři 65+ (nízkorizikoví)</option>
            <option value={2}>Dospělí 18-64 (vysokorizikoví)</option>
            <option value={3}>Dospělí 18-64 (nízkorizikoví)</option>
            <option value={0}>Mladí 0-17 (vysokorizikoví)</option>
            <option value={1}>Mladí 0-17 (nízkorizikoví)</option>
          </select>
        </div>
      )}

      {!isFinished && (
        <button
          onClick={submitTurn}
          className="w-full py-3 bg-blue-600 text-white text-sm font-black uppercase tracking-tighter rounded-xl hover:bg-blue-700 transition-all shadow-lg active:scale-95"
        >
          Zasedání štábu — kolo {currentTurn + 1}
        </button>
      )}
    </div>
  );
}
