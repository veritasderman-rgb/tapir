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
  Area,
  ComposedChart,
} from 'recharts';
import { useAppStore } from '../store/useAppStore';
import { useMemo } from 'react';
import type { DailyMetrics } from '@tapir/core';

const COLORS = {
  S: '#3b82f6',
  E: '#f59e0b',
  I: '#ef4444',
  R: '#10b981',
  V: '#8b5cf6',
  Reff: '#6366f1',
  hosp: '#f97316',
  icu: '#dc2626',
  deaths: '#4b5563',
  p95: '#bfdbfe',
  observed: '#f59e0b',
};

export default function Dashboard() {
  const { result, showTrue, showObserved, resultB, comparisonMode } = useAppStore();

  const data = useMemo(() => {
    if (!result) return [];
    return result.primaryRun.metrics.map((m, i) => {
      const state = result.primaryRun.states[i];
      const totalH = state?.strata.reduce((sum, s) => sum + s.H, 0) || 0;
      const totalICU = state?.strata.reduce((sum, s) => sum + s.ICU, 0) || 0;

      return {
        day: m.day,
        S: state?.strata.reduce((sum, s) => sum + s.S, 0) || 0,
        E: state?.strata.reduce((sum, s) => sum + s.E, 0) || 0,
        I: state?.strata.reduce((sum, s) => sum + s.I, 0) || 0,
        R: state?.strata.reduce((sum, s) => sum + s.R, 0) || 0,
        V: state?.strata.reduce((sum, s) => sum + s.V, 0) || 0,
        Reff: m.Reff,
        newInfections: m.newInfections,
        observedInfections: m.observedNewInfections,
        newDeaths: m.newDeaths,
        totalH,
        totalICU,
        infP5: result.quantiles?.infections[i]?.p5,
        infP95: result.quantiles?.infections[i]?.p95,
      };
    });
  }, [result]);

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
        <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Zatím nebyla spuštěna žádná simulace</p>
      </div>
    );
  }

  const { scenario } = result;

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          label="Max. hospitalizovaných"
          value={Math.round(Math.max(...data.map(d => d.totalH))).toLocaleString()}
        />
        <MetricCard
          label="Max. na JIP"
          value={Math.round(Math.max(...data.map(d => d.totalICU))).toLocaleString()}
        />
        <MetricCard
          label="Denní špička"
          value={Math.round(Math.max(...data.map(d => d.newInfections))).toLocaleString()}
        />
        <MetricCard
          label="Celkem úmrtí"
          value={Math.round(result.primaryRun.metrics.reduce((s, m) => s + m.newDeaths, 0)).toLocaleString()}
          highlight
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Vývoj skupin obyvatelstva (SEIRV)">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="day" hide={false} fontSize={10} tickMargin={10} />
              <YAxis fontSize={10} width={40} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
              <Line type="monotone" dataKey="S" stroke={COLORS.S} dot={false} strokeWidth={2} name="Vnímaví" />
              <Line type="monotone" dataKey="I" stroke={COLORS.I} dot={false} strokeWidth={2} name="Infekční" />
              <Line type="monotone" dataKey="R" stroke={COLORS.R} dot={false} strokeWidth={2} name="Vyléčení" />
              {data.some(d => d.V > 0) && (
                <Line type="monotone" dataKey="V" stroke={COLORS.V} dot={false} strokeWidth={2} name="Očkovaní" />
              )}
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Epidemiologická křivka">
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="day" fontSize={10} />
              <YAxis fontSize={10} width={40} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
              {data[0]?.infP5 !== undefined && (
                <Area type="monotone" dataKey="infP95" stroke="none" fill={COLORS.p95} fillOpacity={0.2} name="95% interval" />
              )}
              {showTrue && (
                <Line type="monotone" dataKey="newInfections" stroke={COLORS.I} dot={false} strokeWidth={3} name="Skutečné" />
              )}
              {showObserved && (
                <Line type="monotone" dataKey="observedInfections" stroke={COLORS.observed} strokeDasharray="5 5" dot={false} name="Hlášené" />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Reprodukční číslo Reff">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="day" fontSize={10} />
              <YAxis domain={[0, 'auto']} fontSize={10} width={40} />
              <Tooltip />
              <ReferenceLine y={1} stroke="#ef4444" strokeDasharray="5 5" />
              <Line type="monotone" dataKey="Reff" stroke={COLORS.Reff} dot={false} strokeWidth={3} name="Efektivní R" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Zátěž zdravotnictví">
          <ResponsiveContainer width="100%" height={250}>
            <ComposedChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="day" fontSize={10} />
              <YAxis fontSize={10} width={40} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
              <Line type="monotone" dataKey="totalH" stroke={COLORS.hosp} dot={false} strokeWidth={2} name="Lůžka" />
              <Line type="monotone" dataKey="totalICU" stroke={COLORS.icu} dot={false} strokeWidth={2} name="JIP" />
              <ReferenceLine y={scenario.healthCapacity.hospitalBeds} stroke={COLORS.hosp} strokeDasharray="3 3" />
              <ReferenceLine y={scenario.healthCapacity.icuBeds} stroke={COLORS.icu} strokeDasharray="3 3" />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

function MetricCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`bg-white border border-gray-200 rounded-2xl p-4 shadow-sm ${highlight ? 'ring-2 ring-red-50' : ''}`}>
      <div className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">{label}</div>
      <div className={`text-2xl font-black tracking-tighter leading-none ${highlight ? 'text-red-600' : 'text-gray-900'}`}>{value}</div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm flex flex-col">
      <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-6 border-b border-gray-50 pb-3">{title}</h3>
      <div className="flex-1 min-h-[250px]">
        {children}
      </div>
    </div>
  );
}
