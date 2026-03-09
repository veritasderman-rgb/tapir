import { useCallback, useEffect, useRef, useState } from 'react';
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
  } = useAppStore();

  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [crisisOpen, setCrisisOpen] = useState(false);
  const [trust, setTrust] = useState(62);
  const [oppositionBriefings, setOppositionBriefings] = useState(0);
  const [mediaSupport, setMediaSupport] = useState(0);
  const [leader, setLeader] = useState<'hygienik' | 'premier'>('hygienik');
  const [governmentDownRounds, setGovernmentDownRounds] = useState(0);
  const [takeoverApplied, setTakeoverApplied] = useState(false);
  const [popupQueue, setPopupQueue] = useState<Array<{ id: string; title: string; body: string }>>([]);

  const enqueuePopup = useCallback((title: string, body: string) => {
    setPopupQueue((q) => [...q, { id: crypto.randomUUID(), title, body }]);
  }, []);

  const epidemicHeadline = useCallback(() => {
    const name = scenario.name.toLowerCase();
    if (name.includes('ebola')) return 'Ebola';
    if (name.includes('spal') || scenario.epiConfig.R0 >= 8) return 'Spalničky';
    if (name.includes('chřip') || name.includes('chrip') || name.includes('flu')) return 'Ptačí chřipka';
    return 'Ptačí chřipka';
  }, [scenario.epiConfig.R0, scenario.name]);

  const handleRun = useCallback(() => {
    const errors = validateScenario(scenario);
    setValidationErrors(errors);
    if (errors.length > 0) return;

    setSimStatus('running');

    // Run synchronously for now (Web Worker integration later with Vite worker)
    try {
      const runScenario = {
        ...scenario,
        npis: governmentDownRounds > 0
          ? scenario.npis.map((npi) => ({ ...npi, value: 1 }))
          : takeoverApplied
          ? scenario.npis.map((npi) => ({
              ...npi,
              value: 1 - (1 - npi.value) * 0.7,
              compliance: {
                ...npi.compliance,
                initial: Math.max(0, npi.compliance.initial * 0.9),
              },
            }))
          : scenario.npis,
      };
      const res = runSimulation(runScenario);
      setResult(res);
      setSimStatus('done');

      const totalDeaths = Math.round(res.primaryRun.metrics.reduce((acc, m) => acc + m.newDeaths, 0));

      if (governmentDownRounds > 0) {
        const remaining = governmentDownRounds - 1;
        setGovernmentDownRounds(remaining);
        enqueuePopup(
          'Vládní vakuum pokračuje',
          `Po pádu vlády jsou opatření v tomto kole neúčinná. Zbývá ${remaining} kol(a) do ustavení nové vlády.`,
        );
      }

      if (!takeoverApplied && totalDeaths >= 10_000) {
        setLeader('premier');
        setTakeoverApplied(true);
        setTrust((t) => Math.min(100, t + 8));
        enqueuePopup(
          'Převzetí řízení Ústředním krizovým štábem',
          'Počet obětí přesáhl 10 000. Řízení přebírá premiér, důvěra krátkodobě roste, ale původní opatření částečně slábnou.',
        );
      }

      if (hiddenEvents && appMode === 'student' && scenario.variants.length > 0) {
        enqueuePopup(
          'Mimořádná zpráva',
          'Do systému dorazila skrytá událost připravená instruktorem. Sledujte vývoj křivek a dopady na další tahy.',
        );
      }

      const overflowDays = res.primaryRun.metrics.filter((m) => m.hospitalOverflow || m.icuOverflow).length;
      const trustPenalty = Math.min(12, Math.floor(totalDeaths / 3000)) + (overflowDays > 0 ? 5 : 0);
      if (trustPenalty > 0) {
        setTrust((t) => Math.max(0, t - trustPenalty));
      }

      if (auth.role === 'student' && auth.username && auth.classId) {
        const classroom = getClassroomById(auth.classId);
        saveAttempt({
          id: `attempt-${crypto.randomUUID()}`,
          username: auth.username,
          classId: auth.classId,
          playedAt: new Date().toISOString(),
          totalDeaths,
          peakInfections: Math.round(Math.max(...res.primaryRun.metrics.map((m) => m.newInfections))),
          overflowDays: res.primaryRun.metrics.filter((m) => m.hospitalOverflow || m.icuOverflow).length,
          scenarioTag: classroom?.defaultAssignment?.tag,
        });
      }
    } catch (err) {
      setSimStatus('error');
      console.error('Simulation error:', err);
    }
  }, [appMode, auth, enqueuePopup, governmentDownRounds, hiddenEvents, scenario, setResult, setSimStatus, setValidationErrors, takeoverApplied]);

  useEffect(() => {
    if (!auth.role) return;
    const disease = epidemicHeadline();
    enqueuePopup(
      'Mimořádná situace: máme první zprávy',
      `Byly potvrzeny první případy (${disease}). Epidemii zatím řídí hlavní hygienik, který svolává ústřední štáb. Otevřete Krizový štáb a nastavte první kroky.`,
    );
  }, [auth.role, epidemicHeadline, enqueuePopup]);

  useEffect(() => {
    if (trust > 0) return;
    if (governmentDownRounds > 0) return;
    setGovernmentDownRounds(2);
    enqueuePopup(
      'Pád vlády',
      'Důvěra veřejnosti klesla na 0 %. Vláda padla a následující 2 kola budou všechna opatření nefunkční.',
    );
  }, [governmentDownRounds, enqueuePopup, trust]);

  // Auto-validate on scenario change (debounced)
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const errors = validateScenario(scenario);
      setValidationErrors(errors);
    }, 200);
    return () => clearTimeout(debounceRef.current);
  }, [scenario, setValidationErrors]);

  if (!auth.role) return <AuthPanel />;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <a href="#main-content" className="skip-link">Přeskočit na obsah</a>
      <DisclaimerBanner />
      <Header />
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-between text-sm">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-semibold text-amber-900">Řízení: {leader === 'hygienik' ? 'Hlavní hygienik' : 'Premiér / Ústřední krizový štáb'}</span>
          <span className="text-amber-800">Důvěra: <strong>{trust}%</strong></span>
          {governmentDownRounds > 0 && <span className="text-red-700 font-semibold">Vládní vakuum: {governmentDownRounds} kola</span>}
        </div>
        <button
          onClick={() => setCrisisOpen(true)}
          className="bg-amber-600 text-white px-3 py-1.5 rounded hover:bg-amber-700"
        >
          Vstoupit do krizového štábu
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

      {crisisOpen && (
        <Modal
          title="Krizový štáb"
          onClose={() => setCrisisOpen(false)}
          body={(
            <div className="space-y-3">
              <p>
                Veřejná důvěra je klíčová pro účinnost opatření. Aktivní koordinace s opozicí a médii
                zvyšuje stabilitu vlády.
              </p>
              <div className="grid sm:grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setOppositionBriefings((v) => v + 1);
                    setTrust((t) => Math.min(100, t + 1));
                  }}
                  className="px-3 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  +1 Pravidelné vystupování s opozicí
                </button>
                <button
                  onClick={() => {
                    setMediaSupport((v) => v + 1);
                    setTrust((t) => Math.min(100, t + 1));
                  }}
                  className="px-3 py-2 rounded bg-sky-600 text-white hover:bg-sky-700"
                >
                  +1 Podpora veřejných sdělovacích prostředků
                </button>
              </div>
              <p className="text-xs text-gray-600">
                Aktivace: opozice {oppositionBriefings}×, média {mediaSupport}×.
                Dražší, viditelná opatření mohou krátkodobě zvýšit důvěru, i když zatěžují rozpočet.
              </p>
            </div>
          )}
        />
      )}

      {popupQueue.length > 0 && (
        <Modal
          title={popupQueue[0].title}
          body={<p>{popupQueue[0].body}</p>}
          onClose={() => setPopupQueue((q) => q.slice(1))}
        />
      )}
    </div>
  );
}

function Modal({ title, body, onClose }: { title: string; body: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-xl border border-gray-200 shadow-xl p-5">
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        <div className="mt-3 text-sm text-gray-700">{body}</div>
        <div className="mt-4 flex justify-end">
          <button onClick={onClose} className="bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700">Rozumím</button>
        </div>
      </div>
    </div>
  );
}
