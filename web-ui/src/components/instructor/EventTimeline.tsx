import { useCallback } from 'react';
import { type HiddenEvent, type HiddenEventType } from '@tapir/core';

interface Props {
  events: HiddenEvent[];
  onChange: (events: HiddenEvent[]) => void;
  durationMonths: number;
}

const EVENT_TYPES: { type: HiddenEventType; label: string; color: string; defaultPayload: Record<string, number> }[] = [
  { type: 'variant_shock', label: 'Varianta', color: 'bg-red-100 border-red-300 text-red-800', defaultPayload: { transmissibilityMultiplier: 1.3, immuneEscape: 0.1 } },
  { type: 'vaccine_unlock', label: 'Odemknuti vakciny', color: 'bg-green-100 border-green-300 text-green-800', defaultPayload: {} },
  { type: 'supply_disruption', label: 'Vypadek zasobovani', color: 'bg-orange-100 border-orange-300 text-orange-800', defaultPayload: { bedReductionFraction: 0.3 } },
  { type: 'public_unrest', label: 'Verejne nepokoje', color: 'bg-purple-100 border-purple-300 text-purple-800', defaultPayload: { penalty: 15 } },
];

let eventCounter = 0;

export default function EventTimeline({ events, onChange, durationMonths }: Props) {
  const addEvent = useCallback((type: HiddenEventType) => {
    const def = EVENT_TYPES.find(e => e.type === type)!;
    const newEvent: HiddenEvent = {
      id: `event-${++eventCounter}`,
      type,
      month: 1,
      label: def.label,
      payload: { ...def.defaultPayload },
    };
    onChange([...events, newEvent]);
  }, [events, onChange]);

  const removeEvent = useCallback((id: string) => {
    onChange(events.filter(e => e.id !== id));
  }, [events, onChange]);

  const updateEvent = useCallback((id: string, partial: Partial<HiddenEvent>) => {
    onChange(events.map(e => e.id === id ? { ...e, ...partial } : e));
  }, [events, onChange]);

  const updatePayload = useCallback((id: string, key: string, value: number) => {
    onChange(events.map(e => {
      if (e.id !== id) return e;
      return { ...e, payload: { ...e.payload, [key]: value } };
    }));
  }, [events, onChange]);

  const months = Array.from({ length: durationMonths }, (_, i) => i + 1);

  return (
    <div className="space-y-4">
      {/* Visual timeline */}
      <div className="overflow-x-auto">
        <div className="flex gap-px min-w-[600px]" role="list" aria-label="Casova osa mesicu">
          {months.map(m => {
            const monthEvents = events.filter(e => e.month === m);
            return (
              <div
                key={m}
                className="flex-1 min-w-[40px] text-center"
                role="listitem"
              >
                <div className="text-[10px] text-gray-400 mb-1">M{m}</div>
                <div className={`h-8 rounded border ${monthEvents.length > 0 ? 'bg-amber-50 border-amber-300' : 'bg-gray-50 border-gray-200'} flex items-center justify-center`}>
                  {monthEvents.length > 0 && (
                    <span className="text-[10px] font-bold text-amber-700">{monthEvents.length}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add event buttons */}
      <div className="flex flex-wrap gap-2">
        {EVENT_TYPES.map(et => (
          <button
            key={et.type}
            onClick={() => addEvent(et.type)}
            className={`text-xs px-2 py-1 rounded border ${et.color} hover:opacity-80`}
          >
            + {et.label}
          </button>
        ))}
      </div>

      {/* Event list */}
      {events.length === 0 && (
        <p className="text-xs text-gray-400">Zadne skryte udalosti. Pridejte kliknutim vyse.</p>
      )}

      {events.map(event => {
        const typeDef = EVENT_TYPES.find(e => e.type === event.type)!;
        return (
          <div key={event.id} className={`border rounded p-3 space-y-2 ${typeDef.color}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold">{typeDef.label}</span>
                <input
                  type="text"
                  value={event.label}
                  onChange={(e) => updateEvent(event.id, { label: e.target.value })}
                  className="text-xs border border-current/20 rounded px-1 py-0.5 bg-white/50"
                  aria-label="Nazev udalosti"
                />
              </div>
              <button
                onClick={() => removeEvent(event.id)}
                className="text-xs opacity-60 hover:opacity-100"
                aria-label={`Odebrat ${event.label}`}
              >
                Odebrat
              </button>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-xs">
                Mesic:
                <select
                  value={event.month}
                  onChange={(e) => updateEvent(event.id, { month: parseInt(e.target.value) })}
                  className="ml-1 text-xs border rounded px-1 py-0.5 bg-white/50"
                  aria-label="Mesic aktivace"
                >
                  {months.map(m => (
                    <option key={m} value={m}>M{m}</option>
                  ))}
                </select>
              </label>
            </div>

            {/* Type-specific payload */}
            {event.type === 'variant_shock' && (
              <div className="grid grid-cols-2 gap-2">
                <label className="text-xs">
                  Transmise x
                  <input
                    type="number"
                    value={event.payload.transmissibilityMultiplier ?? 1}
                    onChange={(e) => updatePayload(event.id, 'transmissibilityMultiplier', parseFloat(e.target.value) || 1)}
                    min={0.5}
                    max={5}
                    step={0.1}
                    className="w-full text-xs border rounded px-1 py-0.5 bg-white/50 mt-0.5"
                  />
                </label>
                <label className="text-xs">
                  Immune escape
                  <input
                    type="number"
                    value={event.payload.immuneEscape ?? 0}
                    onChange={(e) => updatePayload(event.id, 'immuneEscape', parseFloat(e.target.value) || 0)}
                    min={0}
                    max={1}
                    step={0.05}
                    className="w-full text-xs border rounded px-1 py-0.5 bg-white/50 mt-0.5"
                  />
                </label>
              </div>
            )}

            {event.type === 'supply_disruption' && (
              <label className="text-xs">
                Snizeni luzek (%)
                <input
                  type="number"
                  value={Math.round((event.payload.bedReductionFraction ?? 0) * 100)}
                  onChange={(e) => updatePayload(event.id, 'bedReductionFraction', (parseInt(e.target.value) || 0) / 100)}
                  min={0}
                  max={80}
                  step={5}
                  className="w-full text-xs border rounded px-1 py-0.5 bg-white/50 mt-0.5"
                />
              </label>
            )}

            {event.type === 'public_unrest' && (
              <label className="text-xs">
                Penalizace soc. kapitalu
                <input
                  type="number"
                  value={event.payload.penalty ?? 10}
                  onChange={(e) => updatePayload(event.id, 'penalty', parseInt(e.target.value) || 0)}
                  min={0}
                  max={50}
                  step={5}
                  className="w-full text-xs border rounded px-1 py-0.5 bg-white/50 mt-0.5"
                />
              </label>
            )}
          </div>
        );
      })}
    </div>
  );
}
