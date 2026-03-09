import { useCallback, useEffect, useRef } from 'react';
import { useAppStore } from './store/useAppStore';
import { validateScenario, type SimulationResult } from '@tapir/core';
import { runSimulation } from '@tapir/core';

import DisclaimerBanner from './components/DisclaimerBanner';
import Header from './components/Header';
import PolicyLiteracyPanel from './components/PolicyLiteracyPanel';
import ParameterPanel from './components/ParameterPanel';
import NpiPanel from './components/NpiPanel';
import VaccinationPanel from './components/VaccinationPanel';
import VariantPanel from './components/VariantPanel';
import StochasticPanel from './components/StochasticPanel';
import ExportPanel from './components/ExportPanel';
import Dashboard from './components/Dashboard';
import AssumptionsInspector from './components/AssumptionsInspector';
import InstructorPanel from './components/InstructorPanel';
import AuthPanel from './components/AuthPanel';
import AdminPanel from './components/AdminPanel';
import { getClassroomById, saveAttempt } from './lib/classroom-db';

const TABS = [
  { id: 'parameters' as const, label: 'Parametry' },
  { id: 'npis' as const, label: 'NPIs' },
  { id: 'vaccination' as const, label: 'Vakcinace' },
  { id: 'variants' as const, label: 'Varianty' },
  { id: 'stochastic' as const, label: 'Stochastika' },
  { id: 'export' as const, label: 'Export' },
];

