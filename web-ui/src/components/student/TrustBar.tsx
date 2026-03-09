import { useGameStore } from '../../store/gameStore';

export default function TrustBar() {
  const {
    trust,
    crisisLeader,
    governmentDownRounds,
    oppositionBriefings,
    mediaSupport,
    currentTurn,
    doOppositionBriefing,
    doMediaSupport,
    gamePhase,
  } = useGameStore();

  const isFinished = gamePhase === 'finished';
  const isGovDown = governmentDownRounds > 0;

  // Limit actions: opposition briefing once per 3 turns, media once per 2 turns
  const canDoOpposition = !isFinished && !isGovDown && (currentTurn - oppositionBriefings * 3 >= 0);
  const canDoMedia = !isFinished && !isGovDown && (currentTurn - mediaSupport * 2 >= 0);

  return (
    <div className="space-y-2">
      {/* Trust gauge */}
      <div className="bg-white border border-gray-200 rounded-lg p-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold text-gray-600">Důvěra veřejnosti</span>
          <span className={`text-sm font-bold ${
            trust < 15 ? 'text-red-600' : trust < 35 ? 'text-amber-600' : 'text-green-600'
          }`}>
            {Math.round(trust)}%
          </span>
        </div>
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden" role="progressbar" aria-valuenow={trust} aria-valuemin={0} aria-valuemax={100}>
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              trust < 15 ? 'bg-red-500' : trust < 35 ? 'bg-amber-500' : 'bg-green-500'
            }`}
            style={{ width: `${trust}%` }}
          />
        </div>

        {/* Leader info */}
        <div className="mt-2 flex items-center gap-1.5">
          <span className="text-[10px] text-gray-500">Vedení:</span>
          <span className={`text-[10px] font-bold ${crisisLeader === 'premier' ? 'text-purple-700' : 'text-blue-700'}`}>
            {crisisLeader === 'hygienik' ? '🏥 Hlavní hygienik' : '🏛️ Premiér (Krizový štáb)'}
          </span>
        </div>

        {/* Government down warning */}
        {isGovDown && (
          <div className="mt-2 bg-red-100 border border-red-300 rounded p-1.5">
            <p className="text-[10px] text-red-800 font-bold">
              ⚠️ VLÁDA PADLA — opatření nefungují ({governmentDownRounds} kol)
            </p>
          </div>
        )}

        {trust < 15 && !isGovDown && (
          <p className="text-[10px] text-red-600 mt-1 font-medium">
            Kriticky nízká důvěra! Hrozí pád vlády!
          </p>
        )}
      </div>

      {/* Trust-building actions */}
      {!isFinished && !isGovDown && (
        <div className="bg-white border border-gray-200 rounded-lg p-2">
          <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
            Budování důvěry
          </h3>
          <div className="space-y-1">
            <button
              onClick={doOppositionBriefing}
              disabled={!canDoOpposition}
              className={`w-full text-left text-xs p-1.5 rounded border transition-colors ${
                canDoOpposition
                  ? 'bg-purple-50 border-purple-200 text-purple-800 hover:bg-purple-100'
                  : 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
              }`}
              title="Informování opozice o situaci. +3 k důvěře. Lze jednou za 3 kola."
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">Schůzka s opozicí</span>
                <span className="text-[9px] text-green-600">+3</span>
              </div>
            </button>
            <button
              onClick={doMediaSupport}
              disabled={!canDoMedia}
              className={`w-full text-left text-xs p-1.5 rounded border transition-colors ${
                canDoMedia
                  ? 'bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100'
                  : 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
              }`}
              title="Vystoupení v médiích s transparentními informacemi. +2 k důvěře. Lze jednou za 2 kola."
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">Mediální komunikace</span>
                <span className="text-[9px] text-green-600">+2</span>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
