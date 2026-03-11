import React, { useMemo } from 'react';
import { household } from '../../data/tyfova/household';

export const FoodMatrix: React.FC = () => {
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
        Porovnejte stravovací návyky a hledejte <strong>společný vzorec</strong>{' '}
        — existuje potravina, která by mohla vysvětlit, proč někteří onemocněli
        a jiní ne?
      </p>

      <div className="overflow-x-auto">
        <table className="text-xs border-collapse w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2 text-left min-w-[140px]">
                Jméno
              </th>
              <th className="border border-gray-300 p-1.5 text-left">
                Role
              </th>
              {foodItems.map((food) => (
                <th
                  key={food}
                  className="border border-gray-300 p-1.5 text-center whitespace-nowrap"
                >
                  {food}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {household.map((member) => (
              <tr key={member.name} className="hover:bg-gray-50">
                <td className="border border-gray-300 p-2 font-medium">
                  {member.name}
                </td>
                <td className="border border-gray-300 p-1.5 text-xs text-gray-500">
                  {member.role}
                </td>
                {foodItems.map((food) => {
                  const consumed = member.foodConsumed.includes(food);
                  return (
                    <td
                      key={food}
                      className="border border-gray-300 p-1.5 text-center"
                    >
                      {consumed ? (
                        <span className="text-gray-700">{'\u2713'}</span>
                      ) : (
                        <span className="text-gray-300">{'\u2014'}</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-gray-500 italic">
        Tip: Porovnejte tuto tabulku s výpověďmi členů domácnosti. Kdo jedl
        kterou potravinu a kdo onemocněl?
      </p>
    </div>
  );
};
