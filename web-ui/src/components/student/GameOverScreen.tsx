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
} from 'recharts';
import { useGameStore } from '../../store/gameStore';

export default function GameOverScreen() {
  const { turnHistory, gameScenario, resetGame } = useGameStore();

  const totalDeaths = turnHistory.reduce((s, h) => s + h.report.newDeaths, 0);
  const totalTrueInfections = turnHistory.reduce((s, h) => s + h.report.trueInfections, 0);
  const totalObservedInfections = turnHistory.reduce((s, h) => s + h.report.observedInfections, 0);
  const peakHosp = Math.max(...turnHistory.map(h => h.report.hospitalOccupancy));
  const overflowMonths = turnHistory.filter(h =>
    h.report.hospitalOccupancy > (gameScenario?.baseScenario.healthCapacity.hospitalBeds ?? Infinity),
  ).length;
  const lowestCapital = Math.min(...turnHistory.map(h => h.report.socialCapital));

  // True vs observed chart data (monthly)
  const monthlyData = useMemo(() =>
    turnHistory.map(h => ({
      month: `M${h.month}`,
      trueInfections: h.report.trueInfections,
      observedInfections: h.report.observedInfections,
      deaths: h.report.newDeaths,
      socialCapital: h.report.socialCapital,
    })),
  [turnHistory]);

  // Simple score: lower deaths + lower overflow + higher social capital = better
  const score = Math.max(0, Math.round(
    1000
    - totalDeaths * 0.01
    - overflowMonths * 50
    + lowestCapital * 2,
  ));

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Hra skoncila</h1>
        <p className="text-gray-500 mt-1">
          {gameScenario?.durationMonths} mesicu simulace dokonceno
        </p>
      </div>

      {/* Score */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6 text-center">
        <div className="text-4xl font-black text-indigo-700">{score}</div>
        <div className="text-sm text-indigo-600 mt-1">Skore</div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <StatCard label="Celkem umrti" value={Math.round(totalDeaths).toLocaleString()} bad={totalDeaths > 1000} />
        <StatCard label="Skutecne infekce" value={Math.round(totalTrueInfections).toLocaleString()} />
        <StatCard label="Hlaseno infekci" value={Math.round(totalObservedInfections).toLocaleString()} />
        <StatCard label="Peak hospitalizace" value={Math.round(peakHosp).toLocaleString()} />
        <StatCard label="Mesice pretizeni" value={String(overflowMonths)} bad={overflowMonths > 0} />
        <StatCard label="Min. soc. kapital" value={`${Math.round(lowestCapital)}%`} bad={lowestCapital < 20} />
      </div>

      {/* True vs Observed comparison */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Skutecny stav vs. hlasene pripady</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="trueInfections" stroke="#ef4444" name="Skutecne infekce" />
            <Line type="monotone" dataKey="observedInfections" stroke="#f59e0b" strokeDasharray="6 3" name="Hlasene" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Social capital over time */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Socialni kapital v case</h3>
        <ResponsiveContainer width="100%" height={150}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Line type="monotone" dataKey="socialCapital" stroke="#10b981" name="Soc. kapital (%)" />
          </LineChart>
        </ResponsiveContainer>
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
