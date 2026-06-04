import { useState } from 'react';
import { AppMode } from '@tapir/core';
import { verifyTeacher } from '../../lib/classroom-db';
import { useAppStore } from '../../store/useAppStore';
import { navigate } from '../../lib/route';
import HomeButton from '../HomeButton';
import { IconSandbox, IconTeacher } from '../brand/BrandIcons';

/**
 * Pokročilá / administrátorská sekce (#/admin): Odborný režim a Učitelský
 * režim. Záměrně oddělené od hlavního rozcestníku, který je pro studenty.
 */
export default function AdminScreen() {
  const { setAuth } = useAppStore();
  const [showTeacher, setShowTeacher] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleTeacherLogin = () => {
    if (!verifyTeacher(username.trim(), password)) {
      setError('Neplatné učitelské přihlášení.');
      return;
    }
    setAuth({ role: 'teacher', username: username.trim(), classId: null });
    setError(null);
    navigate({ screen: AppMode.Instructor });
  };

  return (
    <div className="min-h-screen brand-grid-bg">
      <div className="max-w-3xl mx-auto px-4 py-6 md:py-10">
        <div className="flex items-center justify-between mb-6">
          <HomeButton className="-ml-2" />
          <div className="eyebrow">Pokročilé</div>
        </div>

        <header className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-brand-charcoal">
            Odborný a učitelský režim
          </h1>
          <p className="mt-2 text-sm text-brand-slate">
            Nástroje pro učitele a pokročilé uživatele.
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Odborný režim */}
          <div className="flex flex-col items-center text-center bg-white border-2 border-gray-200 rounded-2xl p-6 gap-2.5">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-charcoal/10 text-brand-charcoal">
              <IconSandbox className="w-7 h-7" />
            </div>
            <h2 className="font-display text-lg font-bold text-brand-charcoal">Odborný režim</h2>
            <p className="text-xs text-brand-slate leading-snug flex-1">
              Parametrický SEIRV sandbox — R₀, kontaktní matice, NPI, vakcinace, varianty a stochastika.
            </p>
            <button
              onClick={() => navigate({ screen: AppMode.Expert })}
              className="w-full min-h-[44px] rounded-xl bg-brand-charcoal text-white text-sm font-bold hover:bg-brand-charcoal/90 transition-colors"
            >
              Otevřít sandbox
            </button>
          </div>

          {/* Učitelský režim */}
          <div className="flex flex-col items-center text-center bg-white border-2 border-gray-200 rounded-2xl p-6 gap-2.5">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-teal-soft text-brand-teal-dark">
              <IconTeacher className="w-7 h-7" />
            </div>
            <h2 className="font-display text-lg font-bold text-brand-charcoal">Učitelský režim</h2>
            {!showTeacher ? (
              <>
                <p className="text-xs text-brand-slate leading-snug flex-1">
                  Tvorba scénářů, spuštění hry pro třídu a generování odkazů.{' '}
                  <span className="font-mono text-[11px] text-gray-400">ucitel / tapir123</span>
                </p>
                <button
                  onClick={() => setShowTeacher(true)}
                  className="w-full min-h-[44px] rounded-xl bg-brand-teal text-white text-sm font-bold hover:bg-brand-teal-dark transition-colors"
                >
                  Přihlásit učitele
                </button>
              </>
            ) : (
              <div className="w-full space-y-2 text-left">
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Uživatelské jméno"
                  className="w-full border border-gray-300 rounded-lg px-3 min-h-[44px] text-sm focus:ring-2 focus:ring-brand-teal outline-none"
                />
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleTeacherLogin()}
                  placeholder="Heslo"
                  type="password"
                  className="w-full border border-gray-300 rounded-lg px-3 min-h-[44px] text-sm focus:ring-2 focus:ring-brand-teal outline-none"
                />
                <button
                  onClick={handleTeacherLogin}
                  className="w-full min-h-[44px] rounded-lg bg-brand-teal text-white text-sm font-bold hover:bg-brand-teal-dark transition-colors"
                >
                  Přihlásit
                </button>
              </div>
            )}
            {error && <p className="text-xs text-brand-red">{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
