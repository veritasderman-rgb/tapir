import { useCallback, useEffect, useRef, useState } from 'react';
import { useAppStore } from './store/useAppStore';
import { AppMode, validateScenario } from '@tapir/core';
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

  const [trust, setTrust] = useState(65);
  const [enteredCrisisStaff, setEnteredCrisisStaff] = useState(false);
  const [popupQueue, setPopupQueue] = useState<Array<{ title: string; body: string }>>([]);
  const [isPremierLeading, setIsPremierLeading] = useState(false);
  const [govCooldownRounds, setGovCooldownRounds] = useState(0);
  const [supportOpposition, setSupportOpposition] = useState(true);
  const [supportMedia, setSupportMedia] = useState(true);

  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const totalDeaths = result
    ? Math.round(result.primaryRun.metrics.reduce((acc, m) => acc + m.newDeaths, 0))
    : 0;

  const pushPopup = useCallback((title: string, body: string) => {
    setPopupQueue((q) => [...q, { title, body }]);
  }, []);

  const epidemicHeadline = useCallback(() => {
    const label = scenario.name.toLowerCase();
    if (label.includes('ebola')) {
      return 'Mimořádné zprávy: podezření na Ebolu. Hygiena svolává ústřední štáb.';
    }
    if (label.includes('spal')) {
      return 'Mimořádné zprávy: spalničky se šíří komunitně. Hygiena zpřísňuje dohled.';
    }
    if (label.includes('pta') || label.includes('chřip')) {
      return 'Mimořádné zprávy: ptačí chřipka hlášena ve více regionech.';
    }
    return 'Mimořádné zprávy: máme první zprávy o nové epidemii.';
  }, [scenario.name]);

  const handleRun = useCallback(() => {
    const errors = validateScenario(scenario);
    setValidationErrors(errors);
    if (errors.length > 0) return;

    setSimStatus('running');

    // Run synchronously for now (Web Worker integration later with Vite worker)
    try {
      const scenarioForRun = govCooldownRounds > 0
        ? {
            ...scenario,
            npis: scenario.npis.map((npi) => ({ ...npi, value: 1 })),
            vaccination: { ...scenario.vaccination, enabled: false },
          }
        : scenario;

      const res = runSimulation(scenarioForRun);
      setResult(res);
      setSimStatus('done');

      const deaths = Math.round(res.primaryRun.metrics.reduce((acc, m) => acc + m.newDeaths, 0));
      const communicationBonus = (supportOpposition ? 1 : 0) + (supportMedia ? 1 : 0);
      let trustDelta = communicationBonus;

      if (deaths > 10000 && !isPremierLeading) {
        setIsPremierLeading(true);
        trustDelta += 5;
        pushPopup(
          'Převzetí řízení krizového štábu',
          'Počet obětí překročil 10 000. Řízení přebírá Ústřední krizový štáb pod vedením premiéra. Důvěra veřejnosti krátkodobě roste, ale původní opatření ztrácí část účinnosti.',
        );
      }

      if (hiddenEvents && appMode === AppMode.Student) {
        trustDelta -= 2;
        pushPopup(
          'Skrytý event',
          'Do simulace vstoupila neočekávaná událost připravená instruktorem. Sledujte dopady v dashboardu a upravte strategii.',
        );
      }

      const nextTrust = Math.max(0, Math.min(100, trust + trustDelta));
      setTrust(nextTrust);

      if (nextTrust === 0) {
        setGovCooldownRounds(2);
        pushPopup(
          'Pád vlády',
          'Důvěra veřejnosti klesla na 0 %. Vláda padla. Následující 2 kola opatření nebudou fungovat, dokud nebude ustanovena nová vláda.',
        );
      } else if (govCooldownRounds > 0) {
        const roundsLeft = govCooldownRounds - 1;
        setGovCooldownRounds(roundsLeft);
        if (roundsLeft === 0) {
          pushPopup('Nová vláda ustavena', 'Opatření jsou opět funkční. Hráč znovu získává plnou kontrolu.');
        }
      }

      if (auth.role === 'student' && auth.username && auth.classId) {
        const classroom = getClassroomById(auth.classId);
        saveAttempt({
          id: `attempt-${crypto.randomUUID()}`,
          username: auth.username,
          classId: auth.classId,
          playedAt: new Date().toISOString(),
          totalDeaths: Math.round(res.primaryRun.metrics.reduce((acc, m) => acc + m.newDeaths, 0)),
          peakInfections: Math.round(Math.max(...res.primaryRun.metrics.map((m) => m.newInfections))),
          overflowDays: res.primaryRun.metrics.filter((m) => m.hospitalOverflow || m.icuOverflow).length,
          scenarioTag: classroom?.defaultAssignment?.tag,
        });
      }
    } catch (err) {
      setSimStatus('error');
      console.error('Simulation error:', err);
    }
  }, [
    appMode,
    auth,
    govCooldownRounds,
    hiddenEvents,
    isPremierLeading,
    pushPopup,
    scenario,
    setResult,
    setSimStatus,
    setValidationErrors,
    supportMedia,
    supportOpposition,
    trust,
  ]);

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

  const activePopup = popupQueue[0];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <a href="#main-content" className="skip-link">Přeskočit na obsah</a>
      <DisclaimerBanner />
      <Header />

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
                hiddenEvents && appMode === AppMode.Student
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
          <div className="px-4 pt-4">
            <div className="bg-white border border-gray-200 rounded-lg p-3 flex flex-wrap gap-3 items-center text-sm">
              <span><strong>Řízení:</strong> {isPremierLeading ? 'Ústřední krizový štáb (premiér)' : 'Hlavní hygienik'}</span>
              <span><strong>Důvěra:</strong> {trust}%</span>
              <span><strong>Oběti:</strong> {totalDeaths.toLocaleString()}</span>
              {govCooldownRounds > 0 && (
                <span className="text-red-700 font-semibold">Opatření nefungují: ještě {govCooldownRounds} kola</span>
              )}
              <label className="ml-auto flex items-center gap-1 text-xs">
                <input type="checkbox" checked={supportOpposition} onChange={(e) => setSupportOpposition(e.target.checked)} />
                +1 pravidelné vystupování s opozicí
              </label>
              <label className="flex items-center gap-1 text-xs">
                <input type="checkbox" checked={supportMedia} onChange={(e) => setSupportMedia(e.target.checked)} />
                +1 podpora veřejných sdělovacích prostředků
              </label>
            </div>
          </div>
          <Dashboard />
        </main>
      </div>

      {!enteredCrisisStaff && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 max-w-xl w-full p-5 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Úvodní hlášení</h2>
            <p className="text-sm text-gray-700">{epidemicHeadline()}</p>
            <p className="text-sm text-gray-700">
              Epidemii nyní řídí hlavní hygienik a svolává ústřední štáb. Jakmile oběti překročí 10 000,
              řízení převezme Ústřední krizový štáb pod vedením premiéra.
            </p>
            <button
              onClick={() => setEnteredCrisisStaff(true)}
              className="w-full bg-blue-600 text-white rounded py-2 text-sm font-medium hover:bg-blue-700"
            >
              Vstoupit do krizového štábu
            </button>
          </div>
        </div>
      )}

      {enteredCrisisStaff && activePopup && (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 max-w-lg w-full p-5 space-y-4">
            <h3 className="text-base font-semibold text-gray-900">{activePopup.title}</h3>
            <p className="text-sm text-gray-700">{activePopup.body}</p>
            <button
              onClick={() => setPopupQueue((q) => q.slice(1))}
              className="w-full bg-gray-800 text-white rounded py-2 text-sm hover:bg-black"
            >
              Rozumím
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
