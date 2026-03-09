import { useAppStore } from '../store/useAppStore';
import { defaultScenario } from '@tapir/core';

export default function AssumptionsInspector() {
  const { scenario, result } = useAppStore();
  const defaults = defaultScenario();

  const assumptions: { label: string; value: string; source: 'preset' | 'user' | 'hidden' }[] = [];

  // Compare with defaults to determine source
  const isDefault = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

  assumptions.push({
    label: 'R₀',
    value: String(scenario.epiConfig.R0),
    source: scenario.epiConfig.R0 === defaults.epiConfig.R0 ? 'preset' : 'user',
  });

  if (result) {
    assumptions.push({
      label: 'Implied R₀ (NGM)',
      value: result.impliedR0.toFixed(3),
      source: 'preset',
    });
    assumptions.push({
      label: 'Kalibrovaná β',
      value: result.calibratedBeta.toFixed(5),
      source: 'preset',
    });
  }

  assumptions.push({
    label: 'Latentní perioda',
    value: `${scenario.epiConfig.latentPeriod} dní`,
    source: scenario.epiConfig.latentPeriod === defaults.epiConfig.latentPeriod ? 'preset' : 'user',
  });
  assumptions.push({
    label: 'Infekční perioda',
    value: `${scenario.epiConfig.infectiousPeriod} dní`,
    source: scenario.epiConfig.infectiousPeriod === defaults.epiConfig.infectiousPeriod ? 'preset' : 'user',
  });
  assumptions.push({
    label: 'Populace',
    value: scenario.demographics.totalPopulation.toLocaleString(),
    source: scenario.demographics.totalPopulation === defaults.demographics.totalPopulation ? 'preset' : 'user',
  });
  assumptions.push({
    label: 'Počet NPIs',
    value: String(scenario.npis.length),
    source: scenario.npis.length > 0 ? 'user' : 'preset',
  });
  assumptions.push({
    label: 'Vakcinace',
    value: scenario.vaccination.enabled ? 'Aktivní' : 'Neaktivní',
    source: scenario.vaccination.enabled !== defaults.vaccination.enabled ? 'user' : 'preset',
  });
  assumptions.push({
    label: 'Počet variant',
    value: String(scenario.variants.length),
    source: scenario.variants.length > 0 ? 'user' : 'preset',
  });
  assumptions.push({
    label: 'Režim',
    value: scenario.stochastic.mode,
    source: scenario.stochastic.mode === defaults.stochastic.mode ? 'preset' : 'user',
  });

  const sourceColors = {
    preset: 'bg-gray-100 text-gray-600',
    user: 'bg-blue-100 text-blue-700',
    hidden: 'bg-red-100 text-red-700',
  };

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold text-gray-600">Assumptions Inspector</h3>
      <div className="space-y-1">
        {assumptions.map((a, i) => (
          <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-gray-100">
            <span className="text-gray-700">{a.label}</span>
            <div className="flex items-center gap-1">
              <span className="font-mono">{a.value}</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] ${sourceColors[a.source]}`}>
                {a.source}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
