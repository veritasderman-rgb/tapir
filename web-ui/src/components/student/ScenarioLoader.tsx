import { useState, useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import { encodeGameScenario } from '@tapir/core';
import { defaultScenario } from '@tapir/core';
import { MEASURE_CATALOG } from '@tapir/core';

export default function ScenarioLoader() {
  const { loadScenario, loadError } = useGameStore();
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const displayError = error || loadError;

  useEffect(() => {
    let gameParam: string | null = null;
    const hash = window.location.hash;
    if (hash.startsWith('#game=')) {
      gameParam = hash.slice('#game='.length);
    }
    if (!gameParam) {
      const params = new URLSearchParams(window.location.search);
      gameParam = params.get('game');
    }
    if (gameParam) {
      loadScenario(gameParam as any);
    }
  }, [loadScenario]);

  const handleLoad = () => {
    let encoded = input.trim();
    if (!encoded) {
      // Use default scenario if empty
      const gs = {
        baseScenario: defaultScenario(),
        totalTurns: 12,
        daysPerTurn: 14,
        hiddenEvents: [],
        socialCapital: { initial: 100, recoveryRate: 0.5, collapseThreshold: 20 },
        availableMeasureIds: MEASURE_CATALOG.map(m => m.id),
        vaccinationLocked: false,
      };
      encoded = encodeGameScenario(gs as any);
    } else {
      if (encoded.includes('#game=')) {
        encoded = encoded.split('#game=')[1];
      } else if (encoded.includes('?game=')) {
        encoded = encoded.split('?game=')[1].split('&')[0];
      }
    }
    loadScenario(encoded as any);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-[2rem] overflow-hidden shadow-xl">
        <div className="bg-gray-900 px-8 py-10 text-center">
          <div className="text-4xl mb-4">🏛️</div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tighter italic">Krizový štáb</h1>
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-2">
            České republiky
          </p>
        </div>

        <div className="p-8 space-y-6">
          <div className="space-y-2">
             <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Vložit kód scénáře</label>
             <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Vložte URL nebo Base64 kód (nechte prázdné pro základní scénář)..."
                className="w-full border border-gray-100 bg-gray-50 rounded-2xl px-4 py-3 text-xs h-32 resize-none focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                aria-label="Scénář od učitele"
             />
          </div>

          <button
            onClick={handleLoad}
            className="w-full py-4 bg-red-600 text-white font-black uppercase tracking-widest text-sm rounded-2xl hover:bg-red-700 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-3"
          >
            <span>🚨</span>
            <span>Vstoupit do štábu</span>
          </button>

          {displayError && (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
              <p className="text-xs text-red-600 text-center font-bold">{displayError}</p>
            </div>
          )}

          <div className="bg-gray-50 rounded-2xl p-5 text-[10px] text-gray-400 space-y-2 leading-relaxed font-medium italic">
            <p>Jako člen krizového štábu budete řídit reakci státu na probíhající epidemii.</p>
            <p>Vaším úkolem je minimalizovat ztráty na životech i ekonomické škody pod neustálým politickým tlakem.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
