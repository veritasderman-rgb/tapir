import { useGameStore } from '../../store/gameStore';
import type { TurnReport, AdvisorMessage } from '@tapir/core';

export default function MonthlyDebriefModal() {
  const { lastTurnReport, showDebrief, dismissDebrief, gamePhase, enterDebrief, trust, crisisLeader, governmentDownRounds } = useGameStore();

  if (!showDebrief || !lastTurnReport) return null;

  const r = lastTurnReport;
  const isLast = gamePhase === 'finished';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" role="dialog" aria-modal="true" aria-label="Report z kola">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 p-5 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="text-center">
          <h2 className="text-lg font-bold text-gray-900">
            Kolo {r.turnNumber} — {r.dateLabel}
          </h2>
        </div>

        {/* Headlines (flavor text) */}
        {r.headlines.length > 0 && (
          <div className="bg-gray-100 rounded p-3 space-y-1">
            {r.headlines.map((h, i) => (
              <p key={i} className="text-xs text-gray-700 italic">{h}</p>
            ))}
          </div>
        )}

        {/* Activated events */}
        {r.activatedEvents.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded p-2">
            <p className="text-xs font-bold text-amber-800">Nova udalost!</p>
            {r.activatedEvents.map((e, i) => (
              <p key={i} className="text-xs text-amber-700">{e.label}</p>
            ))}
          </div>
        )}

        {/* Newly unlocked measures */}
        {r.newlyUnlockedMeasures.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded p-2">
            <p className="text-xs font-bold text-green-800">Odemknuta nova opatreni!</p>
            {r.newlyUnlockedMeasures.map((id, i) => (
              <p key={i} className="text-xs text-green-700">{id}</p>
            ))}
          </div>
        )}

        {/* Key statistics */}
        <div className="grid grid-cols-2 gap-2">
          <ReportStat label="Hlasene pripady" value={r.observedInfections.toLocaleString()} />
          <ReportStat label="Hospitalizace" value={r.newHospitalizations.toLocaleString()} />
          <ReportStat label="ICU" value={r.newICU.toLocaleString()} />
          <ReportStat label="Umrti (kolo)" value={r.newDeaths.toLocaleString()} highlight={r.newDeaths > 50} />
          <ReportStat label="Celkem umrti" value={r.cumulativeDeaths.toLocaleString()} highlight={r.cumulativeDeaths > 500} />
          <ReportStat label="Odhad Reff" value={r.estimatedReff.toFixed(2)} highlight={r.estimatedReff > 1} />
          <ReportStat label="Socialni kapital" value={`${r.socialCapital.toFixed(0)}`} highlight={r.socialCapital < 30} />
          <ReportStat label="Důvěra veřejnosti" value={`${Math.round(trust)}%`} highlight={trust < 20} />
          <ReportStat
            label="Nemocnice"
            value={`${r.hospitalOccupancy} / ${r.hospitalCapacity}`}
            highlight={r.capacityOverflow}
          />
        </div>

        {/* Economic report */}
        <div className="grid grid-cols-3 gap-2">
          <ReportStat
            label="HDP"
            value={`${r.economicState.gdpImpact > 0 ? '+' : ''}${r.economicState.gdpImpact.toFixed(1)}%`}
            highlight={r.economicState.gdpImpact < -3}
          />
          <ReportStat
            label="Nezamestnanost"
            value={`+${r.economicState.unemploymentDelta.toFixed(1)}pp`}
            highlight={r.economicState.unemploymentDelta > 3}
          />
          <ReportStat
            label="Fiskal. naklady"
            value={`${r.economicState.fiscalCost.toFixed(1)} mld`}
          />
        </div>

        {r.capacityOverflow && (
          <div className="bg-red-50 border border-red-200 rounded p-2">
            <p className="text-xs text-red-800 font-medium">
              Kapacita nemocnic byla prekrocena! Dalsi umrti.
            </p>
          </div>
        )}

        {r.socialCapital < 20 && (
          <div className="bg-red-50 border border-red-200 rounded p-2">
            <p className="text-xs text-red-800 font-medium">
              Socialni kapital je kriticky nizky! Populace ignoruje opatreni.
            </p>
          </div>
        )}

        {governmentDownRounds > 0 && (
          <div className="bg-red-100 border-2 border-red-400 rounded p-3">
            <p className="text-xs text-red-900 font-bold">
              ⚠️ VLÁDA PADLA — žádná opatření po dobu {governmentDownRounds} kol!
            </p>
          </div>
        )}

        {crisisLeader === 'premier' && (
          <div className="bg-purple-50 border border-purple-200 rounded p-2">
            <p className="text-xs text-purple-800 font-medium">
              🏛️ Řízení krizového štábu převzal premiér.
            </p>
          </div>
        )}

        {/* Advisor messages */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Poradci</h3>
          {r.advisorMessages.map((a, i) => (
            <AdvisorCard key={i} advisor={a} />
          ))}
        </div>

        <div className="flex gap-2 pt-2">
          {isLast ? (
            <button
              onClick={() => { dismissDebrief(); enterDebrief(); }}
              className="flex-1 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"
            >
              Zobrazit vysledky hry
            </button>
          ) : (
            <button
              onClick={dismissDebrief}
              className="flex-1 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
            >
              Pokracovat
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ReportStat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="bg-gray-50 rounded p-2">
      <div className="text-[10px] text-gray-500">{label}</div>
      <div className={`text-sm font-bold ${highlight ? 'text-red-600' : 'text-gray-900'}`}>{value}</div>
    </div>
  );
}

const ADVISOR_COLORS: Record<string, string> = {
  epidemiologist: 'border-blue-200 bg-blue-50',
  economist: 'border-emerald-200 bg-emerald-50',
  politician: 'border-purple-200 bg-purple-50',
  military: 'border-amber-200 bg-amber-50',
};

const URGENCY_BADGE: Record<string, string> = {
  low: 'bg-gray-200 text-gray-700',
  medium: 'bg-yellow-200 text-yellow-800',
  high: 'bg-orange-200 text-orange-800',
  critical: 'bg-red-200 text-red-800',
};

function AdvisorCard({ advisor }: { advisor: AdvisorMessage }) {
  return (
    <div className={`border rounded p-2 ${ADVISOR_COLORS[advisor.role] ?? 'border-gray-200'}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-bold text-gray-800">{advisor.name}</span>
        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${URGENCY_BADGE[advisor.urgency]}`}>
          {advisor.urgency}
        </span>
      </div>
      <p className="text-xs text-gray-700">{advisor.message}</p>
      {advisor.suggestion && (
        <p className="text-[10px] text-gray-500 mt-1 italic">Navrh: {advisor.suggestion}</p>
      )}
    </div>
  );
}
