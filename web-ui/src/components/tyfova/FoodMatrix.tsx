import React, { useMemo } from 'react';
import { household } from '../../data/tyfova/household';

export const FoodMatrix: React.FC = () => {
  const highlightFood = 'broskvová zmrzlina';

  // Derive unique food items from household data
  const foodItems = useMemo(() => {
    const allFoods = new Set<string>();
    for (const member of household) {
      for (const food of member.foodConsumed) {
        allFoods.add(food);
      }
    }
    return Array.from(allFoods);
  }, []);

  return (
    <div>
      <h4 className="text-lg font-semibold text-gray-900 mb-3">
        Matice konzumace potravin
      </h4>
      <p className="text-sm text-gray-600 mb-3">
        Tabulka ukazuje, které potraviny jedli jednotliví členové domácnosti.
        Hledejte potravinu, kterou jedli <strong>všichni nemocní</strong> a{' '}
        <strong>žádný zdravý</strong>.
      </p>

      <div className="overflow-x-auto">
        <table className="text-xs border-collapse w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2 text-left min-w-[140px]">
                Jméno
              </th>
              <th className="border border-gray-300 p-1.5 text-center w-16">
                Stav
              </th>
              {foodItems.map((food) => (
                <th
                  key={food}
                  className={`border border-gray-300 p-1.5 text-center whitespace-nowrap ${
                    food === highlightFood
                      ? 'bg-amber-200 font-bold'
                      : ''
                  }`}
                >
                  {food}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {household.map((member) => {
              const isMary = member.name === 'Mary Mallon';
              return (
                <tr
                  key={member.name}
                  className={
                    isMary
                      ? 'bg-yellow-50'
                      : member.infected
                        ? 'bg-red-50'
                        : 'bg-green-50'
                  }
                >
                  <td className="border border-gray-300 p-2 font-medium">
                    {member.name}
                    {isMary && (
                      <span className="ml-1 text-yellow-700">{'\u2B50'}</span>
                    )}
                  </td>
                  <td
                    className={`border border-gray-300 p-1.5 text-center font-semibold ${
                      member.infected ? 'text-red-600' : 'text-green-600'
                    }`}
                  >
                    {isMary ? (
                      <span className="text-yellow-700">Zdravá*</span>
                    ) : member.infected ? (
                      'Nemocný/á'
                    ) : (
                      'Zdravý/á'
                    )}
                  </td>
                  {foodItems.map((food) => {
                    const consumed = member.foodConsumed.includes(food);
                    const isHighlight = food === highlightFood;
                    return (
                      <td
                        key={food}
                        className={`border border-gray-300 p-1.5 text-center ${
                          isHighlight ? 'bg-amber-50' : ''
                        }`}
                      >
                        {consumed ? (
                          <span
                            className={
                              isHighlight
                                ? 'text-amber-700 font-bold'
                                : 'text-gray-600'
                            }
                          >
                            {'\u2713'}
                          </span>
                        ) : (
                          <span className="text-gray-300">{'\u2014'}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 bg-red-100 border border-red-200 inline-block rounded" />{' '}
          Nemocný/á
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 bg-green-100 border border-green-200 inline-block rounded" />{' '}
          Zdravý/á
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 bg-yellow-100 border border-yellow-200 inline-block rounded" />{' '}
          Mary Mallon (kuchařka)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 bg-amber-200 border border-amber-300 inline-block rounded" />{' '}
          Klíčová potravina
        </span>
      </div>

      <p className="mt-2 text-xs text-gray-500 italic">
        * Mary Mallon je kuchařka, která připravila broskvovou zmrzlinu. Sama ji
        nejedla, ale kontaminovala ji bakteriemi ze svých rukou.
      </p>
    </div>
  );
};
