import { encodeGameScenario } from './simulation-core/src/game-scenario';
import { defaultScenario } from './simulation-core/src/scenario-schema';
import { MEASURE_CATALOG } from './simulation-core/src/measure-catalog';

const gs = {
  baseScenario: defaultScenario(),
  totalTurns: 12,
  daysPerTurn: 14,
  hiddenEvents: [],
  socialCapital: { initial: 100, recoveryRate: 0.5, collapseThreshold: 20 },
  availableMeasureIds: MEASURE_CATALOG.map(m => m.id),
  vaccinationLocked: false,
};

console.log(encodeGameScenario(gs as any));
