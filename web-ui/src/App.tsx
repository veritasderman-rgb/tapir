import { useCallback, useEffect, useRef } from 'react';
import { useAppStore } from './store/useAppStore';
import { useGameStore } from './store/gameStore';
import { validateScenario, AppMode } from '@tapir/core';
import { runSimulation } from '@tapir/core';
import { useRoute, buildPath } from './lib/route';

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
import HubScreen from './components/hub/HubScreen';

// Game components
import ScenarioBuilder from './components/instructor/ScenarioBuilder';
import TurnDashboard from './components/student/TurnDashboard';
import GameOverScreen from './components/student/GameOverScreen';
import ScenarioLoader from './components/student/ScenarioLoader';

// Didaktikon games
import OsackaGame from './components/osacka/OsackaGame';
import TyfovaGame from './components/tyfova/TyfovaGame';

// Educational
import EpidemiologistHandbook from './components/handbook/EpidemiologistHandbook';

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
    setResult,
    simStatus,
    setSimStatus,
    activeTab,
    setActiveTab,
    validationErrors,
    setValidationErrors,
    sidebarOpen,
    setSidebarOpen,
    appMode,
    setAppMode,
    auth,
    setAuth,
  } = useAppStore();

  const { gamePhase, loadScenario } = useGameStore();

  const route = useRoute();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const loadedParamRef = useRef<string | null>(null);

  // Na úzkých obrazovkách (tablet/mobil) panel ve výchozím stavu skryjeme,
  // aby výsuvný drawer nepřekrýval obsah hned po vstupu do Odborného režimu.
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [setSidebarOpen]);

  // Synchronizace store podle URL (router je zdroj pravdy).
  useEffect(() => {
    const { screen, scenarioParam, legacy } = route;
    if (screen === 'hub') return;
    // Učitelský režim vyžaduje přihlášení; jinak zůstaneme na rozcestníku.
    if (screen === AppMode.Instructor && auth.role !== 'teacher') return;

    // Studentské/odbornické režimy: stačí hostovská relace.
    if (!auth.role) {
      setAuth({ role: 'guest', username: 'host', classId: null });
    }
    if (appMode !== screen) setAppMode(screen);

    // Krizový štáb: načti scénář z odkazu (jen jednou, dokud hra neběží).
    if (
      screen === AppMode.CrisisStaff &&
      scenarioParam &&
      gamePhase === 'idle' &&
      loadedParamRef.current !== scenarioParam
    ) {
      loadedParamRef.current = scenarioParam;
      loadScenario(scenarioParam);
      // Normalizace starého odkazu na nové schéma. Přepíšeme i pathname, čímž
      // se zahodí starý ?game= ze search stringu (jinak by trvale přebíjel
      // navigaci a návrat na rozcestník by skákal zpět do hry).
      if (legacy && typeof window !== 'undefined') {
        const path = buildPath({ screen: AppMode.CrisisStaff, scenarioParam });
        window.history.replaceState(null, '', `${window.location.pathname}#${path}`);
      }
    }
  }, [route, auth.role, appMode, gamePhase, setAuth, setAppMode, loadScenario]);

  const handleRun = useCallback(() => {
    const errors = validateScenario(scenario);
    setValidationErrors(errors);
    if (errors.length > 0) return;

    setSimStatus('running');

    try {
      const res = runSimulation(scenario);
      setResult(res);
      setSimStatus('done');
    } catch (err) {
      setSimStatus('error');
      console.error('Simulation error:', err);
    }
  }, [scenario, setResult, setSimStatus, setValidationErrors]);

  // Auto-validate on scenario change (debounced)
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const errors = validateScenario(scenario);
      setValidationErrors(errors);
    }, 200);
    return () => clearTimeout(debounceRef.current);
  }, [scenario, setValidationErrors]);

  // Rozcestník (hub) — nebo učitelský odkaz bez přihlášení → přihlašovací stránka
  if (route.screen === 'hub' || (route.screen === AppMode.Instructor && auth.role !== 'teacher')) {
    return <HubScreen />;
  }

  // Didaktikon games
  if (route.screen === AppMode.OsackaHorecka) return <OsackaGame />;
  if (route.screen === AppMode.TyfovaMary) return <TyfovaGame />;

  // Educational handbook
  if (route.screen === AppMode.Handbook) return <EpidemiologistHandbook />;

  // Instructor mode → show Scenario Builder
  if (route.screen === AppMode.Instructor) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <DisclaimerBanner />
        <Header />
        <main className="flex-1 overflow-y-auto">
          <ScenarioBuilder />
        </main>
      </div>
    );
  }

  // Crisis Staff mode: game screens
  if (route.screen === AppMode.CrisisStaff) {
    // Game: scenario loader (waiting for URL or manual input)
    if (gamePhase === 'idle') {
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <DisclaimerBanner />
          <Header />
          <main className="flex-1">
            <ScenarioLoader />
          </main>
        </div>
      );
    }

    // Game: playing or finished
    if (gamePhase === 'playing' || gamePhase === 'finished') {
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <DisclaimerBanner />
          <Header />
          <main className="flex-1 overflow-hidden">
            <TurnDashboard />
          </main>
        </div>
      );
    }

    // Game: debrief
    if (gamePhase === 'debrief') {
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <DisclaimerBanner />
          <Header />
          <main className="flex-1 overflow-y-auto">
            <GameOverScreen />
          </main>
        </div>
      );
    }
  }

  // Expert mode: Sandbox (full parameter panel + Dashboard)
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <a href="#main-content" className="skip-link">Přeskočit na obsah</a>
      <DisclaimerBanner />
      <Header />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Backdrop pro výsuvný panel na tabletu/mobilu */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/30 z-30"
            aria-hidden="true"
          />
        )}
        {/* Sidebar — výsuvný drawer pod lg, statický panel na lg+ */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-40 w-80 lg:w-80 bg-white border-r border-gray-200 overflow-y-auto flex-shrink-0 shadow-xl lg:shadow-none transition-transform lg:transition-all duration-200 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-0'
          }`}
        >
          <div className="p-3 space-y-4">
            {/* Zavřít panel (jen na tabletu/mobilu) */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden w-full flex items-center justify-end gap-1.5 text-xs text-gray-400 hover:text-gray-600 -mb-1"
            >
              Zavřít panel
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
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
              {activeTab === 'variants' && <VariantPanel />}
              {activeTab === 'stochastic' && <StochasticPanel />}
              {activeTab === 'export' && <ExportPanel />}
            </div>

            {/* Instructor panel */}
            <InstructorPanel />

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
    </div>
  );
}
