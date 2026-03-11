import React, { useState } from 'react';
import { household } from '../../data/tyfova/household';

export const HouseholdTable: React.FC = () => {
  const [guesses, setGuesses] = useState<Record<string, boolean>>({});
  const [revealed, setRevealed] = useState(false);

  const toggleGuess = (name: string) => {
    if (revealed) return;
    setGuesses((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const handleReveal = () => {
    setRevealed(true);
  };

  return (
    <div>
      <h4 className="text-lg font-semibold text-gray-900 mb-3">
        Přehled členů domácnosti
      </h4>

      {!revealed && (
        <p className="text-sm text-gray-600 mb-3">
          Na základě výpovědí označte, kdo podle vás onemocněl. Poté klikněte
          na &quot;Ověřit&quot; pro zobrazení skutečného stavu.
        </p>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2 text-left">Jméno</th>
              <th className="border border-gray-300 p-2 text-left">Role</th>
              <th className="border border-gray-300 p-2 text-center w-28">
                Onemocněl/a?
              </th>
              {revealed && (
                <th className="border border-gray-300 p-2 text-left">
                  Klíčový důkaz
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {household.map((member) => {
              const guessedInfected = guesses[member.name] ?? false;
              const isMary = member.name === 'Mary Mallon';

              let rowClass = '';
              if (revealed) {
                if (isMary) {
                  rowClass = 'bg-yellow-100 border-yellow-400';
                } else if (member.infected) {
                  rowClass = 'bg-red-50';
                } else {
                  rowClass = 'bg-green-50';
                }
              }

              return (
                <tr key={member.name} className={rowClass}>
                  <td className="border border-gray-300 p-2 font-medium">
                    {member.name}
                    {revealed && isMary && (
                      <span className="ml-2 text-xs bg-yellow-300 text-yellow-900 px-1.5 py-0.5 rounded font-semibold">
                        KLÍČOVÁ OSOBA
                      </span>
                    )}
                  </td>
                  <td className="border border-gray-300 p-2">{member.role}</td>
                  <td className="border border-gray-300 p-2 text-center">
                    {revealed ? (
                      <span
                        className={`font-semibold ${
                          member.infected ? 'text-red-600' : 'text-green-600'
                        }`}
                      >
                        {member.infected ? 'Ano' : 'Ne'}
                        {guessedInfected !== member.infected && (
                          <span className="ml-1 text-xs text-gray-500">
                            (váš tip: {guessedInfected ? 'Ano' : 'Ne'})
                          </span>
                        )}
                      </span>
                    ) : (
                      <input
                        type="checkbox"
                        checked={guessedInfected}
                        onChange={() => toggleGuess(member.name)}
                        className="w-4 h-4 cursor-pointer"
                      />
                    )}
                  </td>
                  {revealed && (
                    <td className="border border-gray-300 p-2 text-xs text-gray-600">
                      {member.clues.join('; ')}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {!revealed && (
        <button
          onClick={handleReveal}
          className="mt-3 px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors"
        >
          Ověřit
        </button>
      )}

      {revealed && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-300 rounded-lg text-sm">
          <p className="font-semibold text-yellow-900 mb-1">
            Klíčové zjištění:
          </p>
          <p className="text-yellow-800">
            Mary Mallon je kuchařka, která připravovala veškerá jídla pro
            domácnost. Přestože jedla stejná jídla jako ostatní, sama
            neonemocněla. Navíc z domácnosti odešla krátce po propuknutí nemoci.
          </p>
        </div>
      )}
    </div>
  );
};
