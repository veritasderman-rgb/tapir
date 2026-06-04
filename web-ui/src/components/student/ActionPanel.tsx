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

  const govApprovedMeasures = useGameStore((s) => s.govApprovedMeasures);

  /** Whether a measure is a premier-only measure that hygienist must request */
  const isPremierRequest = (m: GameMeasure): boolean => {
    if (crisisLeader === 'premier') return false;
    return (m.authority ?? 'both') === 'premier';
  };

  /** Get status of a government-requested measure */
  const getGovStatus = (measureId: string): string | null => {
    if (!(measureId in govApprovedMeasures)) return null;
    const turnsLeft = govApprovedMeasures[measureId];
    if (turnsLeft === 0) return 'schváleno';
    return `legislativa: ${turnsLeft} ${turnsLeft === 1 ? 'kolo' : 'kola'}`;
  };

  const hasVaxCapacity = activeMeasureIds.some(id => id.startsWith('vaccination_'));
  // Tap-to-expand detail opatření.
  const [expandedMeasure, setExpandedMeasure] = useState<string | null>(null);

  const activeCount = activeMeasureIds.length;

  return (
    <div className="space-y-5 pb-4">
      {/* Stav společnosti */}
      <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 grid gap-4 sm:grid-cols-2">
        <TrustBar label="Důvěra veřejnosti" value={trust} />
        <div>
          <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase mb-1">
            <span>Sociální kapitál</span>
            <span>{Math.round(socialCapital)} %</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ${socialCapital < 30 ? 'bg-brand-red' : 'bg-brand-ok'}`}
              style={{ width: `${socialCapital}%` }}
            />
          </div>
          {economicState && (
            <div className="flex gap-4 text-[11px] mt-2">
              <span className="text-gray-400 uppercase">
                HDP:
                <span className={`ml-1 font-bold ${economicState.gdpImpact < 0 ? 'text-brand-red' : 'text-gray-700'}`}>
                  {economicState.gdpImpact.toFixed(1)} %
                </span>
              </span>
              <span className="text-gray-400 uppercase">
                Nezaměst.:
                <span className="ml-1 font-bold text-gray-700">+{economicState.unemploymentDelta.toFixed(1)} %</span>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Vládní podpora */}
      {!isFinished && (
        <div className="bg-brand-teal-soft/50 border-2 border-brand-teal/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1">
            <h3 className="eyebrow text-brand-teal-dark">Vládní podpora</h3>
            <p className="text-xs text-brand-slate mt-1">Snižuje ekonomické škody a pnutí, vyžaduje schválení MF.</p>
          </div>
          <button
            onClick={() => setRequestFinancialSupport(true)}
            disabled={requestFinancialSupport}
            className={`min-h-[44px] px-5 text-sm font-bold rounded-xl border-2 transition-colors flex-shrink-0 ${
              requestFinancialSupport
                ? 'bg-white text-brand-slate border-gray-200 cursor-not-allowed'
                : 'bg-brand-teal text-white border-brand-teal hover:bg-brand-teal-dark'
            }`}
          >
            {requestFinancialSupport ? 'Žádost odeslána' : 'Žádat o finanční podporu'}
          </button>
        </div>
      )}

      {/* Opatření po kategoriích — velké karty */}
      {categorizedMeasures.map(cat => (
        <div key={cat.category}>
          <h3 className="eyebrow mb-2 px-1">{cat.label}</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {cat.measures.map(m => {
              const isActive = activeMeasureIds.includes(m.id);
              const isExpanded = expandedMeasure === m.id;
              const isRequest = isPremierRequest(m);
              const govStatus = getGovStatus(m.id);
              return (
                <div
                  key={m.id}
                  className={`rounded-2xl border-2 transition-all overflow-hidden ${
                    isRequest
                      ? isActive
                        ? 'border-brand-mustard bg-brand-mustard-soft/50'
                        : 'border-brand-mustard/40 bg-white'
                      : isActive
                      ? 'border-brand-teal bg-brand-teal-soft/50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <button
                    onClick={() => !isFinished && toggleMeasure(m.id)}
                    disabled={isFinished}
                    className="w-full text-left p-4 disabled:opacity-70"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-sm text-brand-charcoal leading-snug">{m.name}</span>
                      <span
                        className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          isActive
                            ? isRequest
                              ? 'bg-brand-mustard border-brand-mustard text-white'
                              : 'bg-brand-teal border-brand-teal text-white'
                            : 'border-gray-300'
                        }`}
                      >
                        {isActive && (
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-2 text-[11px] font-medium text-brand-slate">
                      <span><span className="text-gray-400">Účinnost:</span> <span className="font-bold text-brand-teal-dark">{effectivenessLabel(m)}</span></span>
                      <span><span className="text-gray-400">Cena:</span> {costLabel(m.economicCostPerTurn)}</span>
                    </div>
                    {(isRequest || govStatus) && (
                      <div className="mt-2 text-[11px] font-bold">
                        {isRequest && !isActive && !govStatus && <span className="text-brand-mustard-dark">🏛 Vyžaduje žádost vládě</span>}
                        {isRequest && isActive && !govStatus && <span className="text-brand-mustard-dark">🏛 Žádost k odeslání</span>}
                        {govStatus === 'schváleno' && <span className="text-brand-ok">✓ Schváleno</span>}
                        {govStatus && govStatus !== 'schváleno' && <span className="text-brand-mustard-dark">⏳ {govStatus}</span>}
                      </div>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setExpandedMeasure(isExpanded ? null : m.id)}
                    aria-expanded={isExpanded}
                    className="w-full text-left px-4 py-2 border-t border-gray-100 text-[11px] font-semibold text-brand-slate hover:bg-gray-50 transition-colors flex items-center justify-between"
                  >
                    <span>Detaily</span>
                    <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {isExpanded && (
                    <div className="px-4 pb-3 text-xs text-brand-slate leading-relaxed space-y-2 animate-in fade-in">
                      <p>{m.description}</p>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-gray-500">
                        <span>🏛 Politicky: {politicalLabel(m.politicalCostPerTurn)}</span>
                        {m.rampUpDays > 0 && <span>⏱ {m.rampUpDays} dní náběh</span>}
                        {m.detectionRateBonus && <span>🔍 +{Math.round(m.detectionRateBonus * 100)} % záchyt</span>}
                        {m.hospitalCapacityMultiplier && m.hospitalCapacityMultiplier > 1 && <span>🏥 ×{m.hospitalCapacityMultiplier} lůžek</span>}
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
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-4">
          <h3 className="eyebrow mb-2">Priorita očkování</h3>
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
            className="w-full text-sm border border-gray-300 rounded-lg px-3 min-h-[44px] focus:ring-2 focus:ring-brand-teal outline-none"
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
        <div className="sticky bottom-0 -mx-4 px-4 pt-3 pb-4 bg-gradient-to-t from-brand-cream via-brand-cream to-transparent">
          <button
            onClick={submitTurn}
            className="w-full min-h-[56px] bg-brand-teal text-white text-base font-black uppercase tracking-tight rounded-2xl hover:bg-brand-teal-dark transition-all shadow-lg active:scale-[0.98]"
          >
            Zasedání štábu — kolo {currentTurn + 1}
            <span className="block text-[11px] font-semibold normal-case tracking-normal opacity-90 mt-0.5">
              {activeCount} {activeCount === 1 ? 'opatření aktivní' : activeCount >= 2 && activeCount <= 4 ? 'opatření aktivní' : 'opatření aktivních'}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
