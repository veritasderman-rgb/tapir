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
  ReferenceLine,
} from 'recharts';
import { useGameStore } from '../../store/gameStore';

export default function GameOverScreen() {
  const { turnHistory, gameScenario, resetGame } = useGameStore();

  const metrics = useMemo(() => turnHistory.flatMap(h => h.metrics), [turnHistory]);
  const lastReport = turnHistory[turnHistory.length - 1]?.report;

  const baselineDeaths = (lastReport as any)?.baselineCumulativeDeaths ?? 15000;
  const actualDeaths = lastReport?.cumulativeDeaths ?? 0;
  const livesSaved = (lastReport as any)?.livesSaved ?? Math.max(0, baselineDeaths - actualDeaths);

  if (!gameScenario) return null;

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-12 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter italic leading-none">Simulace ukončena</h1>
          <p className="text-gray-500 font-bold uppercase tracking-[0.3em] text-xs md:text-sm">Krizový štáb České republiky — Závěrečný report</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatBox label="Celkový počet obětí" value={actualDeaths.toLocaleString()} color="text-red-500" />
          <StatBox label="Odvrácená úmrtí" value={`+${livesSaved.toLocaleString()}`} color="text-green-500" />
          <StatBox label="Dopad na ekonomiku" value={`${lastReport?.economicState.gdpImpact.toFixed(1)} %`} color="text-blue-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ChartBox title="Dynamika úmrtnosti (Kumulativní)">
             <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={metrics}>
                   <defs>
                      <linearGradient id="colorDeaths" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                   </defs>
                   <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                   <XAxis dataKey="day" stroke="#4b5563" fontSize={10} />
                   <YAxis stroke="#4b5563" fontSize={10} />
                   <Tooltip contentStyle={{ backgroundColor: '#030712', borderColor: '#1f2937', borderRadius: '12px' }} />
                   <Area type="monotone" dataKey="newDeaths" stroke="#ef4444" fillOpacity={1} fill="url(#colorDeaths)" strokeWidth={3} name="Denní úmrtí" />
                </AreaChart>
             </ResponsiveContainer>
          </ChartBox>

          <ChartBox title="Kritická infrastruktura (JIP)">
             <ResponsiveContainer width="100%" height={350}>
                <LineChart data={metrics}>
                   <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                   <XAxis dataKey="day" stroke="#4b5563" fontSize={10} />
                   <YAxis stroke="#4b5563" fontSize={10} />
                   <Tooltip contentStyle={{ backgroundColor: '#030712', borderColor: '#1f2937', borderRadius: '12px' }} />
                   <ReferenceLine y={gameScenario.baseScenario.healthCapacity.icuBeds} stroke="#ef4444" strokeDasharray="5 5" label={{ value: 'Kapacita', fill: '#ef4444', fontSize: 10, position: 'insideTopRight' }} />
                   <Line type="monotone" dataKey="newICU" stroke="#6366f1" dot={false} strokeWidth={4} name="Potřeba lůžek" />
                </LineChart>
             </ResponsiveContainer>
          </ChartBox>
        </div>

        <div className="flex flex-col md:flex-row justify-center items-center gap-6 pt-12 pb-24">
          <button
            onClick={resetGame}
            className="w-full md:w-auto px-16 py-5 bg-white text-black font-black uppercase tracking-widest rounded-2xl hover:bg-gray-200 transition-all shadow-[0_20px_50px_rgba(255,255,255,0.1)] active:scale-95"
          >
            Nová simulace
          </button>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center shadow-2xl">
      <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-3">{label}</span>
      <span className={`text-5xl md:text-7xl font-black tabular-nums ${color} leading-none`}>{value}</span>
    </div>
  );
}

function ChartBox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-[3rem] p-8 shadow-inner">
      <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-600 mb-8 border-l-4 border-gray-800 pl-4">{title}</h3>
      {children}
    </div>
  );
}
