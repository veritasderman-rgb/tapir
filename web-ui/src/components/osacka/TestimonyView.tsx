import React, { useState } from 'react';
import { useOsackaStore } from '../../store/osackaStore';
import { contacts } from '../../data/osacka/contacts';

const TestimonyView: React.FC = () => {
  const selectedContact = useOsackaStore((s) => s.selectedContact);
  const calledContacts = useOsackaStore((s) => s.calledContacts);
  const identifiedInfected = useOsackaStore((s) => s.identifiedInfected);
  const playerNotes = useOsackaStore((s) => s.playerNotes);
  const epiCurveData = useOsackaStore((s) => s.epiCurveData);
  const toggleInfected = useOsackaStore((s) => s.toggleInfected);
  const updateNote = useOsackaStore((s) => s.updateNote);
  const addToEpiCurve = useOsackaStore((s) => s.addToEpiCurve);

  const [epiDay, setEpiDay] = useState<number>(1);

  if (!selectedContact) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <div className="text-center">
          <div className="text-4xl mb-3">&#x1F4DE;</div>
          <p className="text-lg">Vyberte kontakt z telefonniho seznamu</p>
          <p className="text-sm mt-1">Kliknete na jmeno pro zavolani</p>
        </div>
      </div>
    );
  }

  const contact = contacts.find((c) => c.id === selectedContact);
  if (!contact) return null;

  const isCalled = calledContacts.includes(contact.id);

  if (!isCalled) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <div className="text-center">
          <p className="text-lg">Tento kontakt jeste nebyl zavolan</p>
        </div>
      </div>
    );
  }

  if (!contact.available) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <div className="text-4xl mb-3">&#x260E;&#xFE0F;</div>
          <p className="text-lg font-medium">{contact.name}</p>
          <p className="mt-2 text-gray-400">Telefon nikdo nebere...</p>
          <p className="text-sm text-gray-400 mt-1">Zkuste to pozdeji nebo kontaktujte jinou osobu</p>
        </div>
      </div>
    );
  }

  const isInfected = identifiedInfected.includes(contact.id);
  const note = playerNotes[contact.id];

  // Check which epi curve days this contact is already on
  const assignedDays = epiCurveData
    .filter((e) => e.contactIds.includes(contact.id))
    .map((e) => e.day);

  const handleAddToEpiCurve = () => {
    addToEpiCurve(epiDay, contact.id);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-800">{contact.name}</h2>
            <span className="text-xs text-gray-500">
              {contact.type === 'person' ? 'Osoba' : 'Podnik'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {isInfected && (
              <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                Oznacen jako nakazeny
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Testimony */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h3 className="text-sm font-bold text-blue-800 mb-2">Vypoved</h3>
          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
            {contact.testimony}
          </p>
        </div>

        {/* Current status */}
        {note && (
          <div className="mb-4 text-sm text-gray-600">
            <span className="font-medium">Aktualni status: </span>
            <span className={isInfected ? 'text-red-600 font-bold' : ''}>
              {note.status === 'infected' && 'Nakazeny'}
              {note.status === 'healthy_exposed' && 'Zdravy (exponovany)'}
              {note.status === 'healthy' && 'Zdravy'}
              {note.status === 'unavailable' && 'Nedostupny'}
              {note.status === 'unknown' && 'Neznam\u00FD'}
            </span>
          </div>
        )}

        {/* Assigned epi curve days */}
        {assignedDays.length > 0 && (
          <div className="mb-4 text-sm text-gray-600">
            <span className="font-medium">Na epi krivce: </span>
            {assignedDays.map((d) => `den ${d}`).join(', ')}
          </div>
        )}

        {/* Note input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Poznamka
          </label>
          <textarea
            value={note?.freeText ?? ''}
            onChange={(e) => updateNote(contact.id, { freeText: e.target.value })}
            placeholder="Zapiste si poznamku k tomuto kontaktu..."
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            rows={3}
          />
        </div>
      </div>

      {/* Action buttons */}
      <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-2">
        <div className="flex gap-2">
          <button
            onClick={() => toggleInfected(contact.id)}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${
                isInfected
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }
            `}
          >
            {isInfected ? 'Oznacen jako nakazeny \u2713' : 'Oznacit jako nakazeneho'}
          </button>
        </div>
        <div className="flex gap-2 items-center">
          <select
            value={epiDay}
            onChange={(e) => setEpiDay(Number(e.target.value))}
            className="px-2 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {Array.from({ length: 14 }, (_, i) => i + 1).map((d) => (
              <option key={d} value={d}>
                Den {d} ({d}. 11.)
              </option>
            ))}
          </select>
          <button
            onClick={handleAddToEpiCurve}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            Pridat na epi krivku
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestimonyView;
