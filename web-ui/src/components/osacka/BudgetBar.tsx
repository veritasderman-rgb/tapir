import React from 'react';
import { useOsackaStore } from '../../store/osackaStore';

const BudgetBar: React.FC = () => {
  const budget = useOsackaStore((s) => s.budget);
  const maxBudget = useOsackaStore((s) => s.maxBudget);

  const pct = (budget / maxBudget) * 100;
  const isLow = pct < 20;

  let barColor = 'bg-green-500';
  if (pct < 50) barColor = 'bg-yellow-500';
  if (pct < 20) barColor = 'bg-red-500';

  return (
    <div className="flex items-center gap-4 px-4 py-2 bg-white border-b border-gray-200">
      <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
        Zbyvajici rozpocet:
      </span>
      <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden max-w-md">
        <div
          className={`h-full rounded-full transition-all duration-300 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span
        className={`text-sm font-bold whitespace-nowrap ${isLow ? 'text-red-600' : 'text-gray-700'}`}
      >
        {budget} / {maxBudget} bodu
      </span>
      {isLow && (
        <span className="text-xs text-red-500 font-medium animate-pulse">
          Nizky rozpocet!
        </span>
      )}
    </div>
  );
};

export default BudgetBar;
