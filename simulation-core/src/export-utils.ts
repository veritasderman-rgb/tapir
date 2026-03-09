import { type SimulationResult, type ScenarioConfig, VERSION } from './index';
import { CURRENT_SCHEMA_VERSION } from './scenario-schema';

const DISCLAIMER = 'DISCLAIMER: Toto je edukační simulátor. Není to klinická predikce ani doporučení pro reálná rozhodnutí.';

/**
 * Generate CSV export with metadata header.
 */
export function exportCSV(result: SimulationResult): string {
  const lines: string[] = [];

  // Metadata header
  lines.push(`# Nedovařený tapír — Export`);
  lines.push(`# ${DISCLAIMER}`);
  lines.push(`# Scénář: ${result.scenario.name}`);
  lines.push(`# R0: ${result.scenario.epiConfig.R0}`);
  lines.push(`# Implied R0: ${result.impliedR0.toFixed(4)}`);
  lines.push(`# Beta: ${result.calibratedBeta.toFixed(6)}`);
  lines.push(`# Seed: ${result.scenario.stochastic.seed}`);
  lines.push(`# Mode: ${result.scenario.stochastic.mode}`);
  lines.push(`# Population: ${result.scenario.demographics.totalPopulation}`);
  lines.push(`# Days: ${result.scenario.days}`);
  lines.push(`# Schema version: ${result.scenario.schemaVersion}`);
  lines.push(`# App version: ${VERSION}`);
  lines.push(`# Timestamp: ${result.timestamp}`);
  lines.push(`#`);

  // Column headers
  lines.push('day,Reff,newInfections,newHospitalizations,newICU,newDeaths,excessDeaths,hospitalOverflow,icuOverflow');

  // Data rows
  for (const m of result.primaryRun.metrics) {
    lines.push([
      m.day,
      m.Reff.toFixed(4),
      m.newInfections.toFixed(2),
      m.newHospitalizations.toFixed(2),
      m.newICU.toFixed(2),
      m.newDeaths.toFixed(4),
      m.excessDeaths.toFixed(4),
      m.hospitalOverflow ? 1 : 0,
      m.icuOverflow ? 1 : 0,
    ].join(','));
  }

  return lines.join('\n');
}

/**
 * Generate JSON export with full scenario, results, and metadata.
 */
export function exportJSON(result: SimulationResult): string {
  return JSON.stringify({
    disclaimer: DISCLAIMER,
    appVersion: VERSION,
    schemaVersion: CURRENT_SCHEMA_VERSION,
    timestamp: result.timestamp,
    scenario: result.scenario,
    impliedR0: result.impliedR0,
    calibratedBeta: result.calibratedBeta,
    metrics: result.primaryRun.metrics,
    quantiles: result.quantiles,
  }, null, 2);
}

/**
 * Generate watermark text for PNG export.
 */
export function getWatermarkText(result: SimulationResult): string[] {
  return [
    `SIMULACE — ${result.scenario.name}`,
    `R0=${result.scenario.epiConfig.R0} | Seed=${result.scenario.stochastic.seed}`,
    `${result.timestamp}`,
    `v${VERSION}`,
    DISCLAIMER,
  ];
}
