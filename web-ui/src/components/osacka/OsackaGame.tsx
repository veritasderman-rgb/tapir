import React from 'react';
import { useOsackaStore } from '../../store/osackaStore';
import PhoneDirectory from './PhoneDirectory';
import TestimonyView from './TestimonyView';
import Notebook from './Notebook';
import BudgetBar from './BudgetBar';
import EpiCurve from './EpiCurve';
import OsackaResults from './OsackaResults';

const OsackaGame: React.FC = () => {
  const phase = useOsackaStore((s) => s.phase);
  const startGame = useOsackaStore((s) => s.startGame);

  if (phase === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
            Osacka horecka
          </h1>
          <p className="text-sm text-gray-500 text-center mb-6">
            Epidemiologicke vysetrovani
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-gray-700 leading-relaxed">
              Jste epidemiolog KHS. Prave vam zavolali ze Springfieldu — hlaseno
              nekolik pripadu zahadne horecky po navsteve skupiny cestovatelu
              z Osaky. Vasi ulohou je identifikovat nakazene osoby, zjistit
              retezec prenosu a sestavit epidemickou krivku.
            </p>
          </div>

          <div className="space-y-3 mb-6">
            <h2 className="font-bold text-gray-800">Pravidla</h2>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">&#x2022;</span>
                <span>
                  Mate k dispozici <strong>telefonni seznam</strong> s kontakty.
                  Kazdym hovorem utracite body z rozpoctu.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">&#x2022;</span>
                <span>
                  Kontakty vam poskytnout <strong>svou vypoved</strong> — nekteri
                  mohou byt nedostupni.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">&#x2022;</span>
                <span>
                  Na zaklade vypovedi <strong>oznacte nakazene</strong> a
                  sestavte <strong>epidemickou krivku</strong>.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">&#x2022;</span>
                <span>
                  Pouzivejte <strong>poznamkovy blok</strong> k zaznamenavani
                  informaci.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">&#x2022;</span>
                <span>
                  Snazte se <strong>setrit rozpocet</strong> — za zbyvajici
                  body ziskate bonusove hodnoceni.
                </span>
              </li>
            </ul>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6 text-sm text-amber-800">
            Pocatecni rozpocet: <strong>100 bodu</strong>. Kazdy hovor stoji
            ruzne mnozstvi bodu. Hospodarete rozumne!
          </div>

          <button
            onClick={startGame}
            className="w-full py-3 bg-blue-600 text-white rounded-lg text-lg font-bold hover:bg-blue-700 transition-colors"
          >
            Zahajit vysetrovani
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'results') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <OsackaResults />
      </div>
    );
  }

  // Playing phase — 3-column layout
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top bar */}
      <BudgetBar />

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar — Phone directory */}
        <div className="w-[250px] shrink-0 overflow-y-auto">
          <PhoneDirectory />
        </div>

        {/* Center — Testimony + Epi Curve */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto border-x border-gray-200">
            <TestimonyView />
          </div>
          <div className="border-t border-gray-200 p-4 overflow-y-auto max-h-[320px]">
            <EpiCurve />
          </div>
        </div>

        {/* Right sidebar — Notebook */}
        <div className="w-[300px] shrink-0 overflow-y-auto">
          <Notebook />
        </div>
      </div>
    </div>
  );
};

export default OsackaGame;
