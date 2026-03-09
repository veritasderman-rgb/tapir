import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  ComposedChart,
  Bar,
} from 'recharts';
import { useGameStore } from '../../store/gameStore';
import { useMemo } from 'react';
import type { CompartmentState } from '@tapir/core';
import ActionPanel from './ActionPanel';
import MonthlyDebriefModal from './MonthlyDebriefModal';
import CrisisPopup from './CrisisPopup';

export default function TurnDashboard() {
  const { turnHistory, currentTurn, gameScenario, gamePhase, trust, crisisLeader } = useGameStore();

  const chartData = useMemo(() => {
    if (turnHistory.length === 0) return [];
    return turnHistory.flatMap(h =>
      h.metrics.map((m, i) => ({
        day: h.states[i]?.day ?? 0,
        observedInfections: m.observedNewInfections ?? m.newInfections * 0.3,
        newHosp: m.newHospitalizations,
        newICU: m.newICU,
        newDeaths: m.newDeaths,
        Reff: m.Reff,
        totalH: h.states[i]?.strata.reduce((s: number, st: CompartmentState) => s + st.H, 0) ?? 0,
        totalICU: h.states[i]?.strata.reduce((s: number, st: CompartmentState) => s + st.ICU, 0) ?? 0,
      })),
    );
  }, [turnHistory]);

  const hospCapacity = gameScenario?.baseScenario.healthCapacity.hospitalBeds ?? 5000;
  const icuCapacity = gameScenario?.baseScenario.healthCapacity.icuBeds ?? 500;

  const latestReport = turnHistory.length > 0 ? turnHistory[turnHistory.length - 1].report : null;

  if (!gameScenario) return null;

  return (
    <div className="flex h-full">
      {/* Main charts area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Status bar */}
        <div className="bg-white border border-gray-200 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-xs text-gray-500">Kolo</span>
              <span className="ml-1 text-sm font-bold text-gray-900">{currentTurn} / {gameScenario.totalTurns}</span>
            </div>
            {latestReport && (
              <>
                <div>
                  <span className="text-xs text-gray-500">Celkem umrti</span>
                  <span className="ml-1 text-sm font-bold text-red-600">{latestReport.cumulativeDeaths.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Reff</span>
                  <span className={`ml-1 text-sm font-bold ${latestReport.estimatedReff > 1 ? 'text-red-600' : 'text-green-600'}`}>
                    ~{latestReport.estimatedReff.toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Důvěra</span>
                  <span className={`ml-1 text-sm font-bold ${trust < 20 ? 'text-red-600' : trust < 40 ? 'text-amber-600' : 'text-green-600'}`}>
                    {Math.round(trust)}%
                  </span>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Vedení</span>
                  <span className={`ml-1 text-sm font-bold ${crisisLeader === 'premier' ? 'text-purple-600' : 'text-blue-600'}`}>
                    {crisisLeader === 'hygienik' ? '🏥 Hygienik' : '🏛️ Premiér'}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Soc. kapital</span>
                  <span className={`ml-1 text-sm font-bold ${latestReport.socialCapital < 30 ? 'text-red-600' : 'text-gray-700'}`}>
                    {latestReport.socialCapital.toFixed(0)}
                  </span>
                </div>
              </>
            )}
          </div>
          {gamePhase === 'finished' && (
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">HRA SKONCILA</span>
          )}
        </div>

        {latestReport && (
          <div className="bg-white border border-gray-200 rounded-lg p-3 text-xs text-gray-600">
            {latestReport.dateLabel}
          </div>
        )}

        {/* Observed infections (fog of war — student sees only reported cases) */}
        {chartData.length > 0 && (
          <>
            <ChartCard title="Hlasene pripady denne">
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="observedInfections" stroke="#f59e0b" dot={false} name="Hlasene pripady" />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Hospitalizace a ICU">
              <ResponsiveContainer width="100%" height={200}>
                <ComposedChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="totalH" stroke="#f97316" dot={false} name="Hospitalizovani" />
                  <Line type="monotone" dataKey="totalICU" stroke="#dc2626" dot={false} name="ICU" />
                  <ReferenceLine y={hospCapacity} stroke="#f97316" strokeDasharray="5 5" label="Kapacita H" />
                  <ReferenceLine y={icuCapacity} stroke="#dc2626" strokeDasharray="5 5" label="Kapacita ICU" />
                </ComposedChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Umrti denne">
              <ResponsiveContainer width="100%" height={150}>
                <ComposedChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="newDeaths" fill="#4b5563" name="Umrti" opacity={0.7} />
                </ComposedChart>
              </ResponsiveContainer>
            </ChartCard>
          </>
        )}

        {chartData.length === 0 && (
          <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
            Nastavte opatreni a kliknete na "Zasedani stab" v panelu vpravo.
          </div>
        )}
      </div>

      {/* Action sidebar */}
      <aside className="w-80 border-l border-gray-200 bg-white overflow-y-auto p-3 flex-shrink-0">
        <ActionPanel />
      </aside>

      {/* Turn debrief modal */}
      <MonthlyDebriefModal />

      {/* Crisis popup notifications (on top of everything) */}
      <CrisisPopup />
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">{title}</h3>
      {children}
    </div>
  );
}
