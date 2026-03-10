import { useGameStore } from '../../store/gameStore';

export default function ICUTracker() {
  const { turnHistory, gameScenario, checkpoint } = useGameStore();

  if (!gameScenario || !checkpoint) return null;

  const currentPopulation = turnHistory.length > 0
    ? turnHistory[turnHistory.length - 1].states[turnHistory[turnHistory.length - 1].states.length - 1]
    : checkpoint.populationState;

  const icuOccupancy = currentPopulation.strata.reduce((s, st) => s + st.ICU, 0);
  const icuCapacity = gameScenario.baseScenario.healthCapacity.icuBeds;

  const percentage = Math.min(100, (icuOccupancy / Math.max(1, icuCapacity)) * 100);
  const isOverloaded = icuOccupancy > icuCapacity;

  const barColor = isOverloaded ? 'bg-red-600' : percentage > 80 ? 'bg-orange-500' : 'bg-blue-600';

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm mb-4 icu-tracker-main">
      <div className="flex justify-between items-end mb-2">
        <div>
           <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block leading-none">Obsazenost JIP</span>
           <span className={`text-lg font-black leading-tight ${isOverloaded ? 'text-red-600' : 'text-gray-900'}`}>
              {Math.round(icuOccupancy).toLocaleString()} <small className="text-gray-400 font-bold text-xs uppercase">pacientů</small>
           </span>
        </div>
        <div className="text-right">
           <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block leading-none text-right">Kapacita</span>
           <span className="text-sm font-black text-gray-700">{icuCapacity.toLocaleString()}</span>
        </div>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden border border-gray-50">
        <div
          className={`h-full transition-all duration-1000 ${barColor} ${isOverloaded ? 'animate-pulse' : ''}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {isOverloaded && (
        <div className="text-[10px] text-red-600 font-black mt-2 flex items-center gap-2">
          <span className="animate-ping inline-flex h-2 w-2 rounded-full bg-red-400 opacity-75"></span>
          SYSTÉM PŘETÍŽEN — PROBÍHÁ TRIÁŽ PACIENTŮ
        </div>
      )}
    </div>
  );
}
