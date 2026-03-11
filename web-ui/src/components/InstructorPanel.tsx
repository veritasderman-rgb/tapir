import { useAppStore } from '../store/useAppStore';
import { AppMode } from '@tapir/core';

const LOCKABLE_PARAMS = [
  { path: 'epiConfig.R0', label: 'R₀' },
  { path: 'demographics.totalPopulation', label: 'Populace' },
  { path: 'epiConfig.latentPeriod', label: 'Latentní perioda' },
  { path: 'epiConfig.infectiousPeriod', label: 'Infekční perioda' },
];

export default function InstructorPanel() {
  const { appMode, lockedParams, toggleLockedParam, hiddenEvents, setHiddenEvents, scenario } = useAppStore();

  if (appMode !== AppMode.Instructor) return null;

  const handleExportAssignment = () => {
    const assignment = {
      scenario: {
        ...scenario,
        // Remove hidden events if enabled
        variants: hiddenEvents ? [] : scenario.variants,
      },
      lockedParams: Array.from(lockedParams),
      hiddenEvents: hiddenEvents ? scenario.variants : [],
      instructions: 'Spusťte simulaci a analyzujte výsledky.',
    };

    const blob = new Blob([JSON.stringify(assignment, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'assignment.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 space-y-3">
      <h3 className="text-xs font-semibold text-indigo-800">Instructor panel</h3>

      {/* Lock parameters */}
      <div>
        <label className="block text-xs font-medium text-indigo-700 mb-1">Zamknout parametry (hráč nemůže měnit)</label>
        <div className="space-y-1">
          {LOCKABLE_PARAMS.map((p) => (
            <label key={p.path} className="flex items-center gap-2 text-xs text-indigo-900">
              <input
                type="checkbox"
                checked={lockedParams.has(p.path)}
                onChange={() => toggleLockedParam(p.path)}
              />
              {p.label}
            </label>
          ))}
        </div>
      </div>

      {/* Hidden events */}
      <div>
        <label className="flex items-center gap-2 text-xs text-indigo-900">
          <input
            type="checkbox"
            checked={hiddenEvents}
            onChange={(e) => setHiddenEvents(e.target.checked)}
          />
          Skrýt varianty před hráči (hidden events)
        </label>
        {hiddenEvents && scenario.variants.length > 0 && (
          <p className="text-xs text-indigo-600 mt-1">
            {scenario.variants.length} varianta(y) bude skryta. Hráč uvidí efekt, ale ne konfiguraci.
          </p>
        )}
      </div>

      {/* Export assignment */}
      <button
        onClick={handleExportAssignment}
        className="w-full text-xs px-3 py-2 bg-indigo-100 text-indigo-800 rounded hover:bg-indigo-200 border border-indigo-300"
      >
        Export zadání (assignment JSON)
      </button>

      {/* Debriefing */}
      <div>
        <h4 className="text-xs font-medium text-indigo-700">Debriefing</h4>
        <div className="text-xs text-indigo-600 mt-1 space-y-1">
          <p>Aktivní NPIs: {scenario.npis.length}</p>
          <p>Vakcinace: {scenario.vaccination.enabled ? 'ano' : 'ne'}</p>
          <p>Varianty: {scenario.variants.length} (hidden: {hiddenEvents ? 'ano' : 'ne'})</p>
          <p>Režim: {scenario.stochastic.mode}</p>
        </div>
      </div>
    </div>
  );
}
