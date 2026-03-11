import React from 'react';
import { useTyfovaStore } from '../../store/tyfovaStore';
import { getTotalQuestionCount } from '../../data/tyfova/questions';

export const TyfovaResults: React.FC = () => {
  const correctAnswers = useTyfovaStore((s) => s.correctAnswers);
  const startTime = useTyfovaStore((s) => s.startTime);
  const endTime = useTyfovaStore((s) => s.endTime);
  const resetGame = useTyfovaStore((s) => s.resetGame);

  const totalQuestions = getTotalQuestionCount();
  const percentage = Math.round((correctAnswers / totalQuestions) * 100);

  const elapsedMs = (endTime ?? Date.now()) - startTime;
  const minutes = Math.floor(elapsedMs / 60000);
  const seconds = Math.floor((elapsedMs % 60000) / 1000);

  let scoreColor = 'text-red-600';
  let scoreLabel = 'Je třeba doplnit znalosti';
  if (percentage >= 80) {
    scoreColor = 'text-green-600';
    scoreLabel = 'Výborný výsledek!';
  } else if (percentage >= 60) {
    scoreColor = 'text-yellow-600';
    scoreLabel = 'Dobrý výsledek';
  } else if (percentage >= 40) {
    scoreColor = 'text-orange-600';
    scoreLabel = 'Průměrný výsledek';
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Vyšetřování uzavřeno
          </h1>
          <p className="text-gray-500">Záhada z Oyster Bay — výsledky</p>
        </div>

        {/* Score */}
        <div className="text-center py-6 bg-gray-50 rounded-xl">
          <p className={`text-5xl font-bold ${scoreColor}`}>
            {correctAnswers}/{totalQuestions}
          </p>
          <p className="text-lg text-gray-600 mt-1">správných odpovědí ({percentage} %)</p>
          <p className={`text-sm font-semibold mt-2 ${scoreColor}`}>{scoreLabel}</p>
          <p className="text-sm text-gray-400 mt-2">
            Čas vyšetřování: {minutes} min {seconds} s
          </p>
        </div>

        {/* Investigation summary */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Shrnutí vyšetřování
          </h3>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-gray-800 space-y-2">
            <p>
              <strong>Zjištění:</strong> Mary Mallon byla asymptomatickou
              nosičkou břišního tyfu. Přestože sama nikdy nejevila příznaky,
              šířila bakterie Salmonella typhi přes jídlo, které připravovala —
              zejména přes tepelně nezpracované pokrmy jako broskvový dezert.
            </p>
            <p>
              <strong>Důkazy:</strong> Epidemiologická analýza ukázala, že
              všechny domácnosti, kde Mary pracovala jako kuchařka, zasáhla
              nákaza břišním tyfem. Rozbory vody a ostatních zdrojů byly
              negativní.
            </p>
          </div>

          <h3 className="text-lg font-semibold text-gray-900">
            Klíčové poznatky
          </h3>

          <ul className="space-y-3">
            <li className="flex gap-3 items-start">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-bold">
                1
              </span>
              <div>
                <p className="font-semibold text-gray-800">Asymptomatičtí nosiči</p>
                <p className="text-sm text-gray-600">
                  Člověk může být infikován a šířit nemoc bez jakýchkoli
                  příznaků. To je klíčový problém v epidemiologii.
                </p>
              </div>
            </li>
            <li className="flex gap-3 items-start">
              <span className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-sm font-bold">
                2
              </span>
              <div>
                <p className="font-semibold text-gray-800">Bezpečnost potravin</p>
                <p className="text-sm text-gray-600">
                  Hygiena při přípravě jídla je zásadní. Tepelně nezpracované
                  pokrmy jsou zvláště rizikové.
                </p>
              </div>
            </li>
            <li className="flex gap-3 items-start">
              <span className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-sm font-bold">
                3
              </span>
              <div>
                <p className="font-semibold text-gray-800">
                  Veřejné zdraví vs. práva jednotlivce
                </p>
                <p className="text-sm text-gray-600">
                  Jak daleko může stát jít v omezení svobody jednotlivce, aby
                  ochránil veřejné zdraví? Tato otázka je aktuální dodnes.
                </p>
              </div>
            </li>
          </ul>

          {/* Historical outcome */}
          <h3 className="text-lg font-semibold text-gray-900 mt-4">
            Skutečný osud Mary Mallon
          </h3>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-800 space-y-2">
            <p>
              Mary Mallon byla v roce <strong>1907</strong> násilně umístěna do
              karantény na ostrově North Brother Island v New Yorku.
            </p>
            <p>
              V roce <strong>1910</strong> byla propuštěna pod podmínkou, že
              nebude pracovat s jídlem. Mary si však změnila jméno na{' '}
              <strong>Mary Brown</strong> a vrátila se k vaření.
            </p>
            <p>
              V roce <strong>1915</strong> způsobila epidemii v porodnici Sloane
              Hospital (25 nakažených, 2 úmrtí). Byla znovu zadržena a umístěna
              do <strong>doživotní karantény</strong>.
            </p>
            <p>
              Zemřela v roce <strong>1938</strong> ve věku 69 let. Pitva
              potvrdila živé kultury Salmonella typhi v jejím žlučníku.
            </p>
            <p>
              Celkem je s Mary Mallon spojováno přibližně{' '}
              <strong>51 případů</strong> břišního tyfu a{' '}
              <strong>3 úmrtí</strong>.
            </p>
          </div>
        </div>

        <div className="text-center pt-4">
          <button
            onClick={resetGame}
            className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Zpět na úvodní obrazovku
          </button>
        </div>
      </div>
    </div>
  );
};
