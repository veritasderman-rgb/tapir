import React, { useState, useMemo } from 'react';
import { useOsackaStore } from '../../store/osackaStore';
import { contacts } from '../../data/osacka/contacts';

const PhoneDirectory: React.FC = () => {
  const [search, setSearch] = useState('');
  const budget = useOsackaStore((s) => s.budget);
  const calledContacts = useOsackaStore((s) => s.calledContacts);
  const selectedContact = useOsackaStore((s) => s.selectedContact);
  const identifiedInfected = useOsackaStore((s) => s.identifiedInfected);
  const playerNotes = useOsackaStore((s) => s.playerNotes);
  const callContact = useOsackaStore((s) => s.callContact);

  const filtered = useMemo(() => {
    if (!search.trim()) return contacts;
    const q = search.toLowerCase();
    return contacts.filter((c) => c.name.toLowerCase().includes(q));
  }, [search]);

  const persons = filtered.filter((c) => c.type === 'person');
  const businesses = filtered.filter((c) => c.type === 'business');

  const getStatusIndicator = (id: string) => {
    const isCalled = calledContacts.includes(id);
    const isInfected = identifiedInfected.includes(id);
    const note = playerNotes[id];

    if (isInfected) return { icon: '\u{1F534}', label: 'Nakazeny' };
    if (note?.status === 'healthy' || note?.status === 'healthy_exposed')
      return { icon: '\u{1F7E2}', label: 'Zdravy' };
    if (isCalled) return { icon: '\u{1F535}', label: 'Zavolano' };
    return { icon: '\u26AA', label: 'Nezavolano' };
  };

  const handleClick = (id: string) => {
    callContact(id);
  };

  const renderGroup = (title: string, items: typeof contacts) => {
    if (items.length === 0) return null;
    return (
      <div className="mb-4">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider px-2 mb-1">
          {title}
        </h3>
        <div className="space-y-1">
          {items.map((contact) => {
            const isCalled = calledContacts.includes(contact.id);
            const isSelected = selectedContact === contact.id;
            const canAfford = isCalled || budget >= contact.cost;
            const status = getStatusIndicator(contact.id);

            return (
              <button
                key={contact.id}
                onClick={() => handleClick(contact.id)}
                disabled={!canAfford}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors
                  ${isSelected ? 'bg-blue-100 border border-blue-300' : 'hover:bg-gray-100'}
                  ${!canAfford ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span title={status.label}>{status.icon}</span>
                    <span className="truncate font-medium">{contact.name}</span>
                  </div>
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full font-medium shrink-0 ml-2
                      ${isCalled ? 'bg-gray-200 text-gray-500' : 'bg-amber-100 text-amber-700'}
                    `}
                  >
                    {isCalled ? 'zavolano' : `${contact.cost}b`}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      <div className="p-3 border-b border-gray-200">
        <h2 className="text-sm font-bold text-gray-800 mb-2">Telefonni seznam</h2>
        <input
          type="text"
          placeholder="Hledat kontakt..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <div className="mt-2 text-xs text-gray-500">
          Rozpocet: <span className="font-bold text-gray-700">{budget}b</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {renderGroup('Osoby', persons)}
        {renderGroup('Podniky', businesses)}
        {filtered.length === 0 && (
          <p className="text-sm text-gray-400 text-center mt-4">Zadny kontakt nenalezen</p>
        )}
      </div>
    </div>
  );
};

export default PhoneDirectory;
