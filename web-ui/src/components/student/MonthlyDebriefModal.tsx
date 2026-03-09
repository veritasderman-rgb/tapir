import { useGameStore } from '../../store/gameStore';
import type { MonthlyReport } from '@tapir/core';

export default function MonthlyDebriefModal() {
  const { lastReport, showDebrief, dismissDebrief, gamePhase, enterDebrief } = useGameStore();

  if (!showDebrief || !lastReport) return null;

  const r = lastReport;
  const isLast = gamePhase === 'finished';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" role="dialog" aria-modal="true" aria-label="Mesicni report">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6 space-y-4">
        <h2 className="text-lg font-bold text-gray-900">
          Report — mesic {r.month}
        </h2>

        {/* Activated events */}
        {r.activatedEvents.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded p-2">
            <p className="text-xs font-bold text-amber-800">Nova udalost!</p>
            {r.activatedEvents.map((e, i) => (
              <p key={i} className="text-xs text-amber-700">{e}</p>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <ReportStat label="Hlasene pripady" value={r.observedInfections.toLocaleString()} />
          <ReportStat label="Hospitalizace" value={r.newHospitalizations.toLocaleString()} />
          <ReportStat label="ICU" value={r.newICU.toLocaleString()} />
          <ReportStat label="Umrti" value={r.newDeaths.toLocaleString()} highlight={r.newDeaths > 0} />
          <ReportStat label="Odhad Reff" value={r.estimatedReff.toFixed(2)} highlight={r.estimatedReff > 1} />
          <ReportStat label="Socialni kapital" value={`${r.socialCapital.toFixed(0)}%`} highlight={r.socialCapital < 30} />
          <ReportStat label="Obsazenost nemocnic" value={r.hospitalOccupancy.toLocaleString()} />
          <ReportStat label="Obsazenost ICU" value={r.icuOccupancy.toLocaleString()} />
        </div>

        {r.socialCapital < 20 && (
          <div className="bg-red-50 border border-red-200 rounded p-2">
            <p className="text-xs text-red-800 font-medium">
              Socialni kapital je kriticky nizky! Populace zacina ignorovat opatreni.
            </p>
          </div>
        )}

        <div className="flex gap-2">
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
