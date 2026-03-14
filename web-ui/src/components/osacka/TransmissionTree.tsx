import React, { useMemo } from 'react';
import { useOsackaStore } from '../../store/osackaStore';
import { contacts } from '../../data/osacka/contacts';

const TransmissionTree: React.FC = () => {
  const identifiedInfected = useOsackaStore((s) => s.identifiedInfected);
  const epiCurveData = useOsackaStore((s) => s.epiCurveData);
  const transmissionLinks = useOsackaStore((s) => s.transmissionLinks);
  const setTransmissionSource = useOsackaStore((s) => s.setTransmissionSource);
  const removeTransmissionLink = useOsackaStore((s) => s.removeTransmissionLink);
  const finishGame = useOsackaStore((s) => s.finishGame);

  const getContactName = (id: string) =>
    contacts.find((c) => c.id === id)?.name ?? id;

  // Contacts the player identified as infected
  const infectedContacts = useMemo(
    () =>
      identifiedInfected
        .map((id) => contacts.find((c) => c.id === id))
        .filter(Boolean) as typeof contacts,
    [identifiedInfected]
  );

  // Possible sources: identified infected + 'sks_package' (external source)
  const sourceOptions = useMemo(
    () => [
      { id: 'sks_package', name: 'Zasilka SKS (externi zdroj)' },
      ...infectedContacts.map((c) => ({ id: c.id, name: c.name })),
    ],
    [infectedContacts]
  );

  // Get the link for a target
  const getLinkSource = (targetId: string) =>
    transmissionLinks.find((l) => l.targetId === targetId)?.sourceId ?? '';

  // Build epi curve summary from player data
  const epiCurveSummary = useMemo(() => {
    return epiCurveData
      .filter((e) => e.contactIds.length > 0)
      .map((e) => ({
        day: e.day,
        contacts: e.contactIds
          .map((id) => getContactName(id))
          .join(', '),
        count: e.contactIds.length,
      }));
  }, [epiCurveData]);

  // Build a simple tree structure from links for visualization
  const treeRoots = useMemo(() => {
    const linked = new Set(transmissionLinks.map((l) => l.targetId));
    const sources = new Set(transmissionLinks.map((l) => l.sourceId));

    // Roots are sources that are not targets of any link, or sks_package
    const rootIds = new Set<string>();
    for (const l of transmissionLinks) {
      if (!linked.has(l.sourceId)) {
        rootIds.add(l.sourceId);
      }
    }

    // Build children map
    const childrenMap: Record<string, string[]> = {};
    for (const l of transmissionLinks) {
      if (!childrenMap[l.sourceId]) childrenMap[l.sourceId] = [];
      childrenMap[l.sourceId].push(l.targetId);
    }

    return { rootIds: Array.from(rootIds), childrenMap };
  }, [transmissionLinks]);

  const renderTreeNode = (
    nodeId: string,
    childrenMap: Record<string, string[]>,
    depth: number
  ): React.ReactNode => {
    const children = childrenMap[nodeId] ?? [];
    const isExternal = nodeId === 'sks_package';
    const name = isExternal ? 'Zasilka SKS' : getContactName(nodeId);
    const isInfected = identifiedInfected.includes(nodeId);

    return (
      <div key={nodeId} className={depth > 0 ? 'ml-6 border-l-2 border-gray-200 pl-3' : ''}>
        <div className="flex items-center gap-2 py-1">
          <span
            className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold shrink-0 ${
              isExternal
                ? 'bg-yellow-100 text-yellow-700'
                : isInfected
                  ? 'bg-red-100 text-red-600'
                  : 'bg-gray-100 text-gray-500'
            }`}
          >
            {depth}
          </span>
          <span className={`text-sm font-medium ${isExternal ? 'text-yellow-700' : 'text-gray-800'}`}>
            {name}
          </span>
        </div>
        {children.map((childId) => renderTreeNode(childId, childrenMap, depth + 1))}
      </div>
    );
  };

  const linkedCount = transmissionLinks.length;
  const totalToLink = infectedContacts.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 py-4 md:py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Retezec nakazy
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Sestavte epidemiologicky strom — kdo koho nakazil
          </p>
        </div>

        {/* Epi curve reminder */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h2 className="text-sm font-bold text-gray-800 mb-3">
            Vase epidemicka krivka (pripomenuti)
          </h2>
          {epiCurveSummary.length === 0 ? (
            <p className="text-sm text-gray-400">Zadne zaznamy na epi krivce</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
              {epiCurveSummary.map((d) => (
                <div
                  key={d.day}
                  className="bg-red-50 border border-red-200 rounded p-2 text-center"
                >
                  <div className="text-xs font-bold text-gray-600">
                    Den {d.day} ({d.day}.11.)
                  </div>
                  <div className="text-lg font-bold text-red-600">{d.count}</div>
                  <div className="text-xs text-gray-500 truncate">{d.contacts}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Transmission link builder */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-800">
              Kdo koho nakazil?
            </h2>
            <span className="text-xs text-gray-500">
              Propojeno: {linkedCount}/{totalToLink}
            </span>
          </div>
          <p className="text-xs text-gray-500 mb-4">
            Pro kazdeho nakazeneho vyberte, od koho se nakazil. Pokud byl nakaz
            primo ze zasilky SKS, vyberte &quot;Zasilka SKS&quot;.
          </p>

          <div className="space-y-2">
            {infectedContacts.map((contact) => {
              const currentSource = getLinkSource(contact.id);
              return (
                <div
                  key={contact.id}
                  className={`flex items-center gap-3 p-2 rounded-lg border ${
                    currentSource
                      ? 'border-green-200 bg-green-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <span className="text-sm font-medium text-gray-800 w-40 shrink-0 truncate">
                    {contact.name}
                  </span>
                  <span className="text-xs text-gray-400 shrink-0">&larr;</span>
                  <select
                    value={currentSource}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val) {
                        setTransmissionSource(contact.id, val);
                      } else {
                        removeTransmissionLink(contact.id);
                      }
                    }}
                    className="flex-1 text-sm px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-400"
                  >
                    <option value="">-- Vyberte zdroj --</option>
                    {sourceOptions
                      .filter((s) => s.id !== contact.id) // can't infect yourself
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                  </select>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tree visualization */}
        {linkedCount > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h2 className="text-sm font-bold text-gray-800 mb-3">
              Vas prenosovy strom
            </h2>
            <div className="space-y-1">
              {treeRoots.rootIds.map((rootId) =>
                renderTreeNode(rootId, treeRoots.childrenMap, 0)
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => useOsackaStore.setState({ phase: 'playing' })}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            Zpet k vysetrovani
          </button>
          <button
            onClick={finishGame}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-colors"
          >
            Uzavrit vysetrovani a zobrazit vysledky
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransmissionTree;
