import { useState, useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';

export default function ScenarioLoader() {
  const { loadScenario, loadError } = useGameStore();
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const displayError = error || loadError;

  // Auto-load from URL hash (#game=...) or query param (?game=...)
  useEffect(() => {
    let gameParam: string | null = null;

    // Check hash first (preferred — no length limit)
    const hash = window.location.hash;
    if (hash.startsWith('#game=')) {
      gameParam = hash.slice('#game='.length);
    }

    // Fallback to query param (legacy)
    if (!gameParam) {
      const params = new URLSearchParams(window.location.search);
      gameParam = params.get('game');
    }

    if (gameParam) {
      loadScenario(gameParam);
    }
  }, [loadScenario]);

  const handleLoad = () => {
    if (!input.trim()) {
      setError('Vlozte scenar od ucitele.');
      return;
    }
    // Try extracting base64 from URL if pasted as full URL
    let encoded = input.trim();
    if (encoded.includes('#game=')) {
      encoded = encoded.split('#game=')[1];
    } else if (encoded.includes('?game=')) {
      encoded = encoded.split('?game=')[1].split('&')[0];
    }
    loadScenario(encoded);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-700 to-red-900 px-6 py-5 text-center">
          <div className="text-3xl mb-2">🏛️</div>
          <h1 className="text-xl font-bold text-white">Krizový štáb</h1>
          <p className="text-red-200 text-xs mt-1">
            Epidemiologická simulace rozhodování
          </p>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-xs text-gray-500 text-center">
            Vložte URL nebo kód scénáře od učitele a vstupte do Krizového štábu.
          </p>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Vložte URL nebo Base64 scénář..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm h-24 resize-none"
            aria-label="Scénář od učitele"
          />

          <button
            onClick={handleLoad}
            className="w-full py-3 bg-red-700 text-white font-bold rounded-lg hover:bg-red-800 transition-colors flex items-center justify-center gap-2"
          >
            <span>🚨</span>
            <span>Vstoupit do Krizového štábu</span>
          </button>

          {displayError && (
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <p className="text-xs text-red-600 text-center font-medium">{displayError}</p>
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-3 text-[10px] text-gray-400 space-y-1">
            <p>Jako člen krizového štábu budete řídit reakci na epidemii.</p>
            <p>Rozhodujte o opatřeních, sledujte důvěru veřejnosti a snažte se minimalizovat ztráty.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
