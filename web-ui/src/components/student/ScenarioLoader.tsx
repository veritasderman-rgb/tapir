import { useState, useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';

export default function ScenarioLoader() {
  const { loadScenario } = useGameStore();
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Auto-load from URL query param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const gameParam = params.get('game');
    if (gameParam) {
      try {
        loadScenario(gameParam);
      } catch {
        setError('Neplatny scenar v URL.');
      }
    }
  }, [loadScenario]);

  const handleLoad = () => {
    if (!input.trim()) {
      setError('Vlozte scenar od ucitele.');
      return;
    }
    try {
      // Try extracting base64 from URL if pasted as full URL
      let encoded = input.trim();
      if (encoded.includes('?game=')) {
        encoded = encoded.split('?game=')[1].split('&')[0];
      }
      loadScenario(encoded);
      setError(null);
    } catch {
      setError('Neplatny format scenare.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <h1 className="text-xl font-bold text-gray-900 text-center">Krizovy stab</h1>
        <p className="text-xs text-gray-500 text-center">
          Vlozte URL nebo kod scenare od ucitele a zacnete hru.
        </p>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Vlozte URL nebo Base64 scenar..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm h-24 resize-none"
          aria-label="Scenar od ucitele"
        />

        <button
          onClick={handleLoad}
          className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700"
        >
          Nacist scenar a zacit hru
        </button>

        {error && (
          <p className="text-xs text-red-600 text-center">{error}</p>
        )}
      </div>
    </div>
  );
}
