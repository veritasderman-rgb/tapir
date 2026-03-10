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
  BarChart,
  Bar,
  ReferenceLine,
} from 'recharts';
import { useGameStore } from '../../store/gameStore';
import { ALL_STRATA, getMeasureById } from '@tapir/core';

const STRATUM_LABELS = [
  'Děti 0–18 (standard)',
  'Děti 0–18 (rizikoví)',
  'Dospělí 19–64 (standard)',
  'Dospělí 19–64 (rizikoví)',
  'Senioři 65+ (standard)',
  'Senioři 65+ (rizikoví)',
];

const STRATUM_COLORS = ['#60a5fa', '#3b82f6', '#fbbf24', '#f59e0b', '#f87171', '#dc2626'];

export default function GameOverScreen() {
  const { turnHistory, gameScenario, resetGame, trust, crisisLeader, premierTakeoverDone } = useGameStore();

  const totalDeaths = turnHistory.length > 0
    ? turnHistory[turnHistory.length - 1].report.cumulativeDeaths : 0;
  const totalTrueInfections = turnHistory.reduce((s, h) => s + h.report.trueInfections, 0);
  const totalObservedInfections = turnHistory.reduce((s, h) => s + h.report.observedInfections, 0);
  const peakHosp = Math.max(...turnHistory.map(h => h.report.hospitalOccupancy));
  const peakICU = Math.max(...turnHistory.map(h => h.report.icuOccupancy));
  const overflowTurns = turnHistory.filter(h => h.report.capacityOverflow).length;
  const lowestCapital = Math.min(...turnHistory.map(h => h.report.socialCapital));
  const finalGDP = turnHistory.length > 0
    ? turnHistory[turnHistory.length - 1].report.economicState.gdpImpact : 0;
  const finalFiscal = turnHistory.length > 0
    ? turnHistory[turnHistory.length - 1].report.economicState.fiscalCost : 0;

  // Detection gap
  const detectionRate = totalTrueInfections > 0
    ? (totalObservedInfections / totalTrueInfections * 100) : 100;
  const undetected = totalTrueInfections - totalObservedInfections;

  // Per-turn chart data
  const turnData = useMemo(() =>
    turnHistory.map(h => ({
      turn: `T${h.turnNumber}`,
      trueInfections: h.report.trueInfections,
      observedInfections: h.report.observedInfections,
      deaths: h.report.newDeaths,
      cumulativeDeaths: h.report.cumulativeDeaths,
      socialCapital: h.report.socialCapital,
      hospitalOccupancy: h.report.hospitalOccupancy,
      hospitalCapacity: h.report.hospitalCapacity,
      icuOccupancy: h.report.icuOccupancy,
      icuCapacity: h.report.icuCapacity,
      gdpImpact: h.report.economicState.gdpImpact,
      trueReff: h.report.trueReff,
      estimatedReff: h.report.estimatedReff,
    })),
  [turnHistory]);

  // Per-stratum deaths from final population state
  const stratumDeaths = useMemo(() => {
    if (turnHistory.length === 0) return [];
    const lastStates = turnHistory[turnHistory.length - 1].states;
    if (lastStates.length === 0) return [];
    const finalState = lastStates[lastStates.length - 1];
    return finalState.strata.map((s, i) => ({
      name: STRATUM_LABELS[i] ?? `Stratum ${i}`,
      deaths: Math.round(s.D),
      color: STRATUM_COLORS[i],
    }));
  }, [turnHistory]);

  // Hospital occupancy over time with capacity lines
  const hospData = useMemo(() =>
    turnHistory.map(h => ({
      turn: `T${h.turnNumber}`,
      hospitalizovani: h.report.hospitalOccupancy,
      ICU: h.report.icuOccupancy,
      kapacitaH: h.report.hospitalCapacity,
      kapacitaICU: h.report.icuCapacity,
    })),
  [turnHistory]);

  // Deaths per turn chart
  const deathsData = useMemo(() =>
    turnHistory.map(h => ({
      turn: `T${h.turnNumber}`,
      deaths: h.report.newDeaths,
      cumulative: h.report.cumulativeDeaths,
    })),
  [turnHistory]);

  // Reff over time
  const reffData = useMemo(() =>
    turnHistory.map(h => ({
      turn: `T${h.turnNumber}`,
      trueReff: parseFloat(h.report.trueReff.toFixed(2)),
      estimatedReff: parseFloat(h.report.estimatedReff.toFixed(2)),
    })),
  [turnHistory]);

  // Timeline of decisions with measure names
  const decisionTimeline = useMemo(() =>
    turnHistory.map(h => ({
      turn: h.turnNumber,
      measures: h.action.activeMeasureIds,
      measureNames: h.action.activeMeasureIds.map(id => getMeasureById(id)?.name ?? id),
      dateLabel: h.report.dateLabel,
    })),
  [turnHistory]);

  // Counterfactual estimates based on actual simulation parameters
  const { estimateExtreme, estimateModerate, estimateNoAction } = useMemo(() => {
    if (!gameScenario) return { estimateExtreme: 0, estimateModerate: 0, estimateNoAction: 0 };
    const r0 = gameScenario.baseScenario.epiConfig.R0;
    const pop = gameScenario.baseScenario.demographics.totalPopulation;
    const demo = gameScenario.baseScenario.demographics;
    const params = gameScenario.baseScenario.epiConfig.stratumParams;

    // Weighted IFR by actual population structure (6 strata)
    const stratumPops = [
      demo.ageFractions[0] * (1 - demo.riskFractions[0]), // child standard
      demo.ageFractions[0] * demo.riskFractions[0],        // child risk
      demo.ageFractions[1] * (1 - demo.riskFractions[1]), // adult standard
      demo.ageFractions[1] * demo.riskFractions[1],        // adult risk
      demo.ageFractions[2] * (1 - demo.riskFractions[2]), // senior standard
      demo.ageFractions[2] * demo.riskFractions[2],        // senior risk
    ];
    const weightedIFR = params.reduce((s, p, i) => s + p.ifr * stratumPops[i], 0);

    // No action: SIR final size approximation
    // Final epidemic size z satisfies: z = 1 - exp(-R0 * z)
    // Newton's method for a few iterations
    let z = 0.9; // initial guess
    for (let iter = 0; iter < 20; iter++) {
      const f = z - 1 + Math.exp(-r0 * z);
      const df = 1 + r0 * Math.exp(-r0 * z);
      z = z - f / df;
      z = Math.max(0.01, Math.min(0.999, z));
    }
    const noActionInfected = pop * z;
    // Without healthcare capacity, excess deaths add ~30-50%
    const hospCapacity = gameScenario.baseScenario.healthCapacity.hospitalBeds;
    const avgHospRate = params.reduce((s, p, i) => s + p.hospRate * stratumPops[i], 0);
    const peakHospDemand = noActionInfected * avgHospRate * 0.15; // ~15% of total cases at peak
    const overflowFactor = peakHospDemand > hospCapacity
      ? 1 + Math.min(0.5, (peakHospDemand - hospCapacity) / hospCapacity * 0.3)
      : 1.0;
    const estimateNoAction = Math.round(noActionInfected * weightedIFR * overflowFactor);

    // Extreme measures from start: Reff reduced to ~0.6-0.7, much fewer infected
    // With early lockdown + testing + tracing, total infected ~5-15% of no-action
    const extremeReduction = r0 > 5 ? 0.15 : r0 > 3 ? 0.10 : 0.05;
    const estimateExtreme = Math.round(noActionInfected * extremeReduction * weightedIFR);

    // Moderate measures: Reff hovers around 1, ~30-50% of no-action infections
    const moderateReduction = r0 > 5 ? 0.50 : r0 > 3 ? 0.40 : 0.30;
    const estimateModerate = Math.round(noActionInfected * moderateReduction * weightedIFR);

    return { estimateExtreme, estimateModerate, estimateNoAction };
  }, [gameScenario]);

  // Lessons learned
  const lessons = useMemo(() => {
    const result: { title: string; text: string; type: 'info' | 'warning' | 'success' }[] = [];

    // Detection gap lesson
    if (detectionRate < 50) {
      result.push({
        title: 'Skrytá epidemie',
        text: `Zachytili jste jen ${detectionRate.toFixed(0)}% skutečných nákaz. ${Math.round(undetected).toLocaleString()} infekcí zůstalo neodhaleno. Bez masivního testování a trasování řídíte krizi poslepu — opatření přicházejí pozdě, protože nevidíte skutečný rozsah šíření.`,
        type: 'warning',
      });
    } else if (detectionRate < 80) {
      result.push({
        title: 'Částečný přehled',
        text: `Zachytili jste ${detectionRate.toFixed(0)}% nákaz. Lepší detekce by umožnila rychlejší a cílenější reakci.`,
        type: 'info',
      });
    } else {
      result.push({
        title: 'Dobrý přehled o situaci',
        text: `Detekční systém zachytil ${detectionRate.toFixed(0)}% skutečných nákaz — kvalitní základ pro informovaná rozhodnutí.`,
        type: 'success',
      });
    }

    // Delay lesson
    result.push({
      title: 'Proč opatření fungují se zpožděním?',
      text: 'Mezi zavedením opatření a viditelným efektem na křivkách uplyne 1–3 kola (2–6 týdnů). Důvod: virus má inkubační dobu (lidé nakažení před opatřením ještě onemocní), testování má zpoždění, a hospitalizace/úmrtí přicházejí až týdny po nákaze. Když vidíte růst hospitalizací, skutečná vlna nákaz proběhla před 2–3 týdny. Čekání na "důkazy" v datech znamená ztrátu cenného času.',
      type: 'info',
    });

    // Hospital overflow
    if (overflowTurns > 0) {
      result.push({
        title: 'Přetížení nemocnic',
        text: `Nemocnice byly přetíženy ${overflowTurns} kol. Při přetížení dramaticky roste mortalita — pacienti, kteří by při normální péči přežili, umírají kvůli nedostatku lůžek a personálu. Každé kolo přetížení znamená stovky zbytečných úmrtí.`,
        type: 'warning',
      });
    }

    // Deaths by age group insight
    const seniorDeaths = stratumDeaths.slice(4).reduce((s, d) => s + d.deaths, 0);
    const totalStratumDeaths = stratumDeaths.reduce((s, d) => s + d.deaths, 0);
    if (totalStratumDeaths > 0 && seniorDeaths / totalStratumDeaths > 0.7) {
      result.push({
        title: 'Senioři nesou hlavní břemeno',
        text: `${Math.round(seniorDeaths / totalStratumDeaths * 100)}% všech úmrtí bylo ve skupině 65+. Cílená ochrana seniorů (prioritní vakcinace, izolace rizikových skupin) mohla výrazně snížit celkovou mortalitu i bez plošných restrikcí.`,
        type: 'info',
      });
    }

    // Counterfactual comparison
    result.push({
      title: 'Srovnání s alternativními scénáři',
      text: totalDeaths <= estimateExtreme
        ? `Výborný výsledek! Vaše řízení (${Math.round(totalDeaths).toLocaleString()} úmrtí) se blíží nebo je lepší než odhad pro razantní opatření od začátku (~${estimateExtreme.toLocaleString()}). Pro srovnání: bez opatření by zemřelo odhadem ~${estimateNoAction.toLocaleString()} lidí.`
        : totalDeaths <= estimateModerate
        ? `Solidní výsledek. Vaše řízení vedlo k ${Math.round(totalDeaths).toLocaleString()} úmrtím — to odpovídá středně silným opatřením (~${estimateModerate.toLocaleString()}). Razantní opatření od začátku mohla snížit oběti na ~${estimateExtreme.toLocaleString()}. Bez opatření: ~${estimateNoAction.toLocaleString()}.`
        : `Vaše řízení vedlo k ${Math.round(totalDeaths).toLocaleString()} úmrtím. Odhady: bez opatření ~${estimateNoAction.toLocaleString()}, střední opatření ~${estimateModerate.toLocaleString()}, razantní opatření od začátku ~${estimateExtreme.toLocaleString()}. ${totalDeaths > estimateNoAction ? 'Výsledek je horší než úplná nečinnost — přetížení nemocnic a pozdní reakce způsobily více škody než žádná opatření.' : 'Včasnější a důraznější reakce mohla zachránit tisíce životů.'}`,
      type: totalDeaths <= estimateExtreme ? 'success' : totalDeaths <= estimateModerate ? 'info' : 'warning',
    });

    // Social capital
    if (lowestCapital < 10) {
      result.push({
        title: 'Společenská krize',
        text: 'Sociální kapitál klesl téměř na nulu. Příliš tvrdá nebo příliš dlouhá opatření bez kompenzací a komunikace vedou k tomu, že je lidé přestanou dodržovat — ať jsou jakkoli potřebná. Klíčová je rovnováha mezi epidemiologickou nutností a společenskou únosností.',
        type: 'warning',
      });
    }

    // GDP
    if (finalGDP < -10) {
      result.push({
        title: 'Ekonomická devastace',
        text: `HDP kleslo o ${Math.abs(finalGDP).toFixed(1)}%. Dlouhodobé ekonomické škody mohou způsobit více utrpení než samotná epidemie — nezaměstnanost, duševní zdraví, odložená zdravotní péče. Ekonomické kompenzace (kurzarbeit, podpora podnikatelům) pomáhají zmírnit dopad restrikcí.`,
        type: 'warning',
      });
    }

    return result;
  }, [detectionRate, undetected, overflowTurns, stratumDeaths, totalDeaths, estimateExtreme, estimateModerate, estimateNoAction, lowestCapital, finalGDP]);

  // Score: penalize deaths, overflow, low social capital, GDP loss
  const score = Math.max(0, Math.round(
    1000
    - totalDeaths * 0.01
    - overflowTurns * 30
    + lowestCapital * 2
    + finalGDP * 10,
  ));

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Krizový štáb — vyhodnocení</h1>
        <p className="text-gray-500 mt-1">
          {gameScenario?.totalTurns} kol ({(gameScenario?.totalTurns ?? 24) * (gameScenario?.daysPerTurn ?? 14)} dní) simulace dokončeno
        </p>
      </div>

      {/* Score */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6 text-center">
        <div className="text-4xl font-black text-indigo-700">{score}</div>
        <div className="text-sm text-indigo-600 mt-1">Celkové skóre</div>
        <p className="text-xs text-indigo-400 mt-2">
          (Penalizace: úmrtí, přetížení nemocnic, ztráta sociálního kapitálu, ekonomické škody)
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Celkem úmrtí" value={Math.round(totalDeaths).toLocaleString()} bad={totalDeaths > 1000} />
        <StatCard label="Skutečné infekce" value={Math.round(totalTrueInfections).toLocaleString()} />
        <StatCard label="Hlášeno infekcí" value={Math.round(totalObservedInfections).toLocaleString()} />
        <StatCard label="Zachyceno nákaz" value={`${detectionRate.toFixed(0)}%`} bad={detectionRate < 50} />
        <StatCard label="Peak hospitalizace" value={Math.round(peakHosp).toLocaleString()} />
        <StatCard label="Peak ICU" value={Math.round(peakICU).toLocaleString()} />
        <StatCard label="Kola přetížení" value={String(overflowTurns)} bad={overflowTurns > 0} />
        <StatCard label="Min. soc. kapitál" value={`${Math.round(lowestCapital)}`} bad={lowestCapital < 20} />
        <StatCard label="Dopad HDP" value={`${finalGDP > 0 ? '+' : ''}${finalGDP.toFixed(1)}%`} bad={finalGDP < -5} />
        <StatCard label="Fiskál. náklady" value={`${finalFiscal.toFixed(1)} mld`} />
        <StatCard label="Důvěra veřejnosti" value={`${Math.round(trust)}%`} bad={trust < 20} />
        <StatCard
          label="Vedení krize"
          value={premierTakeoverDone ? 'Premiér převzal' : 'Hlavní hygienik'}
          bad={premierTakeoverDone}
        />
      </div>

      {/* ═══════════════════ GRAPHS ═══════════════════ */}

      {/* True vs Observed infections */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-1">Skutečný stav vs. hlášené případy</h3>
        <p className="text-[10px] text-gray-400 mb-3">
          Oblast mezi křivkami = nedetekované nákazy. Čím větší mezera, tím méně jste věděli o skutečném rozsahu epidemie.
        </p>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={turnData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="turn" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="trueInfections" stroke="#ef4444" fill="#ef4444" fillOpacity={0.15} name="Skutečné infekce" strokeWidth={2} />
            <Area type="monotone" dataKey="observedInfections" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} name="Hlášené případy" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Deaths per turn + cumulative */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-1">Úmrtí v průběhu epidemie</h3>
        <p className="text-[10px] text-gray-400 mb-3">
          Sloupce = nová úmrtí za kolo. Čára = kumulativní celkový počet.
        </p>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={deathsData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="turn" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="deaths" fill="#f87171" name="Nová úmrtí" />
            <Line yAxisId="right" type="monotone" dataKey="cumulative" stroke="#991b1b" name="Kumulativní" strokeWidth={2} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Deaths by age/risk group */}
      {stratumDeaths.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-1">Úmrtí podle věkových a rizikových skupin</h3>
          <p className="text-[10px] text-gray-400 mb-3">
            Kdo nesl největší břemeno epidemie? Cílená ochrana nejzranitelnějších skupin může dramaticky snížit celkovou mortalitu.
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stratumDeaths} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" width={180} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="deaths" name="Úmrtí" fill="#f87171">
                {stratumDeaths.map((entry, i) => (
                  <rect key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Reff over time */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-1">Reprodukční číslo (Reff)</h3>
        <p className="text-[10px] text-gray-400 mb-3">
          Skutečné vs. odhadované Reff. Pokud je Reff &gt; 1, epidemie roste. Opatření se na Reff projeví se zpožděním 1–2 kol.
        </p>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={reffData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="turn" />
            <YAxis domain={[0, 'auto']} />
            <Tooltip />
            <Legend />
            <ReferenceLine y={1} stroke="#ef4444" strokeDasharray="5 5" label="Reff = 1" />
            <Line type="monotone" dataKey="trueReff" stroke="#7c3aed" name="Skutečné Reff" strokeWidth={2} />
            <Line type="monotone" dataKey="estimatedReff" stroke="#a78bfa" strokeDasharray="6 3" name="Odhadované Reff" strokeWidth={1.5} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Hospital capacity */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-1">Nemocniční kapacity</h3>
        <p className="text-[10px] text-gray-400 mb-3">
          Křivky obsazenosti vs. přerušované čáry kapacity. Při překročení dramaticky roste mortalita.
        </p>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={hospData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="turn" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="hospitalizovani" stroke="#f97316" name="Hospitalizovaní" strokeWidth={2} />
            <Line type="monotone" dataKey="ICU" stroke="#dc2626" name="ICU" strokeWidth={2} />
            <Line type="monotone" dataKey="kapacitaH" stroke="#f97316" strokeDasharray="5 5" name="Kapacita H" strokeWidth={1} dot={false} />
            <Line type="monotone" dataKey="kapacitaICU" stroke="#dc2626" strokeDasharray="5 5" name="Kapacita ICU" strokeWidth={1} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Social capital & GDP side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Sociální kapitál</h3>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={turnData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="turn" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Area type="monotone" dataKey="socialCapital" stroke="#10b981" fill="#10b981" fillOpacity={0.2} name="Soc. kapitál" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Ekonomický dopad (HDP)</h3>
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

      {/* ═══════════════════ COUNTERFACTUAL ═══════════════════ */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Srovnání scénářů — odhad úmrtí</h3>
        <p className="text-[10px] text-gray-400 mb-3">
          Přibližné odhady na základě parametrů epidemie. Skutečný výsledek závisí na mnoha faktorech.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <CounterfactualCard
            label="Bez opatření"
            deaths={estimateNoAction}
            color="bg-red-100 text-red-800 border-red-200"
          />
          <CounterfactualCard
            label="Střední opatření"
            deaths={estimateModerate}
            color="bg-amber-100 text-amber-800 border-amber-200"
          />
          <CounterfactualCard
            label="Extrémní opatření"
            deaths={estimateExtreme}
            color="bg-green-100 text-green-800 border-green-200"
          />
          <CounterfactualCard
            label="Vaše řízení"
            deaths={Math.round(totalDeaths)}
            color="bg-indigo-100 text-indigo-800 border-indigo-200"
            highlight
          />
        </div>
      </div>

      {/* ═══════════════════ LESSONS ═══════════════════ */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700">Poučení z epidemie</h3>
        {lessons.map((lesson, i) => (
          <div
            key={i}
            className={`border rounded-lg p-4 ${
              lesson.type === 'warning' ? 'bg-amber-50 border-amber-200' :
              lesson.type === 'success' ? 'bg-green-50 border-green-200' :
              'bg-blue-50 border-blue-200'
            }`}
          >
            <h4 className={`text-xs font-bold mb-1 ${
              lesson.type === 'warning' ? 'text-amber-800' :
              lesson.type === 'success' ? 'text-green-800' :
              'text-blue-800'
            }`}>
              {lesson.title}
            </h4>
            <p className={`text-xs leading-relaxed ${
              lesson.type === 'warning' ? 'text-amber-700' :
              lesson.type === 'success' ? 'text-green-700' :
              'text-blue-700'
            }`}>
              {lesson.text}
            </p>
          </div>
        ))}
      </div>

      {/* ═══════════════════ DECISION TIMELINE ═══════════════════ */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Chronologie rozhodnutí</h3>
        <div className="space-y-2">
          {decisionTimeline.map(d => (
            <div key={d.turn} className="border-l-2 border-gray-300 pl-3 py-1">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-500 font-medium">{d.dateLabel.split(' — ')[0]}</span>
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${d.measures.length > 5 ? 'bg-red-100 text-red-700' : d.measures.length > 2 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                  {d.measures.length} opatření
                </span>
              </div>
              {d.measureNames.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {d.measureNames.map((name, i) => (
                    <span key={i} className="text-[9px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                      {name}
                    </span>
                  ))}
                </div>
              )}
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
          Hrát znovu
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

function CounterfactualCard({ label, deaths, color, highlight }: { label: string; deaths: number; color: string; highlight?: boolean }) {
  return (
    <div className={`border rounded-lg p-3 text-center ${color} ${highlight ? 'ring-2 ring-indigo-400' : ''}`}>
      <div className="text-[10px] font-medium">{label}</div>
      <div className={`text-lg font-black ${highlight ? '' : ''}`}>{deaths.toLocaleString()}</div>
      <div className="text-[9px] opacity-60">odhadovaná úmrtí</div>
    </div>
  );
}
