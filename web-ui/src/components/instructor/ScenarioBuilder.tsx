import { useState, useCallback } from 'react';
import { useAppStore } from '../../store/useAppStore';
import {
  type GameScenario,
  type HiddenEvent,
  defaultScenario,
  defaultDelayConfig,
  defaultReportingConfig,
  defaultSocialCapitalConfig,
  defaultMeasureIds,
  encodeGameScenario,
  MEASURE_CATALOG,
} from '@tapir/core';
import EventTimeline from './EventTimeline';
import ParameterPanel from '../ParameterPanel';

const DEFAULT_TOTAL_TURNS = 24;
const DEFAULT_DAYS_PER_TURN = 14;

export default function ScenarioBuilder() {
  const { scenario } = useAppStore();
  const [totalTurns, setTotalTurns] = useState(DEFAULT_TOTAL_TURNS);
  const [daysPerTurn, setDaysPerTurn] = useState(DEFAULT_DAYS_PER_TURN);
  const [hiddenEvents, setHiddenEvents] = useState<HiddenEvent[]>([]);
  const [vaccinationLocked, setVaccinationLocked] = useState(true);
  const [selectedMeasureIds, setSelectedMeasureIds] = useState<string[]>(defaultMeasureIds());
  const [premierTakeoverDeaths, setPremierTakeoverDeaths] = useState(10000);
  const [exportedUrl, setExportedUrl] = useState<string | null>(null);

  const buildGameScenario = useCallback((): GameScenario => {
    const baseScenario = {
      ...scenario,
      days: totalTurns * daysPerTurn,
      delayConfig: scenario.delayConfig ?? defaultDelayConfig(),
      reportingConfig: scenario.reportingConfig ?? defaultReportingConfig(),
    };

    return {
      baseScenario,
      totalTurns,
      daysPerTurn,
      hiddenEvents,
      socialCapital: defaultSocialCapitalConfig(),
      availableMeasureIds: selectedMeasureIds,
      vaccinationLocked,
      premierTakeoverDeaths,
    };
  }, [scenario, totalTurns, daysPerTurn, hiddenEvents, selectedMeasureIds, vaccinationLocked, premierTakeoverDeaths]);

  const handleExport = useCallback(() => {
    const gs = buildGameScenario();
    const encoded = encodeGameScenario(gs);
    const url = `${window.location.origin}${window.location.pathname}#game=${encoded}`;
    setExportedUrl(url);
    navigator.clipboard.writeText(url).catch(() => {});
  }, [buildGameScenario]);

  const handleDownload = useCallback(() => {
    const gs = buildGameScenario();
    const blob = new Blob([JSON.stringify(gs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `krizovy-stab-scenar-${totalTurns}t.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [buildGameScenario, totalTurns]);

  const toggleMeasure = (id: string) => {
    setSelectedMeasureIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id],
    );
  };

  const selectAllMeasures = () => setSelectedMeasureIds(defaultMeasureIds());
  const clearAllMeasures = () => setSelectedMeasureIds([]);

  // Group measures by category for display
  const measuresByCategory = MEASURE_CATALOG.reduce((acc, m) => {
    if (!acc[m.category]) acc[m.category] = [];
    acc[m.category].push(m);
    return acc;
  }, {} as Record<string, typeof MEASURE_CATALOG>);

  const CATEGORY_LABELS: Record<string, string> = {
    masks: 'Rousky',
    social_distancing: 'Socialni opatreni',
    testing: 'Testovani',
    travel: 'Cestovani',
    vaccination: 'Vakcinace',
    military: 'Armada',
    international: 'Mezinarodni',
    economic: 'Ekonomicka podpora',
  };

  return (
    <div className="space-y-6 p-4 max-w-4xl mx-auto">
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
        <h2 className="text-lg font-bold text-indigo-900 mb-1">Krizovy stab — tvorba scenare</h2>
        <p className="text-xs text-indigo-700">
          Nastavte parametry epidemie, dostupna opatreni, skryte udalosti a pravidla hry. Exportujte URL pro studenty.
        </p>
      </div>

      {/* Game settings */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
        <h3 className="text-sm font-semibold text-gray-700">Nastaveni hry</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Pocet kol</label>
            <input
              type="number"
              value={totalTurns}
              onChange={(e) => setTotalTurns(Math.max(1, Math.min(48, parseInt(e.target.value) || 24)))}
              min={1}
              max={48}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
            />
            <p className="text-[10px] text-gray-400 mt-0.5">{totalTurns * daysPerTurn} dni celkem</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Dnu na kolo</label>
            <input
              type="number"
              value={daysPerTurn}
              onChange={(e) => setDaysPerTurn(Math.max(7, Math.min(30, parseInt(e.target.value) || 14)))}
              min={7}
              max={30}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
            />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 text-xs text-gray-700">
              <input
                type="checkbox"
                checked={vaccinationLocked}
                onChange={(e) => setVaccinationLocked(e.target.checked)}
              />
              Zamknout vakcinaci
            </label>
          </div>
        </div>
        <div className="mt-3">
          <label className="block text-xs font-medium text-gray-600 mb-1">Prevzeti rizeni premierem (pocet obeti)</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={premierTakeoverDeaths}
              onChange={(e) => setPremierTakeoverDeaths(Math.max(100, parseInt(e.target.value) || 10000))}
              min={100}
              step={1000}
              className="w-32 px-2 py-1 text-sm border border-gray-300 rounded"
            />
            <p className="text-[10px] text-gray-400">Pri tomto poctu obeti prevezme rizeni premier a odemknou se dalsi opatreni (lockdown, armada, ekonomicke programy...)</p>
          </div>
        </div>
      </div>

      {/* Available measures */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">Dostupna opatreni ({selectedMeasureIds.length}/{MEASURE_CATALOG.length})</h3>
          <div className="flex gap-2">
            <button onClick={selectAllMeasures} className="text-[10px] text-blue-600 hover:underline">Vse</button>
            <button onClick={clearAllMeasures} className="text-[10px] text-red-600 hover:underline">Nic</button>
          </div>
        </div>
        {Object.entries(measuresByCategory).map(([cat, measures]) => (
          <div key={cat}>
            <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
              {CATEGORY_LABELS[cat] ?? cat}
            </h4>
            <div className="flex flex-wrap gap-1">
              {measures.map(m => (
                <button
                  key={m.id}
                  onClick={() => toggleMeasure(m.id)}
                  className={`text-[10px] px-2 py-0.5 rounded border ${
                    selectedMeasureIds.includes(m.id)
                      ? 'bg-blue-50 border-blue-300 text-blue-800'
                      : 'bg-gray-50 border-gray-200 text-gray-500'
                  }`}
                  title={m.description}
                >
                  {m.name}
                </button>
              ))}
            </div>
          </div>
        ))}
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
          totalTurns={totalTurns}
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
          <div className="bg-green-50 border border-green-200 rounded p-3 space-y-2">
            <p className="text-xs text-green-800 font-medium">URL zkopirovano do schranky! ({exportedUrl.length} znaku)</p>
            <input
              type="text"
              readOnly
              value={exportedUrl}
              onFocus={(e) => e.target.select()}
              className="w-full text-[10px] text-green-700 font-mono bg-green-100 border border-green-300 rounded px-2 py-1"
            />
            <button
              onClick={() => navigator.clipboard.writeText(exportedUrl).catch(() => {})}
              className="text-[10px] text-green-700 hover:text-green-900 underline"
            >
              Kopirovat znovu
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
