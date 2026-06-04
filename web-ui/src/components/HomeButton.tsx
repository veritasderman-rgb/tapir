import { navigate } from '../lib/route';

interface HomeButtonProps {
  /** Doplňkové třídy pro umístění/vzhled. */
  className?: string;
  /** Zobrazit jen ikonu (pro úzké hlavičky). */
  iconOnly?: boolean;
  /** Volitelné potvrzení před odchodem (rozehraná aktivita). */
  confirm?: boolean;
}

/**
 * Sjednocené tlačítko „zpět na rozcestník" pro herní obrazovky, které
 * nepoužívají globální Header. Touch-friendly (min. 44px výška).
 */
export default function HomeButton({ className = '', iconOnly = false, confirm = false }: HomeButtonProps) {
  const goHome = () => {
    if (confirm && !window.confirm('Vrátit se na rozcestník? Postup zůstane uložený v tomto okně.')) {
      return;
    }
    navigate({ screen: 'hub' });
  };

  return (
    <button
      onClick={goHome}
      aria-label="Zpět na rozcestník"
      title="Zpět na rozcestník"
      className={`inline-flex items-center gap-1.5 min-h-[44px] px-3 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors ${className}`}
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1V10" />
      </svg>
      {!iconOnly && <span>Rozcestník</span>}
    </button>
  );
}
