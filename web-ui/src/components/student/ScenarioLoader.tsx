import { useState, useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import { encodeGameScenario, PRESET_SCENARIOS } from '@tapir/core';
import { defaultScenario } from '@tapir/core';
import { MEASURE_CATALOG } from '@tapir/core';
import type { PresetScenario } from '@tapir/core';

const DIFFICULTY_COLORS: Record<string, string> = {
  'snadný': 'bg-green-100 text-green-800',
  'střední': 'bg-yellow-100 text-yellow-800',
  'těžký': 'bg-orange-100 text-orange-800',
  'extrémní': 'bg-red-100 text-red-800',
};

export default function ScenarioLoader() {
  const { loadScenario, loadError } = useGameStore();
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showTeacherInput, setShowTeacherInput] = useState(false);

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

  const handlePresetClick = (preset: PresetScenario) => {
    const encoded = encodeGameScenario(preset.scenario);
    loadScenario(encoded as any);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="bg-gray-900 rounded-t-[2rem] px-8 py-10 text-center">
          <div className="text-4xl mb-4">🏛️</div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tighter italic">Krizový štáb</h1>
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-2">
            České republiky
          </p>
        </div>

        {/* Scenario cards */}
        <div className="bg-white px-8 py-6 border-x border-gray-200">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Vyberte scénář epidemie</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {PRESET_SCENARIOS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handlePresetClick(preset)}
                className="text-left border border-gray-200 rounded-xl p-4 hover:border-red-300 hover:shadow-md transition-all group cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">{preset.emoji}</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-gray-900 group-hover:text-red-700 transition-colors">
                        {preset.name}
                      </span>
                      <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${DIFFICULTY_COLORS[preset.difficulty] ?? 'bg-gray-100 text-gray-600'}`}>
                        {preset.difficulty}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1 leading-snug">
                      {preset.description}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1.5 italic leading-snug">
                      {preset.detail}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Teacher code section */}
        <div className="bg-white px-8 py-4 border-x border-b border-gray-200 rounded-b-[2rem]">
          {!showTeacherInput ? (
            <button
              onClick={() => setShowTeacherInput(true)}
              className="w-full text-center text-xs text-gray-400 hover:text-gray-600 py-2 transition-colors"
            >
              Mám kód scénáře od učitele →
            </button>
          ) : (
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Kód scénáře od učitele</label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Vložte URL nebo Base64 kód..."
                className="w-full border border-gray-100 bg-gray-50 rounded-2xl px-4 py-3 text-xs h-24 resize-none focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                aria-label="Scénář od učitele"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleLoad}
                  className="flex-1 py-3 bg-red-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-red-700 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                >
                  <span>🚨</span>
                  <span>Načíst scénář</span>
                </button>
                <button
                  onClick={() => setShowTeacherInput(false)}
                  className="px-4 py-3 text-gray-400 text-xs hover:text-gray-600 transition-colors"
                >
                  Zpět
                </button>
              </div>
            </div>
          )}

          {displayError && (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-4 mt-3">
              <p className="text-xs text-red-600 text-center font-bold">{displayError}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
