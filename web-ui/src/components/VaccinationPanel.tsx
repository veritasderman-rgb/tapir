import { useAppStore } from '../store/useAppStore';
import { type VaccinationConfig } from '@tapir/core';
import { useCallback } from 'react';

export default function VaccinationPanel() {
  const { scenario, updateScenario } = useAppStore();
  const vax = scenario.vaccination;

  const update = useCallback((partial: Partial<VaccinationConfig>) => {
    updateScenario({ vaccination: { ...vax, ...partial } });
  }, [vax, updateScenario]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <label className="text-xs font-semibold text-gray-600">Vakcinace</label>
        <label className="flex items-center gap-1 text-xs">
          <input
            type="checkbox"
            checked={vax.enabled}
            onChange={(e) => update({ enabled: e.target.checked })}
          />
          Aktivní
        </label>
      </div>

      {vax.enabled && (
        <div className="space-y-2">
          <Field label="Den zahájení" value={vax.startDay} onChange={(v) => update({ startDay: v })} min={0} />
          <Field label="Dávky/den" value={vax.dosesPerDay} onChange={(v) => update({ dosesPerDay: v })} min={0} />
          <Field label="VE infekce (peak)" value={vax.peakVEInfection} onChange={(v) => update({ peakVEInfection: v })} min={0} max={1} step={0.05} />
          <Field label="VE těžký průběh (peak)" value={vax.peakVESevere} onChange={(v) => update({ peakVESevere: v })} min={0} max={1} step={0.05} />
          <Field label="Waning half-life (dny)" value={vax.waningHalfLifeDays} onChange={(v) => update({ waningHalfLifeDays: v })} min={1} />
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, min, max, step }: {
  label: string; value: number; onChange: (v: number) => void;
  min?: number; max?: number; step?: number;
}) {
  return (
    <div>
      <label className="block text-xs text-gray-500">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        min={min} max={max} step={step ?? 1}
        className="w-full text-xs border border-gray-300 rounded px-2 py-1"
      />
    </div>
  );
}
