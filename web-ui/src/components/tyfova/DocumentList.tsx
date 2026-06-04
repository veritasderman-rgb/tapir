import React from 'react';
import { useTyfovaStore } from '../../store/tyfovaStore';

const STEP_TITLES = [
  'Základní informace',
  'Případ Warrenových',
  'Výpovědi',
  'Kvalita vody',
  'Podezřelý vzorec',
  'Novinové články',
  'Kontrolní opatření',
];

interface DocumentInfo {
  id: string;
  title: string;
  step: number;
}

const ALL_DOCUMENTS: DocumentInfo[] = [
  { id: 'typhoid-info', title: 'Břišní tyfus — přehled', step: 0 },
  { id: 'warren-case', title: 'Případ rodiny Warrenových', step: 1 },
  { id: 'testimonies', title: 'Výpovědi členů domácnosti', step: 2 },
  { id: 'water-report', title: 'Zpráva o kvalitě vody', step: 3 },
  { id: 'historical-cases', title: 'Historické případy — podezřelý vzorec', step: 4 },
  { id: 'newspapers', title: 'Novinové články', step: 5 },
  { id: 'control-measures', title: 'Kontrolní opatření', step: 6 },
];

export const DocumentList: React.FC = () => {
  const currentStep = useTyfovaStore((s) => s.currentStep);
  const unlockedDocuments = useTyfovaStore((s) => s.unlockedDocuments);
  const readDocuments = useTyfovaStore((s) => s.readDocuments);
  const selectedDocument = useTyfovaStore((s) => s.selectedDocument);
  const selectDocument = useTyfovaStore((s) => s.selectDocument);

  return (
    <div className="p-3">
      <div className="mb-4 p-3 bg-brand-teal-soft rounded-xl border border-brand-teal/30">
        <p className="eyebrow text-brand-teal-dark">Aktuální krok</p>
        <p className="text-sm font-semibold text-brand-teal-dark mt-0.5">
          Krok {currentStep + 1}/7: {STEP_TITLES[currentStep]}
        </p>
      </div>

      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-1">
        Dokumenty
      </h3>

      <ul className="space-y-1">
        {ALL_DOCUMENTS.map((doc) => {
          const isUnlocked = unlockedDocuments.includes(doc.id);
          const isRead = readDocuments.includes(doc.id);
          const isSelected = selectedDocument === doc.id;

          let icon: string;
          let statusClass: string;

          if (!isUnlocked) {
            icon = '\u{1F512}';
            statusClass = 'text-gray-400 cursor-not-allowed';
          } else if (isRead) {
            icon = '\u2705';
            statusClass = 'text-gray-700 cursor-pointer hover:bg-gray-100';
          } else {
            icon = '\u{1F4C4}';
            statusClass = 'text-brand-teal-dark cursor-pointer hover:bg-brand-teal-soft/50 font-medium';
          }

          return (
            <li
              key={doc.id}
              onClick={() => isUnlocked && selectDocument(doc.id)}
              className={`flex items-start gap-2 px-3 min-h-[44px] py-2 rounded-xl text-sm transition-colors border-2 ${statusClass} ${
                isSelected ? 'bg-brand-teal-soft border-brand-teal' : 'border-transparent'
              }`}
            >
              <span className="flex-shrink-0 mt-0.5">{icon}</span>
              <span className="leading-tight">{isUnlocked ? doc.title : `Krok ${doc.step + 1}`}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
