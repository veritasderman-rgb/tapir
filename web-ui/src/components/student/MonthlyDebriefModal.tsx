import { useGameStore } from '../../store/gameStore';
import type { TurnReport, AdvisorMessage } from '@tapir/core';

export default function MonthlyDebriefModal() {
  const { lastTurnReport, showDebrief, dismissDebrief, gamePhase, enterDebrief, trust } = useGameStore();

  if (!showDebrief || !lastTurnReport) return null;

  const r = lastTurnReport;
  const isLast = gamePhase === 'finished';
  const livesSaved = (r as any).livesSaved ?? 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4" role="dialog" aria-modal="true">
      <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-2xl w-full flex flex-col max-h-[90vh] overflow-hidden border border-gray-100">
        <div className="bg-gray-900 text-white px-8 py-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tighter italic">Hlášení štábu</h2>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{r.dateLabel} (Kolo {r.turnNumber})</p>
          </div>
          {livesSaved > 0 && (
            <div className="bg-green-500/10 border border-green-500/20 px-4 py-2 rounded-2xl text-right">
              <div className="text-[9px] text-green-500 font-black uppercase leading-none mb-1">Zachráněné životy</div>
              <div className="text-xl font-black text-green-400 tabular-nums">+{livesSaved.toLocaleString()}</div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {/* Headlines */}
          {r.headlines.length > 0 && (
            <div className="grid grid-cols-1 gap-3">
              {r.headlines.map((h, i) => (
                <div key={i} className="bg-gray-50 border-l-4 border-gray-900 p-4 rounded-r-2xl italic text-xs text-gray-700 leading-relaxed font-medium">
                  "{h}"
                </div>
              ))}
            </div>
          )}

          {/* Key stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ReportStat label="Hlášeno" value={r.observedInfections.toLocaleString()} />
            <ReportStat label="Skutečnost" value={r.trueInfections.toLocaleString()} highlight={r.trueInfections > r.observedInfections * 1.5} />
            <ReportStat label="Nová úmrtí" value={r.newDeaths.toLocaleString()} highlight={r.newDeaths > 50} />
            <ReportStat label="JIP Kapacita" value={`${Math.round((r.icuOccupancy / Math.max(1, r.icuCapacity)) * 100)} %`} highlight={r.icuOccupancy > r.icuCapacity} />
            <ReportStat label="Důvěra" value={`${Math.round(trust)} %`} highlight={trust < 40} />
            <ReportStat label="HDP dopad" value={`${r.economicState.gdpImpact.toFixed(1)} %`} highlight={r.economicState.gdpImpact < -5} />
            <ReportStat label="Sociál. kapitál" value={`${Math.round(r.socialCapital)} %`} highlight={r.socialCapital < 40} />
            <ReportStat label="Nezaměstnanost" value={`+${r.economicState.unemploymentDelta.toFixed(1)} %`} />
          </div>

          {/* Events */}
          {(r.activatedEvents.length > 0 || r.newlyUnlockedMeasures.length > 0) && (
             <div className="space-y-3">
                {r.activatedEvents.map((e, i) => (
                    <div key={i} className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-xs text-amber-900 flex gap-4 items-center shadow-sm">
                        <span className="text-2xl animate-pulse">⚠️</span>
                        <div>
                            <span className="font-black block uppercase text-[9px] mb-1 tracking-widest text-amber-600">Mimořádná situace</span>
                            <p className="font-bold">{e.label}</p>
                        </div>
                    </div>
                ))}
             </div>
          )}

          {/* Advisors */}
          <div className="space-y-6">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100 pb-3">Konzultace s poradci</h3>
            <div className="space-y-4">
              {r.advisorMessages.map((msg, i) => (
                <AdvisorCard key={i} advisor={msg} />
              ))}
            </div>
          </div>
        </div>

        <div className="bg-gray-50 px-8 py-6 border-t border-gray-100 flex justify-end">
          {isLast ? (
            <button
              onClick={enterDebrief}
              className="w-full md:w-auto px-12 py-4 bg-red-600 text-white font-black uppercase tracking-widest text-sm rounded-2xl hover:bg-red-700 shadow-xl transition-all"
            >
              Závěrečné vyhodnocení
            </button>
          ) : (
            <button
              onClick={dismissDebrief}
              className="w-full md:w-auto px-12 py-4 bg-gray-900 text-white font-black uppercase tracking-widest text-sm rounded-2xl hover:bg-black shadow-xl transition-all"
            >
              Rozumím
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ReportStat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
      <div className="text-[9px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">{label}</div>
      <div className={`text-lg font-black tracking-tight ${highlight ? 'text-red-600' : 'text-gray-900'}`}>{value}</div>
    </div>
  );
}

const ADVISOR_COLORS: Record<string, string> = {
  epidemiologist: 'border-blue-500 bg-blue-50/30 text-blue-900',
  economist: 'border-emerald-500 bg-emerald-50/30 text-emerald-900',
  politician: 'border-purple-500 bg-purple-50/30 text-purple-900',
  military: 'border-amber-500 bg-amber-50/30 text-amber-900',
  opposition: 'border-red-500 bg-red-50/30 text-red-900',
};

const URGENCY_BADGE: Record<string, string> = {
  low: 'bg-gray-100 text-gray-500',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-600 text-white shadow-lg',
};

function AdvisorCard({ advisor }: { advisor: AdvisorMessage }) {
  return (
    <div className={`border-l-4 rounded-r-3xl p-5 shadow-sm transition-all hover:shadow-md ${ADVISOR_COLORS[advisor.role] || 'border-gray-200 bg-gray-50'}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-black uppercase tracking-wider">{advisor.name}</span>
        <span className={`text-[8px] px-2 py-1 rounded-full font-black uppercase tracking-[0.1em] ${URGENCY_BADGE[advisor.urgency] || 'bg-gray-100'}`}>
          {advisor.urgency}
        </span>
      </div>
      <p className="text-xs leading-relaxed font-bold italic">"{advisor.message}"</p>
      {advisor.suggestion && (
        <div className="mt-4 pt-3 border-t border-current/10">
           <span className="text-[8px] font-black uppercase opacity-50 block mb-1">Doporučení:</span>
           <span className="text-[11px] font-black uppercase tracking-tight">{advisor.suggestion}</span>
        </div>
      )}
    </div>
  );
}
