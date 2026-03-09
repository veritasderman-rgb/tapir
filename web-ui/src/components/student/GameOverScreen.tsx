import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { useGameStore } from '../../store/gameStore';

export default function GameOverScreen() {
  const { turnHistory, gameScenario, resetGame, trust, crisisLeader, premierTakeoverDone } = useGameStore();

  const totalDeaths = turnHistory.length > 0
    ? turnHistory[turnHistory.length - 1].report.cumulativeDeaths : 0;
  const totalTrueInfections = turnHistory.reduce((s, h) => s + h.report.trueInfections, 0);
  const totalObservedInfections = turnHistory.reduce((s, h) => s + h.report.observedInfections, 0);
  const peakHosp = Math.max(...turnHistory.map(h => h.report.hospitalOccupancy));
  const overflowTurns = turnHistory.filter(h => h.report.capacityOverflow).length;
  const lowestCapital = Math.min(...turnHistory.map(h => h.report.socialCapital));
  const finalGDP = turnHistory.length > 0
    ? turnHistory[turnHistory.length - 1].report.economicState.gdpImpact : 0;
  const finalFiscal = turnHistory.length > 0
    ? turnHistory[turnHistory.length - 1].report.economicState.fiscalCost : 0;

  // Per-turn chart data
  const turnData = useMemo(() =>
    turnHistory.map(h => ({
      turn: `T${h.turnNumber}`,
      trueInfections: h.report.trueInfections,
      observedInfections: h.report.observedInfections,
      deaths: h.report.newDeaths,
      socialCapital: h.report.socialCapital,
      hospitalOccupancy: h.report.hospitalOccupancy,
      gdpImpact: h.report.economicState.gdpImpact,
    })),
  [turnHistory]);

  // Timeline of decisions
  const decisionTimeline = useMemo(() =>
    turnHistory.map(h => ({
      turn: h.turnNumber,
      measures: h.action.activeMeasureIds.length,
      dateLabel: h.report.dateLabel,
    })),
  [turnHistory]);

  // Score: penalize deaths, overflow, low social capital, GDP loss
  const score = Math.max(0, Math.round(
    1000
    - totalDeaths * 0.01
    - overflowTurns * 30
    + lowestCapital * 2
    + finalGDP * 10, // GDP loss is negative, so this penalizes
  ));

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Krizovy stab — vyhodnoceni</h1>
        <p className="text-gray-500 mt-1">
          {gameScenario?.totalTurns} kol ({(gameScenario?.totalTurns ?? 24) * (gameScenario?.daysPerTurn ?? 14)} dni) simulace dokonceno
        </p>
      </div>

      {/* Score */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6 text-center">
        <div className="text-4xl font-black text-indigo-700">{score}</div>
        <div className="text-sm text-indigo-600 mt-1">Celkove skore</div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Celkem umrti" value={Math.round(totalDeaths).toLocaleString()} bad={totalDeaths > 1000} />
        <StatCard label="Skutecne infekce" value={Math.round(totalTrueInfections).toLocaleString()} />
        <StatCard label="Hlaseno infekci" value={Math.round(totalObservedInfections).toLocaleString()} />
        <StatCard label="Peak hospitalizace" value={Math.round(peakHosp).toLocaleString()} />
        <StatCard label="Kola pretizeni" value={String(overflowTurns)} bad={overflowTurns > 0} />
        <StatCard label="Min. soc. kapital" value={`${Math.round(lowestCapital)}`} bad={lowestCapital < 20} />
        <StatCard label="Dopad HDP" value={`${finalGDP > 0 ? '+' : ''}${finalGDP.toFixed(1)}%`} bad={finalGDP < -5} />
        <StatCard label="Fiskal. naklady" value={`${finalFiscal.toFixed(1)} mld`} />
        <StatCard label="Důvěra veřejnosti" value={`${Math.round(trust)}%`} bad={trust < 20} />
        <StatCard
          label="Vedení krize"
          value={premierTakeoverDone ? 'Premiér převzal' : 'Hlavní hygienik'}
          bad={premierTakeoverDone}
        />
      </div>

      {/* True vs Observed comparison — the big reveal */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Skutecny stav vs. hlasene pripady (za kolo)</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={turnData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="turn" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="trueInfections" stroke="#ef4444" name="Skutecne infekce" strokeWidth={2} />
            <Line type="monotone" dataKey="observedInfections" stroke="#f59e0b" strokeDasharray="6 3" name="Hlasene pripady" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Social capital & hospital occupancy over time */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Socialni kapital</h3>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={turnData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="turn" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Area type="monotone" dataKey="socialCapital" stroke="#10b981" fill="#10b981" fillOpacity={0.2} name="Soc. kapital" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Ekonomicky dopad (HDP)</h3>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={turnData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="turn" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="gdpImpact" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} name="HDP (%)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Decision timeline */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Chronologie rozhodnuti</h3>
        <div className="space-y-1">
          {decisionTimeline.map(d => (
            <div key={d.turn} className="flex items-center gap-2 text-xs">
              <span className="text-gray-500 w-20">{d.dateLabel.split(' — ')[0]}</span>
              <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${d.measures > 5 ? 'bg-red-100 text-red-700' : d.measures > 2 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                {d.measures} opatreni
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Play again */}
      <div className="flex justify-center">
        <button
          onClick={resetGame}
          className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700"
        >
          Hrat znovu
        </button>
      </div>
    </div>
  );
}

function StatCard({ label, value, bad }: { label: string; value: string; bad?: boolean }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3">
      <div className="text-[10px] text-gray-500">{label}</div>
      <div className={`text-lg font-bold ${bad ? 'text-red-600' : 'text-gray-900'}`}>{value}</div>
    </div>
  );
}
