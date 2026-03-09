import { useState, useCallback } from 'react';
import { useAppStore } from '../../store/useAppStore';
import {
  type GameScenario,
  type HiddenEvent,
  type HiddenEventType,
  defaultScenario,
  defaultDelayConfig,
  defaultReportingConfig,
  defaultSocialCapitalConfig,
  encodeGameScenario,
} from '@tapir/core';
import EventTimeline from './EventTimeline';
import ParameterPanel from '../ParameterPanel';

const DEFAULT_GAME_DURATION = 12;
const DEFAULT_DAYS_PER_TURN = 30;

export default function ScenarioBuilder() {
  const { scenario } = useAppStore();
  const [durationMonths, setDurationMonths] = useState(DEFAULT_GAME_DURATION);
  const [daysPerTurn, setDaysPerTurn] = useState(DEFAULT_DAYS_PER_TURN);
  const [hiddenEvents, setHiddenEvents] = useState<HiddenEvent[]>([]);
  const [vaccinationLocked, setVaccinationLocked] = useState(true);
  const [exportedUrl, setExportedUrl] = useState<string | null>(null);

  const buildGameScenario = useCallback((): GameScenario => {
    const baseScenario = {
      ...scenario,
      days: durationMonths * daysPerTurn,
      delayConfig: scenario.delayConfig ?? defaultDelayConfig(),
      reportingConfig: scenario.reportingConfig ?? defaultReportingConfig(),
    };

    return {
      baseScenario,
      durationMonths,
      daysPerTurn,
      hiddenEvents,
      socialCapital: defaultSocialCapitalConfig(),
      availableNPITypes: ['beta_multiplier', 'contact_submatrix_modifier'],
      vaccinationLocked,
    };
  }, [scenario, durationMonths, daysPerTurn, hiddenEvents, vaccinationLocked]);

  const handleExport = useCallback(() => {
    const gs = buildGameScenario();
    const encoded = encodeGameScenario(gs);
    const url = `${window.location.origin}${window.location.pathname}?game=${encoded}`;
    setExportedUrl(url);
    navigator.clipboard.writeText(url).catch(() => {});
  }, [buildGameScenario]);

  const handleDownload = useCallback(() => {
    const gs = buildGameScenario();
    const blob = new Blob([JSON.stringify(gs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `game-scenario-${durationMonths}m.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [buildGameScenario, durationMonths]);

  return (
    <div className="space-y-6 p-4 max-w-4xl mx-auto">
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
        <h2 className="text-lg font-bold text-indigo-900 mb-1">Tvorba scenare hry</h2>
        <p className="text-xs text-indigo-700">
          Nastavte parametry epidemie, skryte udalosti a pravidla hry. Exportujte URL pro studenty.
        </p>
      </div>

      {/* Game settings */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
        <h3 className="text-sm font-semibold text-gray-700">Nastaveni hry</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Delka hry (mesice)</label>
            <input
              type="number"
              value={durationMonths}
              onChange={(e) => setDurationMonths(Math.max(1, Math.min(36, parseInt(e.target.value) || 12)))}
              min={1}
              max={36}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Dnu na tah</label>
            <input
              type="number"
              value={daysPerTurn}
              onChange={(e) => setDaysPerTurn(Math.max(7, Math.min(90, parseInt(e.target.value) || 30)))}
              min={7}
              max={90}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
            />
          </div>
        </div>
        <label className="flex items-center gap-2 text-xs text-gray-700">
          <input
            type="checkbox"
            checked={vaccinationLocked}
            onChange={(e) => setVaccinationLocked(e.target.checked)}
          />
          Zamknout vakcinaci (odemknout pres skrytou udalost)
        </label>
      </div>

      {/* Base epi parameters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Epidemiologicke parametry</h3>
        <ParameterPanel />
      </div>

      {/* Hidden events timeline */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Skryte udalosti (timeline)</h3>
        <EventTimeline
          events={hiddenEvents}
          onChange={setHiddenEvents}
          durationMonths={durationMonths}
        />
      </div>

      {/* Export */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
        <h3 className="text-sm font-semibold text-gray-700">Export scenare</h3>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded hover:bg-indigo-700"
          >
            Kopirovat URL pro studenty
          </button>
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded hover:bg-gray-200 border border-gray-300"
          >
            Stahnout JSON
          </button>
        </div>
        {exportedUrl && (
          <div className="bg-green-50 border border-green-200 rounded p-2">
            <p className="text-xs text-green-800 font-medium">URL zkopirovano do schranky!</p>
            <p className="text-xs text-green-600 break-all mt-1 font-mono">{exportedUrl.slice(0, 120)}...</p>
          </div>
        )}
      </div>
    </div>
  );
}
