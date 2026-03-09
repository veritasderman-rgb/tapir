import { useCallback, useEffect, useRef } from 'react';
import { useAppStore } from './store/useAppStore';
import { useGameStore } from './store/gameStore';
import { validateScenario, type SimulationResult, AppMode } from '@tapir/core';
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

// Game components
import ScenarioBuilder from './components/instructor/ScenarioBuilder';
import TurnDashboard from './components/student/TurnDashboard';
import GameOverScreen from './components/student/GameOverScreen';
import ScenarioLoader from './components/student/ScenarioLoader';

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

  const { gamePhase } = useGameStore();

  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleRun = useCallback(() => {
    const errors = validateScenario(scenario);
    setValidationErrors(errors);
    if (errors.length > 0) return;

    setSimStatus('running');

    try {
      const res = runSimulation(scenario);
      setResult(res);
      setSimStatus('done');

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
  }, [auth, scenario, setResult, setSimStatus, setValidationErrors]);

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

  // Check if URL has ?game= parameter → go directly to game mode
  const hasGameParam = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('game');

  // Instructor mode → show Scenario Builder
  if (auth.role === 'teacher' && appMode === AppMode.Instructor) {
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

  // Game mode: student (or guest) with an active game or game URL
  if (hasGameParam || gamePhase !== 'idle') {
    // Game: scenario loader
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

    // Game: playing or finished (show debrief modal on top)
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

  // Default: Sandbox mode (existing UI)
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
    </div>
  );
}
