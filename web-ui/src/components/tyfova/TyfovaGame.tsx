import React from 'react';
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
  'Historické případy',
  'Novinové články',
  'Kontrolní opatření',
];

const TyfovaGame: React.FC = () => {
  const phase = useTyfovaStore((s) => s.phase);
  const currentStep = useTyfovaStore((s) => s.currentStep);
  const startGame = useTyfovaStore((s) => s.startGame);

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
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <h1 className="text-lg font-bold text-gray-800">
          Tyfová Mary — Epidemiologické vyšetřování
        </h1>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-500">
            Krok {currentStep + 1}/7:
          </span>
          <span className="text-sm font-semibold text-indigo-600">
            {STEP_TITLES[currentStep]}
          </span>
          <div className="ml-3 flex gap-1">
            {Array.from({ length: 7 }, (_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full ${
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

      {/* Three-column layout */}
      <div className="flex flex-1 overflow-hidden">
        <div className="w-[220px] flex-shrink-0 border-r border-gray-200 bg-white overflow-y-auto">
          <DocumentList />
        </div>
        <div className="flex-1 overflow-y-auto">
          <DocumentViewer />
        </div>
        <div className="w-[320px] flex-shrink-0 border-l border-gray-200 bg-white overflow-y-auto">
          <QuizPanel />
        </div>
      </div>
    </div>
  );
};

const IntroScreen: React.FC<{ onStart: () => void }> = ({ onStart }) => (
  <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-6">
    <div className="max-w-2xl bg-white rounded-2xl shadow-xl p-8 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Tyfová Mary
        </h1>
        <p className="text-sm text-gray-500 uppercase tracking-wide">
          Epidemiologické vyšetřování
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-5 text-gray-800 leading-relaxed space-y-3">
        <p className="font-semibold text-lg">New York, 1906</p>
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

      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
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
          className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg"
        >
          Zahájit vyšetřování
        </button>
      </div>
    </div>
  </div>
);

export default TyfovaGame;