export default function App() {
  const {
    scenario,
    result,
    setResult,
    simStatus,
    setSimStatus,
    activeTab,
    setActiveTab,
    validationErrors,
    setValidationErrors,
    sidebarOpen,
    appMode,
    hiddenEvents,
    auth,
    crisis,
    enqueueCrisisPopup,
    dequeueCrisisPopup,
    applyTrustDelta,
    registerSimulationOutcome,
    advanceRound,
    enterCrisisStaff,
    markInitialPopupShown,
  } = useAppStore();

  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleRun = useCallback(() => {
    const errors = validateScenario(scenario);
    setValidationErrors(errors);
    if (errors.length > 0) return;

    setSimStatus('running');
    advanceRound();

    // Run synchronously for now (Web Worker integration later with Vite worker)
    try {
      const npiPenalty = crisis.control === 'premier' ? 1.1 : 1;
      const measuresDisabled = crisis.governmentDownRounds > 0;
      const scenarioForRun = {
        ...scenario,
        npis: scenario.npis.map((npi) => ({
          ...npi,
          value: measuresDisabled ? 1 : Math.min(2, npi.value * npiPenalty),
        })),
        vaccination: {
          ...scenario.vaccination,
          enabled: measuresDisabled ? false : scenario.vaccination.enabled,
        },
      };

      const res = runSimulation(scenarioForRun);
      setResult(res);
      setSimStatus('done');

      const casualties = Math.round(res.primaryRun.metrics.reduce((acc, m) => acc + m.newDeaths, 0));
      registerSimulationOutcome(casualties, hiddenEvents);

      if (crisis.governmentDownRounds > 0) {
        enqueueCrisisPopup({
          id: `downtime-${crypto.randomUUID()}`,
          title: 'Vláda v přechodu',
          body: `Opatření jsou dočasně nefunkční. Zbývá ${Math.max(0, crisis.governmentDownRounds - 1)} kol(a) do ustavení nové vlády.`,
          variant: 'warning',
        });
      }

      applyTrustDelta(2);

      if (auth.role === 'student' && auth.username && auth.classId) {
        const classroom = getClassroomById(auth.classId);
        saveAttempt({
          id: `attempt-${crypto.randomUUID()}`,
          username: auth.username,
          classId: auth.classId,
          playedAt: new Date().toISOString(),
          totalDeaths: casualties,
          peakInfections: Math.round(Math.max(...res.primaryRun.metrics.map((m) => m.newInfections))),
          overflowDays: res.primaryRun.metrics.filter((m) => m.hospitalOverflow || m.icuOverflow).length,
          scenarioTag: classroom?.defaultAssignment?.tag,
        });
      }
    } catch (err) {
      setSimStatus('error');
      console.error('Simulation error:', err);
    }
  }, [advanceRound, applyTrustDelta, auth, crisis.control, crisis.governmentDownRounds, enqueueCrisisPopup, hiddenEvents, registerSimulationOutcome, scenario, setResult, setSimStatus, setValidationErrors]);

  // Auto-validate on scenario change (debounced)
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const errors = validateScenario(scenario);
      setValidationErrors(errors);
    }, 200);
    return () => clearTimeout(debounceRef.current);
  }, [scenario, setValidationErrors]);

  useEffect(() => {
    if (!auth.role || crisis.initialPopupShown) return;

    const scenarioName = scenario.name.toLowerCase();
    let epidemicType = 'respirační infekce';
    if (scenarioName.includes('ebola')) epidemicType = 'ebola';
    else if (scenarioName.includes('spal')) epidemicType = 'spalničky';
    else if (scenarioName.includes('pta')) epidemicType = 'ptačí chřipka';

    enqueueCrisisPopup({
      id: 'intro-news',
      title: 'Mimořádná zpráva: máme první hlášení',
      body: `První zprávy ukazují šíření: ${epidemicType}. Epidemii aktuálně řídí hlavní hygienik. Vstupte do krizového štábu a zahajte koordinaci opatření.`,
      variant: 'news',
      actionLabel: 'Vstoupit do krizového štábu',
      action: 'enterCrisisStaff',
    });
    markInitialPopupShown();
  }, [auth.role, crisis.initialPopupShown, enqueueCrisisPopup, markInitialPopupShown, scenario.name]);

  if (!auth.role) return <AuthPanel />;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <a href="#main-content" className="skip-link">Přeskočit na obsah</a>
      <DisclaimerBanner />
      <Header />

      <div className="bg-slate-900 text-slate-100 px-4 py-2 text-xs flex flex-wrap items-center gap-3">
        <span className="font-semibold">Krizové řízení:</span>
        <span>Řídí: {crisis.control === 'hygienik' ? 'Hlavní hygienik' : 'Ústřední štáb premiéra'}</span>
        <span>Důvěra: <strong>{crisis.trust}%</strong></span>
        <span>Kolo: {crisis.round}</span>
        {crisis.governmentDownRounds > 0 && (
          <span className="bg-red-700 px-2 py-0.5 rounded">Pád vlády: opatření nefungují ({crisis.governmentDownRounds} kola)</span>
        )}
        <button
          onClick={() => {
            applyTrustDelta(1);
            enqueueCrisisPopup({
              id: `opposition-${crypto.randomUUID()}`,
              title: 'Společné vystoupení s opozicí',
              body: 'Koordinovaný briefing snížil napětí ve společnosti. +1 důvěra.',
              variant: 'success',
            });
          }}
          className="bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded"
        >
          +1 Opozice
        </button>
        <button
          onClick={() => {
            applyTrustDelta(1);
            enqueueCrisisPopup({
              id: `media-${crypto.randomUUID()}`,
              title: 'Podpora veřejnoprávních médií',
              body: 'Pravidelná komunikace napříč médii posílila důvěru. +1 důvěra.',
              variant: 'success',
            });
          }}
          className="bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded"
        >
          +1 Média
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'w-80' : 'w-0'
          } transition-all duration-200 overflow-y-auto border-r border-gray-200 bg-white flex-shrink-0`}
        >
          <div className="p-3 space-y-4">
            {/* Run button */}
            <button
              onClick={handleRun}
              disabled={validationErrors.length > 0 || simStatus === 'running'}
              className={`w-full py-2 rounded font-medium text-sm ${
                validationErrors.length > 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : simStatus === 'running'
                  ? 'bg-yellow-500 text-white cursor-wait'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {simStatus === 'running' ? 'Počítám...' : 'Spustit simulaci'}
            </button>

            {validationErrors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded p-2 text-xs text-red-700">
                <strong>Chyby validace:</strong>
                <ul className="mt-1 list-disc list-inside">
                  {validationErrors.map((e, i) => (
                    <li key={i}>{e.message}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tabs */}
            <div className="flex flex-wrap gap-1">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`text-xs px-2 py-1 rounded ${
                    activeTab === tab.id
                      ? 'bg-gray-800 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div>
              {activeTab === 'parameters' && <ParameterPanel />}
              {activeTab === 'npis' && <NpiPanel />}
              {activeTab === 'vaccination' && <VaccinationPanel />}
              {activeTab === 'variants' && (
                hiddenEvents && appMode === 'student'
                  ? <p className="text-xs text-gray-400">Varianty jsou skryty instruktorem.</p>
                  : <VariantPanel />
              )}
              {activeTab === 'stochastic' && <StochasticPanel />}
              {activeTab === 'export' && <ExportPanel />}
            </div>

            {/* Instructor panel */}
            <InstructorPanel />
            {auth.role === 'teacher' && <AdminPanel />}

            {/* Assumptions Inspector */}
            <AssumptionsInspector />

            {/* Policy Literacy */}
            <PolicyLiteracyPanel />
          </div>
        </aside>

        {/* Main content */}
        <main id="main-content" className="flex-1 overflow-y-auto" role="main" aria-label="Simulační dashboard">
          <Dashboard />
        </main>
      </div>

      {crisis.popupQueue.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="max-w-xl w-full bg-white rounded-lg border border-gray-200 shadow-2xl">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">{crisis.popupQueue[0].title}</h2>
            </div>
            <div className="p-4 text-sm text-gray-700">{crisis.popupQueue[0].body}</div>
            <div className="p-4 pt-0 flex justify-end gap-2">
              {crisis.popupQueue[0].action === 'enterCrisisStaff' && (
                <button
                  onClick={() => {
                    enterCrisisStaff();
                    dequeueCrisisPopup();
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded"
                >
                  {crisis.popupQueue[0].actionLabel ?? 'Pokračovat'}
                </button>
              )}
              <button
                onClick={dequeueCrisisPopup}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1.5 rounded border border-gray-300"
              >
                Zavřít
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
