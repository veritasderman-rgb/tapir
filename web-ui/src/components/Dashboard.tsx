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
  AreaChart,
  ComposedChart,
  Bar,
} from 'recharts';
import { useAppStore } from '../store/useAppStore';
import { useMemo } from 'react';
import type { PopulationState, CompartmentState, DailyMetrics } from '@tapir/core';

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
  excess: '#991b1b',
  p5: '#bfdbfe',
  p95: '#bfdbfe',
  observed: '#f59e0b',
};

interface ChartData {
  day: number;
  S: number;
  E: number;
  I: number;
  R: number;
  V: number;
  Reff: number;
  newInfections: number;
  newHosp: number;
  newICU: number;
  newDeaths: number;
  excessDeaths: number;
  totalH: number;
  totalICU: number;
  hospCap: number;
  icuCap: number;
  // MC quantiles
  infP5?: number;
  infP95?: number;
  infMedian?: number;
  // Observed (reported) values
  observedInfections?: number;
  observedHosp?: number;
}

export default function Dashboard() {
  const { result, scenario, comparisonMode, resultB, viewMode, setViewMode } = useAppStore();

  const hasReporting = !!scenario.reportingConfig;

  const data = useMemo((): ChartData[] => {
    if (!result) return [];

    return result.primaryRun.states.slice(1).map((state, i) => {
      const metrics = result.primaryRun.metrics[i];
      const q = result.quantiles;
      return {
        day: state.day,
        S: state.strata.reduce((s: number, st: CompartmentState) => s + st.S, 0),
        E: state.strata.reduce((s: number, st: CompartmentState) => s + st.E, 0),
        I: state.strata.reduce((s: number, st: CompartmentState) => s + st.I, 0),
        R: state.strata.reduce((s: number, st: CompartmentState) => s + st.R, 0),
        V: state.strata.reduce((s: number, st: CompartmentState) => s + st.V, 0),
        Reff: metrics.Reff,
        newInfections: metrics.newInfections,
        newHosp: metrics.newHospitalizations,
        newICU: metrics.newICU,
        newDeaths: metrics.newDeaths,
        excessDeaths: metrics.excessDeaths,
        totalH: state.strata.reduce((s: number, st: CompartmentState) => s + st.H, 0),
        totalICU: state.strata.reduce((s: number, st: CompartmentState) => s + st.ICU, 0),
        hospCap: scenario.healthCapacity.hospitalBeds,
        icuCap: scenario.healthCapacity.icuBeds,
        infP5: q?.infections[i]?.p5,
        infP95: q?.infections[i]?.p95,
        infMedian: q?.infections[i]?.median,
        observedInfections: metrics.observedNewInfections,
        observedHosp: metrics.observedNewHospitalizations,
      };
    });
  }, [result, scenario]);

  const hasOverflow = useMemo(() => {
    if (!result) return false;
    return result.primaryRun.metrics.some((m: DailyMetrics) => m.hospitalOverflow || m.icuOverflow);
  }, [result]);

  if (!result) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm">
        Nastavte parametry a spusťte simulaci.
      </div>
    );
  }

  const showTrue = viewMode === 'true' || viewMode === 'both';
  const showObserved = (viewMode === 'observed' || viewMode === 'both') && hasReporting;

  return (
    <div className="space-y-6 p-4">
      {/* Overflow warning */}
      {hasOverflow && (
        <div className="bg-red-100 border border-red-300 text-red-800 px-4 py-2 rounded text-sm font-medium" role="alert">
          Kapacita zdravotnictvi byla prekrocena! Excess deaths mohou nastat.
        </div>
      )}

      {/* View mode toggle */}
      {hasReporting && (
        <div className="flex items-center gap-2 text-xs">
          <span className="font-medium text-gray-600">Zobrazeni:</span>
          {(['true', 'observed', 'both'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-2 py-1 rounded ${
                viewMode === mode
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {mode === 'true' ? 'Skutecny stav' : mode === 'observed' ? 'Hlasene pripady' : 'Oba'}
            </button>
          ))}
        </div>
      )}

      {/* Key metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label="Implied R0" value={result.impliedR0.toFixed(2)} />
        <MetricCard label="Beta" value={result.calibratedBeta.toFixed(4)} />
        <MetricCard
          label="Peak novych infekci"
          value={Math.round(Math.max(...result.primaryRun.metrics.map((m: DailyMetrics) => m.newInfections))).toLocaleString()}
        />
        <MetricCard
          label="Celkem umrti"
          value={Math.round(result.primaryRun.metrics.reduce((s: number, m: DailyMetrics) => s + m.newDeaths, 0)).toLocaleString()}
        />
      </div>

      {/* SEIR curves */}
      <ChartCard title="SEIR kompartmenty">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" label={{ value: 'Den', position: 'bottom' }} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="S" stroke={COLORS.S} dot={false} name="S (susceptible)" />
            <Line type="monotone" dataKey="E" stroke={COLORS.E} dot={false} name="E (exposed)" />
            <Line type="monotone" dataKey="I" stroke={COLORS.I} dot={false} name="I (infectious)" />
            <Line type="monotone" dataKey="R" stroke={COLORS.R} dot={false} name="R (recovered)" />
            {data.some(d => d.V > 0) && (
              <Line type="monotone" dataKey="V" stroke={COLORS.V} dot={false} name="V (vaccinated)" />
            )}
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* New infections + MC bands + observed */}
      <ChartCard title="Nove infekce denne">
        <ResponsiveContainer width="100%" height={250}>
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Legend />
            {data[0]?.infP5 !== undefined && (
              <Area
                type="monotone"
                dataKey="infP95"
                stroke="none"
                fill={COLORS.p95}
                fillOpacity={0.3}
                name="p95"
              />
            )}
            {data[0]?.infP5 !== undefined && (
              <Area
                type="monotone"
                dataKey="infP5"
                stroke="none"
                fill="#fff"
                fillOpacity={1}
                name="p5"
              />
            )}
            {showTrue && (
              <Line type="monotone" dataKey="newInfections" stroke={COLORS.I} dot={false} name="Skutecne infekce" />
            )}
            {showObserved && data[0]?.observedInfections !== undefined && (
              <Line
                type="monotone"
                dataKey="observedInfections"
                stroke={COLORS.observed}
                strokeDasharray="6 3"
                dot={false}
                name="Hlasene infekce"
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Reff */}
      <ChartCard title="Efektivni reprodukcni cislo Reff(t)">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis domain={[0, 'auto']} />
            <Tooltip />
            <ReferenceLine y={1} stroke="#ef4444" strokeDasharray="5 5" label="Reff = 1" />
            <Line type="monotone" dataKey="Reff" stroke={COLORS.Reff} dot={false} name="Reff" />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Hospitalizations + ICU */}
      <ChartCard title="Hospitalizace a ICU">
        <ResponsiveContainer width="100%" height={250}>
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="totalH" stroke={COLORS.hosp} dot={false} name="Hospitalizovani" />
            <Line type="monotone" dataKey="totalICU" stroke={COLORS.icu} dot={false} name="ICU" />
            <ReferenceLine y={scenario.healthCapacity.hospitalBeds} stroke={COLORS.hosp} strokeDasharray="5 5" label="Kapacita H" />
            <ReferenceLine y={scenario.healthCapacity.icuBeds} stroke={COLORS.icu} strokeDasharray="5 5" label="Kapacita ICU" />
            <Bar dataKey="excessDeaths" fill={COLORS.excess} name="Excess deaths" opacity={0.5} />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Comparison */}
      {comparisonMode && resultB && (
        <ChartCard title="Porovnani: Nove infekce (A vs B)">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                data={result.primaryRun.metrics.map((m: DailyMetrics) => ({ day: m.day, value: m.newInfections }))}
                type="monotone"
                dataKey="value"
                stroke={COLORS.I}
                dot={false}
                name="Scenar A"
              />
              <Line
                data={resultB.primaryRun.metrics.map((m: DailyMetrics) => ({ day: m.day, value: m.newInfections }))}
                type="monotone"
                dataKey="value"
                stroke={COLORS.V}
                dot={false}
                name="Scenar B"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      )}
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-lg font-bold text-gray-900">{value}</div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">{title}</h3>
      {children}
    </div>
  );
}
