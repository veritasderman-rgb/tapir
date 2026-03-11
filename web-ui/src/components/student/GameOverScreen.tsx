import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  ReferenceLine,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import { useGameStore } from '../../store/gameStore';

const AGE_GROUP_LABELS = ['0–17 let', '18–64 let', '65+ let'];
const AGE_GROUP_COLORS = ['#60a5fa', '#a78bfa', '#f87171'];

/** Personal stories generated based on death count severity */
function generatePersonalStories(cumulativeDeaths: number, totalPopulation: number): { icon: string; text: string }[] {
  const deathRate = cumulativeDeaths / totalPopulation;
  const stories: { icon: string; text: string }[] = [];

  if (cumulativeDeaths > 100) {
    stories.push({
      icon: '👩‍🍳',
      text: 'Marie Nováková (72) provozovala malou cukrárnu v Brně. Když zavedli omezení, přišla o zákazníky. Nakonec podlehla nákaze v přeplněné nemocnici, kde na ni nezbyl ventilát.',
    });
  }
  if (cumulativeDeaths > 500) {
    stories.push({
      icon: '👨‍💼',
      text: 'Tomáš Krejčí (45), jednatel stavební firmy, propustil 30 zaměstnanců. „Každý den přemýšlím, jestli jsem měl zavřít dříve," říká. Sám proděl těžký průběh na JIP.',
    });
  }
  if (cumulativeDeaths > 2000) {
    stories.push({
      icon: '👩‍⚖️',
      text: 'JUDr. Helena Dvořáková podala žalobu na stát za pozdní zavedení opatření. „Moje matka nemusela zemřít. Chybělo jediné lůžko," vysvětluje s třesoucím hlasem.',
    });
  }
  if (cumulativeDeaths > 5000) {
    stories.push({
      icon: '👨‍👧',
      text: 'Petr Šťastný (38) ztratil oba rodiče během jednoho týdne. „Dcera se ptá, kdy se babička vrátí. Nevím, jak jí to říct." Založil spolek pozůstalých rodin.',
    });
  }
  if (deathRate > 0.001) {
    stories.push({
      icon: '🏥',
      text: 'MUDr. Jana Procházková, primářka interny, popisuje kolaps systému: „Vybírali jsme, kdo dostane kyslík. To vás v učebnici nepřipraví." Po epidemii odešla z medicíny.',
    });
  }
  if (deathRate > 0.005) {
    stories.push({
      icon: '🏛️',
      text: 'Poslanec Miroslav Havel, původně kritik opatření, změnil názor po smrti kolegy: „Říkal jsem, že je to chřipka. Mýlil jsem se a za tu chybu zaplatili jiní."',
    });
  }
  if (cumulativeDeaths > 10000) {
    stories.push({
      icon: '🕯️',
      text: `Občanské sdružení „Nezapomeneme" eviduje ${cumulativeDeaths.toLocaleString()} jmen na pamětním portálu. „Každé číslo je člověk," říká zakladatelka Eva Marková, která přišla o manžela.`,
    });
  }

  // Always show at least 2 stories
  if (stories.length === 0) {
    stories.push(
      { icon: '👨‍⚕️', text: 'MUDr. Pavel Horák, záchranář: „Byli jsme připraveni. Rychlá reakce štábu nám umožnila zvládnout nápor. Ale bylo to na hraně."' },
      { icon: '👩‍🏫', text: 'Učitelka Alena Benešová: „Distanční výuka byla náročná, ale děti to zvládly. Důležité je, že jsme neztratili nikoho z našich."' },
    );
  }

  return stories;
}

export default function GameOverScreen() {
  const { turnHistory, gameScenario, resetGame } = useGameStore();

  const metrics = useMemo(() => turnHistory.flatMap(h => h.metrics), [turnHistory]);
  const lastReport = turnHistory[turnHistory.length - 1]?.report;

  const baselineDeaths = (lastReport as any)?.baselineCumulativeDeaths ?? 15000;
  const actualDeaths = lastReport?.cumulativeDeaths ?? 0;
  const livesSaved = (lastReport as any)?.livesSaved ?? Math.max(0, baselineDeaths - actualDeaths);
  const totalPopulation = gameScenario?.baseScenario.demographics.totalPopulation ?? 10_000_000;

  // Compute age-stratified deaths from the final population state
  const ageDeaths = useMemo(() => {
    const lastTurn = turnHistory[turnHistory.length - 1];
    if (!lastTurn?.states?.length) return null;
    const finalState = lastTurn.states[lastTurn.states.length - 1];
    if (!finalState?.strata) return null;

    // Strata: 0=child-std, 1=child-risk, 2=adult-std, 3=adult-risk, 4=senior-std, 5=senior-risk
    const groups = [
      { label: AGE_GROUP_LABELS[0], deaths: Math.round(finalState.strata[0].D + finalState.strata[1].D) },
      { label: AGE_GROUP_LABELS[1], deaths: Math.round(finalState.strata[2].D + finalState.strata[3].D) },
      { label: AGE_GROUP_LABELS[2], deaths: Math.round(finalState.strata[4].D + finalState.strata[5].D) },
    ];
    return groups;
  }, [turnHistory]);

  const personalStories = useMemo(
    () => generatePersonalStories(actualDeaths, totalPopulation),
    [actualDeaths, totalPopulation],
  );

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

        {/* Age stratification */}
        {ageDeaths && (
          <ChartBox title="Věková stratifikace obětí">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={ageDeaths} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" horizontal={false} />
                  <XAxis type="number" stroke="#4b5563" fontSize={10} />
                  <YAxis type="category" dataKey="label" stroke="#4b5563" fontSize={11} width={80} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#030712', borderColor: '#1f2937', borderRadius: '12px' }}
                    formatter={(value) => [Number(value).toLocaleString(), 'Úmrtí']}
                  />
                  <Bar dataKey="deaths" radius={[0, 8, 8, 0]} name="Úmrtí">
                    {ageDeaths.map((_, index) => (
                      <Cell key={index} fill={AGE_GROUP_COLORS[index]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="space-y-3">
                {ageDeaths.map((g, i) => {
                  const pct = actualDeaths > 0 ? ((g.deaths / actualDeaths) * 100).toFixed(1) : '0';
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: AGE_GROUP_COLORS[i] }} />
                      <div>
                        <span className="text-sm font-bold text-gray-300">{g.label}</span>
                        <span className="text-gray-500 text-xs ml-2">{g.deaths.toLocaleString()} ({pct} %)</span>
                      </div>
                    </div>
                  );
                })}
                <div className="border-t border-gray-800 pt-2 mt-2">
                  <span className="text-[10px] text-gray-600 uppercase tracking-wider">
                    {actualDeaths > 0 && ageDeaths[2].deaths / actualDeaths > 0.5
                      ? 'Senioři tvoří většinu obětí — ochrana rizikových skupin byla klíčová.'
                      : actualDeaths > 0 && ageDeaths[1].deaths / actualDeaths > 0.5
                      ? 'Ekonomicky aktivní populace byla těžce zasažena.'
                      : 'Rozložení obětí napříč věkovými skupinami.'}
                  </span>
                </div>
              </div>
            </div>
          </ChartBox>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ChartBox title="Dynamika úmrtnosti (denní)">
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

        {/* Personal stories */}
        <ChartBox title="Příběhy z epidemie">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {personalStories.map((story, i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex gap-4 items-start">
                <span className="text-2xl flex-shrink-0">{story.icon}</span>
                <p className="text-xs text-gray-400 leading-relaxed italic">{story.text}</p>
              </div>
            ))}
          </div>
        </ChartBox>

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
