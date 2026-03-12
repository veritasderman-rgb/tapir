import React, { useState } from 'react';
import { useTyfovaStore } from '../../store/tyfovaStore';
import { DocumentList } from './DocumentList';
import { DocumentViewer } from './DocumentViewer';
import { QuizPanel } from './QuizPanel';
import { TyfovaResults } from './TyfovaResults';

const STEP_TITLES = [
  'Základní informace',
  'Případ Warrenových',
  'Výpovědi',
  'Kvalita vody',
  'Podezřelý vzorec',
  'Novinové články',
  'Kontrolní opatření',
];

const MOBILE_TABS = [
  { id: 'docs', label: 'Dokumenty', icon: '📄' },
  { id: 'viewer', label: 'Čtení', icon: '📖' },
  { id: 'quiz', label: 'Otázky', icon: '✏️' },
] as const;

type MobileTab = (typeof MOBILE_TABS)[number]['id'];

const TyfovaGame: React.FC = () => {
  const phase = useTyfovaStore((s) => s.phase);
  const currentStep = useTyfovaStore((s) => s.currentStep);
  const startGame = useTyfovaStore((s) => s.startGame);
  const [mobileTab, setMobileTab] = useState<MobileTab>('viewer');

  if (phase === 'intro') {
    return <IntroScreen onStart={startGame} />;
  }

  if (phase === 'results') {
    return <TyfovaResults />;
  }

  // Playing phase
  return (
    <div className="flex flex-col h-full min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 px-3 md:px-4 py-2 md:py-3 flex items-center justify-between shadow-sm gap-2">
        <h1 className="text-sm md:text-lg font-bold text-gray-800 truncate min-w-0">
          <span className="hidden sm:inline">Záhada z Oyster Bay — Epidemiologické vyšetřování</span>
          <span className="sm:hidden">Záhada z Oyster Bay</span>
        </h1>
        <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
          <span className="text-xs md:text-sm font-medium text-gray-500">
            <span className="hidden sm:inline">Krok </span>{currentStep + 1}/7
          </span>
          <span className="hidden md:inline text-sm font-semibold text-indigo-600">
            {STEP_TITLES[currentStep]}
          </span>
          <div className="ml-1 md:ml-3 flex gap-0.5 md:gap-1">
            {Array.from({ length: 7 }, (_, i) => (
              <div
                key={i}
                className={`w-2 h-2 md:w-3 md:h-3 rounded-full ${
                  i < currentStep
                    ? 'bg-green-500'
                    : i === currentStep
                      ? 'bg-indigo-500'
                      : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Mobile tab bar */}
      <div className="md:hidden flex border-b border-gray-200 bg-white">
        {MOBILE_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setMobileTab(tab.id)}
            className={`flex-1 py-2.5 text-xs font-bold text-center transition-colors ${
              mobileTab === tab.id
                ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <span className="mr-1">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Desktop: Three-column layout / Mobile: tabbed content */}
      <div className="flex flex-1 overflow-hidden">
        <div className={`${mobileTab === 'docs' ? 'block' : 'hidden'} md:block w-full md:w-[220px] flex-shrink-0 md:border-r border-gray-200 bg-white overflow-y-auto`}>
          <DocumentList />
        </div>
        <div className={`${mobileTab === 'viewer' ? 'block' : 'hidden'} md:block flex-1 overflow-y-auto`}>
          <DocumentViewer />
        </div>
        <div className={`${mobileTab === 'quiz' ? 'block' : 'hidden'} md:block w-full md:w-[320px] flex-shrink-0 md:border-l border-gray-200 bg-white overflow-y-auto`}>
          <QuizPanel />
        </div>
      </div>
    </div>
  );
};

const IntroScreen: React.FC<{ onStart: () => void }> = ({ onStart }) => (
  <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4 md:p-6">
    <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-5 md:p-8 space-y-5 md:space-y-6">
      <div className="text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Záhada z Oyster Bay
        </h1>
        <p className="text-xs md:text-sm text-gray-500 uppercase tracking-wide">
          Epidemiologické vyšetřování — New York, 1906
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 md:p-5 text-sm md:text-base text-gray-800 leading-relaxed space-y-3">
        <p className="font-semibold text-base md:text-lg">New York, 1906</p>
        <p>
          Jste <strong>George Soper</strong>, sanitární inženýr. Bohatá rodina
          Warrenových najala vaše služby — v jejich letním domě na Long Islandu
          onemocnělo <strong>6 z 11 lidí</strong> břišním tyfem.
        </p>
        <p>
          Břišní tyfus je smrtelná nemoc. Vaším úkolem je systematicky vyšetřit
          případ, najít zdroj nákazy a zabránit dalšímu šíření.
        </p>
        <p>
          Projdete <strong>7 kroků vyšetřování</strong>. V každém kroku si
          přečtete nové dokumenty a odpovíte na otázky. Postupně odhalíte
          pravdu, která změnila dějiny veřejného zdravotnictví.
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-3 md:p-4 space-y-2">
        <h3 className="font-semibold text-gray-700">Pravidla vyšetřování:</h3>
        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
          <li>V každém kroku se vám odemkne nový dokument</li>
          <li>Přečtěte si dokument a odpovězte na otázky</li>
          <li>Po zodpovězení všech otázek můžete postoupit na další krok</li>
          <li>Správné odpovědi se počítají do celkového skóre</li>
          <li>Buďte pozorní — každý detail může být důležitý!</li>
        </ul>
      </div>

      <div className="text-center">
        <button
          onClick={onStart}
          className="w-full sm:w-auto px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg"
        >
          Zahájit vyšetřování
        </button>
      </div>
    </div>
  </div>
);

export default TyfovaGame;
