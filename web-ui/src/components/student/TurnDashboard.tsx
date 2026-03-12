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
import ICUTracker from './ICUTracker';

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
    <div className="flex h-full flex-col lg:flex-row bg-gray-50">
      {/* Main charts area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        <ICUTracker />

        {/* Status bar */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-6">
            <div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block leading-none mb-1">Kolo</span>
              <span className="text-sm font-black text-gray-900">{currentTurn} / {gameScenario.totalTurns}</span>
            </div>
            {latestReport && (
              <>
                <div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block leading-none mb-1">Úmrtí</span>
                  <span className="text-sm font-black text-red-600 tabular-nums">{latestReport.cumulativeDeaths.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block leading-none mb-1">Odhad Reff</span>
                  <span className={`text-sm font-black ${latestReport.estimatedReff > 1 ? 'text-red-600' : 'text-green-600'} tabular-nums`}>
                    ~{latestReport.estimatedReff.toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block leading-none mb-1">Vedení</span>
                  <span className={`text-sm font-black ${crisisLeader === 'premier' ? 'text-purple-600' : 'text-blue-600'}`}>
                    {crisisLeader === 'hygienik' ? '🏥 HYGIENIK' : '🏛️ PREMIÉR'}
                  </span>
                </div>
              </>
            )}
          </div>
          {gamePhase === 'finished' && (
            <span className="text-xs font-black text-white bg-indigo-600 px-3 py-1 rounded-full uppercase tracking-widest animate-pulse">Simulace ukončena</span>
          )}
        </div>

        {/* Charts Grid */}
        {chartData.length > 0 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <ChartCard title="Hlášené infekce">
                  <ResponsiveContainer width="100%" height={250}>
                    <ComposedChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                      <XAxis dataKey="day" fontSize={10} stroke="#9ca3af" />
                      <YAxis fontSize={10} stroke="#9ca3af" width={40} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                      <Bar dataKey="observedInfections" fill="#f59e0b" name="Případy" radius={[4, 4, 0, 0]} />
                    </ComposedChart>
                  </ResponsiveContainer>
               </ChartCard>

               <ChartCard title="Vývoj Reff">
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                      <XAxis dataKey="day" fontSize={10} stroke="#9ca3af" />
                      <YAxis domain={[0, 'auto']} fontSize={10} stroke="#9ca3af" width={30} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                      <ReferenceLine y={1} stroke="#ef4444" strokeDasharray="5 5" />
                      <Line type="monotone" dataKey="Reff" stroke="#6366f1" dot={false} strokeWidth={3} name="Reff" />
                    </LineChart>
                  </ResponsiveContainer>
               </ChartCard>
            </div>

            <ChartCard title="Obsazenost nemocnic (Lůžka vs JIP)">
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="day" fontSize={10} stroke="#9ca3af" />
                  <YAxis fontSize={10} stroke="#9ca3af" width={40} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                  <Line type="monotone" dataKey="totalH" stroke="#f97316" dot={false} strokeWidth={2} name="Hospitalizovaní" />
                  <Line type="monotone" dataKey="totalICU" stroke="#dc2626" dot={false} strokeWidth={3} name="JIP (ventilátory)" />
                  <ReferenceLine y={hospCapacity} stroke="#f97316" strokeDasharray="5 5" />
                  <ReferenceLine y={icuCapacity} stroke="#dc2626" strokeDasharray="5 5" />
                </ComposedChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Nová úmrtí denně">
              <ResponsiveContainer width="100%" height={180}>
                <ComposedChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="day" fontSize={10} stroke="#9ca3af" />
                  <YAxis fontSize={10} stroke="#9ca3af" width={30} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="newDeaths" fill="#4b5563" name="Úmrtí" radius={[2, 2, 0, 0]} />
                </ComposedChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        )}

        {chartData.length === 0 && (
          <div className="flex flex-col items-center justify-center h-96 bg-white border border-dashed border-gray-200 rounded-[2rem] text-gray-300">
             <div className="text-5xl mb-6 grayscale opacity-20">🏛️</div>
             <p className="text-xs font-black uppercase tracking-[0.3em] mb-2">Ústřední krizový štáb</p>
             <p className="text-[10px] font-bold italic">Zatím neproběhlo žádné jednání štábu.</p>
             <p className="text-[10px] mt-8 text-gray-400">
               <span className="hidden lg:inline">Nastavte první opatření vpravo a klikněte na tlačítko.</span>
               <span className="lg:hidden">Scrollujte dolů pro nastavení opatření.</span>
             </p>
          </div>
        )}
      </div>

      {/* Action sidebar */}
      <aside className="w-full lg:w-80 border-l border-gray-200 bg-white overflow-y-auto p-4 flex-shrink-0 shadow-2xl">
        <ActionPanel />
      </aside>

      <MonthlyDebriefModal />
      <CrisisPopup />
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm flex flex-col">
      <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 border-l-4 border-gray-100 pl-4">{title}</h3>
      <div className="flex-1 min-h-[200px]">
        {children}
      </div>
    </div>
  );
}
