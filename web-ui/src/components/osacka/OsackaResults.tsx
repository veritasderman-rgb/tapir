import React from 'react';
import { useOsackaStore } from '../../store/osackaStore';
import { contacts } from '../../data/osacka/contacts';
import { calculateScore } from '../../data/osacka/scoring';

const OsackaResults: React.FC = () => {
  const identifiedInfected = useOsackaStore((s) => s.identifiedInfected);
  const identifiedSuperspreaders = useOsackaStore((s) => s.identifiedSuperspreaders);
  const epiCurveData = useOsackaStore((s) => s.epiCurveData);
  const budget = useOsackaStore((s) => s.budget);
  const maxBudget = useOsackaStore((s) => s.maxBudget);
  const startTime = useOsackaStore((s) => s.startTime);
  const endTime = useOsackaStore((s) => s.endTime);
  const resetGame = useOsackaStore((s) => s.resetGame);

  const score = calculateScore(
    identifiedInfected,
    identifiedSuperspreaders,
    identifiedInfected.includes('homer') ? 'homer' : null,
    budget,
  );

  const actualInfected = contacts.filter((c) => c.infected);

  // Categorize player's identifications
  const correctIds = identifiedInfected.filter((id) => {
    const c = contacts.find((ct) => ct.id === id);
    return c?.infected;
  });
  const missedIds = actualInfected
    .filter((c) => !identifiedInfected.includes(c.id))
    .map((c) => c.id);
  const falsePositiveIds = identifiedInfected.filter((id) => {
    const c = contacts.find((ct) => ct.id === id);
    return c && !c.infected;
  });

  const durationMin =
    startTime && endTime
      ? Math.round((endTime - startTime) / 60000)
      : null;

  const getContactName = (id: string) =>
    contacts.find((c) => c.id === id)?.name ?? id;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 text-center">
        Výsledky vyšetřování
      </h1>

      {durationMin !== null && (
        <p className="text-center text-gray-500 text-sm">
          Doba vyšetřování: {durationMin} min
        </p>
      )}

      {/* Overall grade */}
      <div className="text-center">
        <span className="text-6xl font-black">{score.grade}</span>
        <p className="text-sm text-gray-500 mt-1">{score.percentage} % ({score.totalScore} / {score.maxScore} bodů)</p>
      </div>

      {/* Score breakdown */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Bodové hodnocení</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Správně identifikovaní nakažení ({score.correctInfectedCount})</span>
            <span className="font-bold text-green-600">
              +{score.correctInfectedPoints}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Falešně pozitivní ({score.falsePositiveCount})</span>
            <span className="font-bold text-orange-600">
              {score.falsePositivePenalty}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Neodhalení nakažení ({score.missedInfectedCount})</span>
            <span className="font-bold text-red-600">
              −{score.missedInfectedCount * 0}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Superspreader události ({score.superspreaderCount})</span>
            <span className="font-bold text-purple-600">
              +{score.superspreaderPoints}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Pacient nula {score.patientZeroCorrect ? '✓' : '✗'}</span>
            <span className="font-bold text-blue-600">
              +{score.patientZeroPoints}
            </span>
          </div>
          <div className="flex justify-between">
            <span>
              Bonus za zbývající rozpočet ({budget}/{maxBudget})
            </span>
            <span className="font-bold text-green-600">
              +{score.budgetBonus}
            </span>
          </div>
          <hr className="my-2" />
          <div className="flex justify-between text-lg font-bold">
            <span>Celkové skóre</span>
            <span>{score.totalScore}</span>
          </div>
        </div>
      </div>

      {/* Comparison: player vs actual */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">
          Porovnání s realitou
        </h2>

        <h3 className="text-sm font-bold text-green-700 mb-2">
          Správně identifikovaní ({correctIds.length})
        </h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {correctIds.length === 0 ? (
            <span className="text-sm text-gray-400">Žádní</span>
          ) : (
            correctIds.map((id) => (
              <span
                key={id}
                className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium"
              >
                {getContactName(id)}
              </span>
            ))
          )}
        </div>

        <h3 className="text-sm font-bold text-red-700 mb-2">
          Neodhalení nakažení ({missedIds.length})
        </h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {missedIds.length === 0 ? (
            <span className="text-sm text-gray-400">Žádní</span>
          ) : (
            missedIds.map((id) => (
              <span
                key={id}
                className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium"
              >
                {getContactName(id)}
              </span>
            ))
          )}
        </div>

        <h3 className="text-sm font-bold text-orange-700 mb-2">
          Falešně pozitivní ({falsePositiveIds.length})
        </h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {falsePositiveIds.length === 0 ? (
            <span className="text-sm text-gray-400">Žádní</span>
          ) : (
            falsePositiveIds.map((id) => (
              <span
                key={id}
                className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium"
              >
                {getContactName(id)}
              </span>
            ))
          )}
        </div>
      </div>

      {/* Epi curve comparison */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">
          Epi křivka — porovnání
        </h2>
        <div className="grid grid-cols-7 gap-1 text-xs">
          {epiCurveData.map((entry) => {
            const actualCases = actualInfected.filter(
              (c) => c.symptomsDay === entry.day
            );
            const playerCases = entry.contactIds;
            const hasActual = actualCases.length > 0;
            const hasPlayer = playerCases.length > 0;

            return (
              <div
                key={entry.day}
                className={`p-2 rounded text-center border ${
                  hasActual && hasPlayer
                    ? 'border-green-300 bg-green-50'
                    : hasActual
                      ? 'border-red-300 bg-red-50'
                      : hasPlayer
                        ? 'border-orange-300 bg-orange-50'
                        : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="font-bold">{entry.day + 1}.11.</div>
                {hasPlayer && (
                  <div className="text-blue-600">Vy: {playerCases.length}</div>
                )}
                {hasActual && (
                  <div className="text-gray-600">
                    Real: {actualCases.length}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-2 flex gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-green-100 border border-green-300 rounded inline-block" />{' '}
            Shoda
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-red-100 border border-red-300 rounded inline-block" />{' '}
            Propásnuto
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-orange-100 border border-orange-300 rounded inline-block" />{' '}
            Navíc
          </span>
        </div>
      </div>

      {/* Infection chain narrative */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">
          Skutečný řetězec nákazy
        </h2>
        <div className="space-y-2 text-sm text-gray-700">
          {actualInfected
            .sort((a, b) => (a.infectionDay ?? 0) - (b.infectionDay ?? 0))
            .map((c) => (
              <div key={c.id} className="flex items-start gap-2">
                <span className="shrink-0 w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xs font-bold">
                  {c.infectionDay ?? '?'}
                </span>
                <div>
                  <span className="font-medium">{c.name}</span>
                  {c.infectionSource && (
                    <span className="text-gray-500"> (zdroj: {c.infectionSource})</span>
                  )}
                  {c.symptomsDay != null && (
                    <span className="text-gray-500">
                      {' '}
                      — příznaky den {c.symptomsDay}
                    </span>
                  )}
                  {c.isSuperspreaderEvent && (
                    <span className="text-purple-600 font-medium">
                      {' '}
                      [SUPERSPREADER: {c.superspreaderName}]
                    </span>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Reset button */}
      <div className="text-center">
        <button
          onClick={resetGame}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
        >
          Zpět na úvodní obrazovku
        </button>
      </div>
    </div>
  );
};

export default OsackaResults;
