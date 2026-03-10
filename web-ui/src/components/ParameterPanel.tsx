import { useAppStore } from '../store/useAppStore';
import { type ScenarioConfig, type EpiConfig, type Demographics, type HealthCapacityConfig, type DelayConfig, type ReportingConfig, validateScenario, defaultDelayConfig, defaultReportingConfig } from '@tapir/core';
import { useCallback, useMemo } from 'react';

function NumberInput({
  label,
  value,
  onChange,
  min,
  max,
  step,
  error,
  disabled,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  error?: string;
  disabled?: boolean;
}) {
  return (
    <div className="mb-2">
      <label className="block text-xs font-medium text-gray-700 mb-0.5">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        min={min}
        max={max}
        step={step ?? 1}
        disabled={disabled}
        className={`w-full px-2 py-1 text-sm border rounded ${
          error ? 'border-red-400 bg-red-50' : 'border-gray-300'
        } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
        aria-invalid={!!error}
      />
      {error && <p className="text-xs text-red-600 mt-0.5">{error}</p>}
    </div>
  );
}

const PRESETS: { name: string; config: Partial<EpiConfig & Demographics> }[] = [
  {
    name: 'COVID-like',
    config: { R0: 2.5, latentPeriod: 3, infectiousPeriod: 7 },
  },
  {
    name: 'Flu-like',
    config: { R0: 1.3, latentPeriod: 2, infectiousPeriod: 5 },
  },
  {
    name: 'Measles-like',
    config: { R0: 12, latentPeriod: 10, infectiousPeriod: 8 },
  },
];

export default function ParameterPanel() {
  const { scenario, updateScenario, validationErrors, appMode, lockedParams } = useAppStore();
  const { demographics, epiConfig, healthCapacity } = scenario;

  const errorMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const e of validationErrors) {
      map[e.path] = e.message;
    }
    return map;
  }, [validationErrors]);

  const isLocked = (_path: string) => false;

  const updateDemographics = useCallback((partial: Partial<Demographics>) => {
    updateScenario({ demographics: { ...demographics, ...partial } });
  }, [demographics, updateScenario]);

  const updateEpi = useCallback((partial: Partial<EpiConfig>) => {
    updateScenario({ epiConfig: { ...epiConfig, ...partial } });
  }, [epiConfig, updateScenario]);

  const updateCapacity = useCallback((partial: Partial<HealthCapacityConfig>) => {
    updateScenario({ healthCapacity: { ...healthCapacity, ...partial } });
  }, [healthCapacity, updateScenario]);

  const delayConfig = scenario.delayConfig ?? defaultDelayConfig();
  const reportingConfig = scenario.reportingConfig ?? defaultReportingConfig();

  const updateDelay = useCallback((partial: Partial<DelayConfig>) => {
    updateScenario({ delayConfig: { ...delayConfig, ...partial } });
  }, [delayConfig, updateScenario]);

  const updateReporting = useCallback((partial: Partial<ReportingConfig>) => {
    updateScenario({ reportingConfig: { ...reportingConfig, ...partial } });
  }, [reportingConfig, updateScenario]);

  const applyPreset = (preset: typeof PRESETS[number]) => {
    updateEpi({
      R0: (preset.config as any).R0 ?? epiConfig.R0,
      latentPeriod: (preset.config as any).latentPeriod ?? epiConfig.latentPeriod,
      infectiousPeriod: (preset.config as any).infectiousPeriod ?? epiConfig.infectiousPeriod,
    });
  };

  return (
    <div className="space-y-4">
      {/* Presets */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Presets</label>
        <div className="flex gap-1 flex-wrap">
          {PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => applyPreset(p)}
              className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 border border-blue-200"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Simulation */}
      <fieldset>
        <legend className="text-xs font-semibold text-gray-600 mb-1">Simulace</legend>
        <NumberInput
          label="Dny simulace"
          value={scenario.days}
          onChange={(v) => updateScenario({ days: v })}
          min={1}
          max={3650}
          error={errorMap['days']}
        />
      </fieldset>

      {/* Demographics */}
      <fieldset>
        <legend className="text-xs font-semibold text-gray-600 mb-1">Demografie</legend>
        <NumberInput
          label="Populace (N)"
          value={demographics.totalPopulation}
          onChange={(v) => updateDemographics({ totalPopulation: v })}
          min={100}
          error={errorMap['demographics.totalPopulation']}
          disabled={isLocked('demographics.totalPopulation')}
        />
        <NumberInput
          label="Počáteční nakažení (I₀)"
          value={demographics.initialInfectious}
          onChange={(v) => updateDemographics({ initialInfectious: v })}
          min={0}
          error={errorMap['demographics.initialInfectious']}
        />

        <div className="grid grid-cols-3 gap-1">
          {['0-18', '19-64', '65+'].map((label, i) => (
            <NumberInput
              key={label}
              label={`Věk ${label} (%)`}
              value={Math.round(demographics.ageFractions[i] * 100)}
              onChange={(v) => {
                const fracs = [...demographics.ageFractions] as [number, number, number];
                fracs[i] = v / 100;
                updateDemographics({ ageFractions: fracs });
              }}
              min={0}
              max={100}
              step={1}
              error={errorMap[`demographics.ageFractions[${i}]`] || (i === 2 ? errorMap['demographics.ageFractions'] : undefined)}
            />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-1">
          {['0-18', '19-64', '65+'].map((label, i) => (
            <NumberInput
              key={label}
              label={`Risk ${label} (%)`}
              value={Math.round(demographics.riskFractions[i] * 100)}
              onChange={(v) => {
                const fracs = [...demographics.riskFractions] as [number, number, number];
                fracs[i] = v / 100;
                updateDemographics({ riskFractions: fracs });
              }}
              min={0}
              max={100}
              step={1}
            />
          ))}
        </div>
      </fieldset>

      {/* Epidemiological parameters */}
      <fieldset>
        <legend className="text-xs font-semibold text-gray-600 mb-1">Epidemiologie</legend>
        <NumberInput
          label="R₀"
          value={epiConfig.R0}
          onChange={(v) => updateEpi({ R0: v })}
          min={0.1}
          max={30}
          step={0.1}
          error={errorMap['epiConfig.R0']}
          disabled={isLocked('epiConfig.R0')}
        />
        <NumberInput
          label="Latentní perioda (dny)"
          value={epiConfig.latentPeriod}
          onChange={(v) => updateEpi({ latentPeriod: v })}
          min={0.5}
          step={0.5}
          error={errorMap['epiConfig.latentPeriod']}
        />
        <NumberInput
          label="Infekční perioda (dny)"
          value={epiConfig.infectiousPeriod}
          onChange={(v) => updateEpi({ infectiousPeriod: v })}
          min={0.5}
          step={0.5}
          error={errorMap['epiConfig.infectiousPeriod']}
        />
      </fieldset>

      {/* Health capacity */}
      <fieldset>
        <legend className="text-xs font-semibold text-gray-600 mb-1">Kapacita zdravotnictví</legend>
        <NumberInput
          label="Nemocniční lůžka"
          value={healthCapacity.hospitalBeds}
          onChange={(v) => updateCapacity({ hospitalBeds: v })}
          min={0}
        />
        <NumberInput
          label="ICU lůžka"
          value={healthCapacity.icuBeds}
          onChange={(v) => updateCapacity({ icuBeds: v })}
          min={0}
        />
        <NumberInput
          label="Excess mortality rate"
          value={healthCapacity.excessMortalityRate}
          onChange={(v) => updateCapacity({ excessMortalityRate: v })}
          min={0}
          max={1}
          step={0.05}
          error={errorMap['healthCapacity.excessMortalityRate']}
        />
      </fieldset>

      {/* Clinical delays */}
      <fieldset>
        <legend className="text-xs font-semibold text-gray-600 mb-1">Klinické zpozdeni</legend>
        <NumberInput
          label="Onset → hospitalizace (dny)"
          value={delayConfig.onsetToHospMean}
          onChange={(v) => updateDelay({ onsetToHospMean: v })}
          min={0}
          max={30}
          step={1}
        />
        <NumberInput
          label="Onset → hosp stages (k)"
          value={delayConfig.onsetToHospStages}
          onChange={(v) => updateDelay({ onsetToHospStages: Math.max(1, Math.round(v)) })}
          min={1}
          max={10}
          step={1}
        />
        <NumberInput
          label="Hospitalizace LoS (dny)"
          value={delayConfig.hospLosMean}
          onChange={(v) => updateDelay({ hospLosMean: v })}
          min={1}
          max={60}
          step={1}
        />
        <NumberInput
          label="ICU LoS (dny)"
          value={delayConfig.icuLosMean}
          onChange={(v) => updateDelay({ icuLosMean: v })}
          min={1}
          max={60}
          step={1}
        />
      </fieldset>

      {/* Reporting / Surveillance */}
      <fieldset>
        <legend className="text-xs font-semibold text-gray-600 mb-1">Surveillance</legend>
        <div className="mb-2">
          <label className="block text-xs font-medium text-gray-700 mb-0.5">
            Detekce infekcí: {Math.round(reportingConfig.detectionRate * 100)}%
          </label>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(reportingConfig.detectionRate * 100)}
            onChange={(e) => updateReporting({ detectionRate: parseInt(e.target.value) / 100 })}
            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-[10px] text-gray-400">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
        <NumberInput
          label="Zpozdeni hlaseni (dny)"
          value={reportingConfig.reportingDelayMean}
          onChange={(v) => updateReporting({ reportingDelayMean: v })}
          min={0}
          max={14}
          step={1}
        />
      </fieldset>
    </div>
  );
}
