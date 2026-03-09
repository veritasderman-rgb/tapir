import { useAppStore } from '../store/useAppStore';
import { type VariantShockConfig } from '@tapir/core';
import { useCallback } from 'react';

let variantCounter = 0;

function createDefaultVariant(): VariantShockConfig {
  return {
    id: `var-${++variantCounter}`,
    name: 'Nová varianta',
    day: 120,
    transmissibilityMultiplier: 1.5,
    immuneEscape: 0.2,
    reinfectionBoost: 0.1,
  };
}

export default function VariantPanel() {
  const { scenario, updateScenario, appMode } = useAppStore();
  const variants = scenario.variants;

  const addVariant = useCallback(() => {
    updateScenario({ variants: [...variants, createDefaultVariant()] });
  }, [variants, updateScenario]);

  const removeVariant = useCallback((id: string) => {
    updateScenario({ variants: variants.filter(v => v.id !== id) });
  }, [variants, updateScenario]);

  const updateVariant = useCallback((id: string, partial: Partial<VariantShockConfig>) => {
    updateScenario({
      variants: variants.map(v => v.id === id ? { ...v, ...partial } : v),
    });
  }, [variants, updateScenario]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-600">Varianty</span>
        <button
          onClick={addVariant}
          className="text-xs px-2 py-1 bg-purple-50 text-purple-700 rounded hover:bg-purple-100 border border-purple-200"
        >
          + Přidat variantu
        </button>
      </div>

      {variants.length === 0 && (
        <p className="text-xs text-gray-400">Žádné varianty.</p>
      )}

      {variants.map((v) => (
        <div key={v.id} className="border border-gray-200 rounded p-3 space-y-2 bg-white">
          <div className="flex items-center justify-between">
            <input
              type="text"
              value={v.name}
              onChange={(e) => updateVariant(v.id, { name: e.target.value })}
              className="text-sm font-medium border-b border-transparent hover:border-gray-300 focus:border-purple-500 outline-none"
            />
            <button onClick={() => removeVariant(v.id)} className="text-xs text-red-500 hover:text-red-700">
              Odebrat
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-500">Den aktivace</label>
              <input
                type="number"
                value={v.day}
                onChange={(e) => updateVariant(v.id, { day: parseInt(e.target.value) || 0 })}
                min={-1}
                className="w-full text-xs border border-gray-300 rounded px-1 py-1"
              />
              <span className="text-xs text-gray-400">-1 = náhodný</span>
            </div>
            <div>
              <label className="block text-xs text-gray-500">Transmisibilita (×)</label>
              <input
                type="number"
                value={v.transmissibilityMultiplier}
                onChange={(e) => updateVariant(v.id, { transmissibilityMultiplier: parseFloat(e.target.value) || 1 })}
                min={0.1} max={10} step={0.1}
                className="w-full text-xs border border-gray-300 rounded px-1 py-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-500">Immune escape [0-1]</label>
              <input
                type="number"
                value={v.immuneEscape}
                onChange={(e) => updateVariant(v.id, { immuneEscape: parseFloat(e.target.value) || 0 })}
                min={0} max={1} step={0.05}
                className="w-full text-xs border border-gray-300 rounded px-1 py-1"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500">Reinfection boost [0-1]</label>
              <input
                type="number"
                value={v.reinfectionBoost}
                onChange={(e) => updateVariant(v.id, { reinfectionBoost: parseFloat(e.target.value) || 0 })}
                min={0} max={1} step={0.05}
                className="w-full text-xs border border-gray-300 rounded px-1 py-1"
              />
            </div>
          </div>

          {v.day === -1 && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-500">Mean den (random)</label>
                <input
                  type="number"
                  value={v.randomMeanDay ?? 100}
                  onChange={(e) => updateVariant(v.id, { randomMeanDay: parseInt(e.target.value) || 100 })}
                  min={0}
                  className="w-full text-xs border border-gray-300 rounded px-1 py-1"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500">Std dev</label>
                <input
                  type="number"
                  value={v.randomStdDev ?? 20}
                  onChange={(e) => updateVariant(v.id, { randomStdDev: parseInt(e.target.value) || 20 })}
                  min={0}
                  className="w-full text-xs border border-gray-300 rounded px-1 py-1"
                />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
