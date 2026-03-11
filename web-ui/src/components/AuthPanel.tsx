import { useState } from 'react';
import { AppMode, defaultScenario } from '@tapir/core';
import { verifyTeacher } from '../lib/classroom-db';
import { useAppStore } from '../store/useAppStore';
import { useGameStore } from '../store/gameStore';

export default function AuthPanel() {
  const { setAuth, setAppMode, setScenario } = useAppStore();
  const [teacherUsername, setTeacherUsername] = useState('');
  const [teacherPassword, setTeacherPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleTeacherLogin = () => {
    if (!verifyTeacher(teacherUsername.trim(), teacherPassword)) {
      setError('Neplatné učitelské přihlášení.');
      return;
    }

    setAuth({ role: 'teacher', username: teacherUsername.trim(), classId: null });
    setAppMode(AppMode.Instructor);
    setError(null);
  };

  const handleExpertMode = () => {
    setAuth({ role: 'guest', username: 'expert', classId: null });
    setAppMode(AppMode.Expert);
    setError(null);
  };

  const handleCrisisStaff = () => {
    setAuth({ role: 'guest', username: 'krizovy-stab', classId: null });
    setAppMode(AppMode.CrisisStaff);
    setScenario(defaultScenario());
    setError(null);
    // Load default game scenario
    const { loadScenario } = useGameStore.getState();
    // Will start with ScenarioLoader where user can paste a link or use default
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-4">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Nedovařený tapír</h1>
          <p className="text-sm text-gray-500 mt-1">Epidemiologická simulace a krizové řízení</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {/* Expert mode */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-3">
            <div className="text-center">
              <div className="text-2xl mb-2">🔬</div>
              <h2 className="font-semibold text-gray-900">Odborný režim</h2>
              <p className="text-xs text-gray-500 mt-1">
                Parametrický sandbox pro kontrolu epidemiologických modelů, nastavení opatření a simulaci na populaci.
              </p>
            </div>
            <button
              onClick={handleExpertMode}
              className="w-full bg-gray-800 text-white rounded py-2.5 text-sm hover:bg-gray-900 transition-colors"
            >
              Vstoupit jako odborník
            </button>
          </div>

          {/* Teacher mode */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-3">
            <div className="text-center">
              <div className="text-2xl mb-2">🎓</div>
              <h2 className="font-semibold text-gray-900">Učitelský režim</h2>
              <p className="text-xs text-gray-500 mt-1">
                Tvorba scénářů, generování odkazů do Krizového štábu.
              </p>
            </div>
            <p className="text-[10px] text-gray-400 text-center">Demo: <code>ucitel / tapir123</code></p>
            <input
              value={teacherUsername}
              onChange={(e) => setTeacherUsername(e.target.value)}
              placeholder="Uživatelské jméno"
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
            />
            <input
              value={teacherPassword}
              onChange={(e) => setTeacherPassword(e.target.value)}
              placeholder="Heslo"
              type="password"
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
            />
            <button
              onClick={handleTeacherLogin}
              className="w-full bg-indigo-600 text-white rounded py-2.5 text-sm hover:bg-indigo-700 transition-colors"
            >
              Přihlásit učitele
            </button>
          </div>

          {/* Crisis Staff */}
          <div className="bg-white border-2 border-red-300 rounded-lg p-5 space-y-3">
            <div className="text-center">
              <div className="text-2xl mb-2">🏛️</div>
              <h2 className="font-semibold text-gray-900">Krizový štáb</h2>
              <p className="text-xs text-gray-500 mt-1">
                Vstupte do role krizového manažera. Řiďte epidemii, rozhodujte o opatřeních, čelťe politickým tlakům.
              </p>
            </div>
            <button
              onClick={handleCrisisStaff}
              className="w-full bg-red-700 text-white rounded py-2.5 text-sm font-bold hover:bg-red-800 transition-colors"
            >
              Krizový štáb — vstup
            </button>
            <p className="text-[10px] text-gray-400 text-center">
              Nebo použijte odkaz od učitele pro konkrétní scénář.
            </p>
          </div>
        </div>

        {/* Didaktikon games */}
        <div className="pt-2">
          <p className="text-center text-xs text-gray-400 mb-3 uppercase tracking-wider font-semibold">Didaktikon — epidemiologické hry</p>
          <div className="grid md:grid-cols-2 gap-4">
            {/* Ósacká horečka */}
            <div className="bg-white border-2 border-amber-300 rounded-lg p-5 space-y-3">
              <div className="text-center">
                <div className="text-2xl mb-2">🦠</div>
                <h2 className="font-semibold text-gray-900">Ósacká horečka</h2>
                <p className="text-xs text-gray-500 mt-1">
                  Telefonní trasování kontaktů ve Springfieldu. Identifikujte nakažené, najděte ohniska nákazy a sestavte epidemiologickou křivku.
                </p>
              </div>
              <button
                onClick={() => {
                  setAuth({ role: 'guest', username: 'didaktikon', classId: null });
                  setAppMode(AppMode.OsackaHorecka);
                  setError(null);
                }}
                className="w-full bg-amber-600 text-white rounded py-2.5 text-sm font-bold hover:bg-amber-700 transition-colors"
              >
                Hrát Ósackou horečku
              </button>
            </div>

            {/* Tyfová Mary */}
            <div className="bg-white border-2 border-emerald-300 rounded-lg p-5 space-y-3">
              <div className="text-center">
                <div className="text-2xl mb-2">🔍</div>
                <h2 className="font-semibold text-gray-900">Tyfová Mary</h2>
                <p className="text-xs text-gray-500 mt-1">
                  Historická detektivka z roku 1906. Prozkoumejte dokumenty, analyzujte důkazy a odhalte první známou asymptomatickou přenašečku tyfu.
                </p>
              </div>
              <button
                onClick={() => {
                  setAuth({ role: 'guest', username: 'didaktikon', classId: null });
                  setAppMode(AppMode.TyfovaMary);
                  setError(null);
                }}
                className="w-full bg-emerald-600 text-white rounded py-2.5 text-sm font-bold hover:bg-emerald-700 transition-colors"
              >
                Hrát Tyfovou Mary
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-300 text-red-800 px-4 py-2 rounded text-sm text-center">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
