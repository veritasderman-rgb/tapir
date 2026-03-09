import { useAppStore } from '../store/useAppStore';
import { AppMode } from '@tapir/core';
import { VERSION } from '@tapir/core';

export default function Header() {
  const { auth, appMode, setAppMode, sidebarOpen, setSidebarOpen, logout } = useAppStore();

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1 rounded hover:bg-gray-100 lg:hidden"
          aria-label={sidebarOpen ? 'Zavřít panel' : 'Otevřít panel'}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-gray-900">
          Nedovařený tapír
        </h1>
        <span className="text-xs text-gray-400">v{VERSION}</span>
        <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded font-medium">
          SIMULACE
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-600">
          {auth.role === 'teacher' ? `Učitel: ${auth.username}` : auth.role === 'student' ? `Student: ${auth.username}` : 'Test bez ukládání'}
        </span>
        {auth.role === 'teacher' && (
          <select
            value={appMode}
            onChange={(e) => setAppMode(e.target.value as AppMode)}
            className="text-sm border border-gray-300 rounded px-2 py-1"
            aria-label="Režim aplikace"
          >
            <option value={AppMode.Student}>Student</option>
            <option value={AppMode.Instructor}>Instructor</option>
          </select>
        )}
        <button
          onClick={logout}
          className="text-xs px-2 py-1 rounded border border-gray-300 hover:bg-gray-100"
        >
          Odhlásit
        </button>
      </div>
    </header>
  );
}
