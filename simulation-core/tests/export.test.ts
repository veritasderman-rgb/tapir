import { describe, it, expect } from 'vitest';
import { exportCSV, exportJSON, getWatermarkText } from '../src/export-utils';
import { runSimulation } from '../src/stochastic';
import { defaultScenario } from '../src/scenario-schema';
import { VERSION } from '../src/index';

describe('exportCSV', () => {
  it('contains disclaimer', () => {
    const scenario = defaultScenario();
    scenario.days = 10;
    const result = runSimulation(scenario);
    const csv = exportCSV(result);
    expect(csv).toContain('DISCLAIMER');
    expect(csv).toContain('klinická predikce');
  });

  it('contains metadata headers', () => {
    const scenario = defaultScenario();
    scenario.days = 10;
    const result = runSimulation(scenario);
    const csv = exportCSV(result);
    expect(csv).toContain('# Scénář:');
    expect(csv).toContain('# R0:');
    expect(csv).toContain('# Seed:');
    expect(csv).toContain(`# App version: ${VERSION}`);
  });

  it('has correct number of data rows', () => {
    const scenario = defaultScenario();
    scenario.days = 10;
    const result = runSimulation(scenario);
    const csv = exportCSV(result);
    const dataLines = csv.split('\n').filter(l => !l.startsWith('#') && l.trim());
    // 1 header + 10 data rows
    expect(dataLines.length).toBe(11);
  });
});

describe('exportJSON', () => {
  it('contains schema version', () => {
    const scenario = defaultScenario();
    scenario.days = 10;
    const result = runSimulation(scenario);
    const json = exportJSON(result);
    const parsed = JSON.parse(json);
    expect(parsed.schemaVersion).toBeDefined();
  });

  it('contains disclaimer', () => {
    const scenario = defaultScenario();
    scenario.days = 10;
    const result = runSimulation(scenario);
    const json = exportJSON(result);
    const parsed = JSON.parse(json);
    expect(parsed.disclaimer).toContain('edukační');
  });
});

describe('getWatermarkText', () => {
  it('contains SIMULACE', () => {
    const scenario = defaultScenario();
    scenario.days = 10;
    const result = runSimulation(scenario);
    const wm = getWatermarkText(result);
    expect(wm.some(l => l.includes('SIMULACE'))).toBe(true);
  });
});
