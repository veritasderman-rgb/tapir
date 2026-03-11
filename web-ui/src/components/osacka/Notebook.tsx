import React, { useState } from 'react';
import { useOsackaStore } from '../../store/osackaStore';
import { contacts } from '../../data/osacka/contacts';
import type { PlayerNote } from '../../types/didaktikon';

type FilterMode = 'all' | 'infected' | 'unknown';

const statusLabels: Record<PlayerNote['status'], string> = {
  infected: 'Nakazeny',
  healthy_exposed: 'Zdravy (exp.)',
  healthy: 'Zdravy',
  unavailable: 'Nedostupny',
  unknown: 'Neznamy',
};

const Notebook: React.FC = () => {
  const [filter, setFilter] = useState<FilterMode>('all');
  const calledContacts = useOsackaStore((s) => s.calledContacts);
  const playerNotes = useOsackaStore((s) => s.playerNotes);
  const identifiedInfected = useOsackaStore((s) => s.identifiedInfected);
  const updateNote = useOsackaStore((s) => s.updateNote);
  const selectContact = useOsackaStore((s) => s.selectContact);
  const finishGame = useOsackaStore((s) => s.finishGame);

  const calledContactData = calledContacts
    .map((id) => {
      const contact = contacts.find((c) => c.id === id);
      const note = playerNotes[id];
      return contact && note ? { contact, note } : null;
    })
    .filter(Boolean) as { contact: (typeof contacts)[number]; note: PlayerNote }[];

  const filtered = calledContactData.filter(({ note }) => {
    if (filter === 'infected') return note.status === 'infected';
    if (filter === 'unknown') return note.status === 'unknown';
    return true;
  });

  const handleStatusChange = (contactId: string, status: PlayerNote['status']) => {
    updateNote(contactId, { status });
  };

  const handleNoteChange = (contactId: string, text: string) => {
    updateNote(contactId, { freeText: text });
  };

  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-200">
      <div className="p-3 border-b border-gray-200">
        <h2 className="text-sm font-bold text-gray-800 mb-2">Poznamkovy blok</h2>
        <div className="flex gap-1">
          {(
            [
              ['all', 'Vse'],
              ['infected', 'Nakazeni'],
              ['unknown', 'Nezname'],
            ] as [FilterMode, string][]
          ).map(([value, label]) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`px-2 py-1 text-xs rounded-md transition-colors ${
                filter === value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="text-sm text-gray-400 text-center mt-8 px-4">
            {calledContacts.length === 0
              ? 'Zatim jste nikomu nezavolali'
              : 'Zadne zaznamy pro tento filtr'}
          </p>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map(({ contact, note }) => (
              <div
                key={contact.id}
                className="p-3 hover:bg-gray-50 cursor-pointer"
                onClick={() => selectContact(contact.id)}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-800 truncate">
                    {contact.name}
                  </span>
                </div>
                <select
                  value={note.status}
                  onChange={(e) =>
                    handleStatusChange(contact.id, e.target.value as PlayerNote['status'])
                  }
                  onClick={(e) => e.stopPropagation()}
                  className={`w-full text-xs px-2 py-1 border rounded-md mb-1 focus:outline-none focus:ring-1 focus:ring-blue-400 ${
                    note.status === 'infected'
                      ? 'border-red-300 bg-red-50 text-red-700'
                      : 'border-gray-300'
                  }`}
                >
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Poznamka..."
                  value={note.freeText ?? ''}
                  onChange={(e) => handleNoteChange(contact.id, e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full text-xs px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-600 mb-2">
          Identifikovano nakazenych:{' '}
          <span className="font-bold text-red-600">{identifiedInfected.length}</span>
        </div>
        <button
          onClick={finishGame}
          className="w-full px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
        >
          Uzavrit vysetrovani
        </button>
      </div>
    </div>
  );
};

export default Notebook;
