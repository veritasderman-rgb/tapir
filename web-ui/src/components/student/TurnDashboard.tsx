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
import { useEffect, useMemo, useState } from 'react';
import type { CompartmentState } from '@tapir/core';
import ActionPanel from './ActionPanel';
import MonthlyDebriefModal from './MonthlyDebriefModal';
import CrisisPopup from './CrisisPopup';
import ICUTracker from './ICUTracker';

type Tab = 'evaluation' | 'measures';

export default function TurnDashboard() {
  const { turnHistory, currentTurn, gameScenario, gamePhase, crisisLeader } = useGameStore();
  const [tab, setTab] = useState<Tab>('measures');

  // Po odehrání kola přepneme na vyhodnocení, ať jsou hned vidět výsledky.
  useEffect(() => {
    if (currentTurn > 0) setTab('evaluation');
  }, [currentTurn]);

  const chartData = useMemo(() => {
    if (turnHistory.length === 0) return [];
    return turnHistory.flatMap((h) =>
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
    <div className="flex h-full flex-col bg-brand-cream">
      {/* Header: stav + přepínač obrazovek */}
      <header className="bg-white border-b border-gray-200 px-3 md:px-5 pt-3 pb-0 flex-shrink-0">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-3">
          <Stat label="Kolo" value={`${currentTurn} / ${gameScenario.totalTurns}`} />
          {latestReport && (
            <>
              <Stat label="Úmrtí" value={latestReport.cumulativeDeaths.toLocaleString('cs-CZ')} tone="danger" />
              <Stat
                label="Odhad Reff"
                value={`~${latestReport.estimatedReff.toFixed(2)}`}
                tone={latestReport.estimatedReff > 1 ? 'danger' : 'ok'}
              />
              <Stat
                label="Vedení"
                value={crisisLeader === 'hygienik' ? 'Hygienik' : 'Premiér'}
              />
            </>
          )}
          {gamePhase === 'finished' && (
            <span className="ml-auto text-[10px] font-black text-white bg-brand-teal px-3 py-1 rounded-full uppercase tracking-widest animate-pulse">
              Simulace ukončena
            </span>
          )}
        </div>

        <div className="flex gap-1 -mb-px">
          <TabButton active={tab === 'evaluation'} onClick={() => setTab('evaluation')}>
            Vyhodnocení epidemie
          </TabButton>
          <TabButton active={tab === 'measures'} onClick={() => setTab('measures')}>
            {gamePhase === 'finished' ? 'Opatření' : `Opatření — kolo ${currentTurn + 1}`}
          </TabButton>
        </div>
      </header>

      {/* Obsah obrazovky */}
      <main className="flex-1 overflow-y-auto">
        {tab === 'evaluation' ? (
          <div className="max-w-5xl mx-auto p-4 space-y-4">
            <ICUTracker />
            {chartData.length > 0 ? (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <ChartCard title="Hlášené infekce">
                    <ResponsiveContainer width="100%" height={240}>
                      <ComposedChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis dataKey="day" fontSize={10} stroke="#9ca3af" />
                        <YAxis fontSize={10} stroke="#9ca3af" width={40} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Bar dataKey="observedInfections" fill="#f59e0b" name="Případy" radius={[4, 4, 0, 0]} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </ChartCard>

                  <ChartCard title="Vývoj Reff">
                    <ResponsiveContainer width="100%" height={240}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis dataKey="day" fontSize={10} stroke="#9ca3af" />
                        <YAxis domain={[0, 'auto']} fontSize={10} stroke="#9ca3af" width={30} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <ReferenceLine y={1} stroke="#ef4444" strokeDasharray="5 5" />
                        <Line type="monotone" dataKey="Reff" stroke="#6366f1" dot={false} strokeWidth={3} name="Reff" />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartCard>
                </div>

                <ChartCard title="Obsazenost nemocnic (Lůžka vs JIP)">
                  <ResponsiveContainer width="100%" height={280}>
                    <ComposedChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                      <XAxis dataKey="day" fontSize={10} stroke="#9ca3af" />
                      <YAxis fontSize={10} stroke="#9ca3af" width={40} />
                      <Tooltip contentStyle={tooltipStyle} />
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
                      <Tooltip contentStyle={tooltipStyle} />
                      <Bar dataKey="newDeaths" fill="#4b5563" name="Úmrtí" radius={[2, 2, 0, 0]} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </ChartCard>

                {gamePhase !== 'finished' && (
                  <button
                    onClick={() => setTab('measures')}
                    className="w-full min-h-[52px] rounded-2xl bg-brand-charcoal text-white font-bold hover:bg-brand-charcoal/90 transition-colors"
                  >
                    Přejít na opatření pro kolo {currentTurn + 1} →
                  </button>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-80 bg-white border border-dashed border-gray-200 rounded-2xl text-brand-slate text-center px-6">
                <p className="eyebrow mb-2">Ústřední krizový štáb</p>
                <p className="text-sm italic text-gray-400">
                  Zatím neproběhlo žádné jednání štábu. Nastavte opatření na kartě „Opatření" a svolejte zasedání.
                </p>
                <button
                  onClick={() => setTab('measures')}
                  className="mt-6 min-h-[44px] px-6 rounded-xl bg-brand-teal text-white text-sm font-bold hover:bg-brand-teal-dark transition-colors"
                >
                  Nastavit první opatření →
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-5xl mx-auto p-4">
            <ActionPanel />
          </div>
        )}
      </main>

      <MonthlyDebriefModal />
      <CrisisPopup />
    </div>
  );
}

const tooltipStyle = {
  borderRadius: '12px',
  border: 'none',
  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
} as const;

function Stat({
  label,
  value,
  tone = 'default',
}: {
  label: string;
  value: string;
  tone?: 'default' | 'danger' | 'ok';
}) {
  const color = tone === 'danger' ? 'text-brand-red' : tone === 'ok' ? 'text-brand-ok' : 'text-brand-charcoal';
  return (
    <div>
      <span className="eyebrow block leading-none mb-1">{label}</span>
      <span className={`text-sm font-black tabular-nums ${color}`}>{value}</span>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`min-h-[44px] px-4 md:px-6 rounded-t-xl text-sm font-bold transition-colors border-b-2 ${
        active
          ? 'bg-brand-cream text-brand-charcoal border-brand-teal'
          : 'text-brand-slate border-transparent hover:text-brand-charcoal'
      }`}
    >
      {children}
    </button>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 md:p-6 shadow-sm">
      <h3 className="eyebrow mb-5 border-l-4 border-brand-teal-soft pl-3">{title}</h3>
      <div className="min-h-[180px]">{children}</div>
    </div>
  );
}
