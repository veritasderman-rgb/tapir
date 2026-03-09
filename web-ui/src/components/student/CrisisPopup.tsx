import { useGameStore } from '../../store/gameStore';

const VARIANT_STYLES: Record<string, { bg: string; border: string; icon: string; headerBg: string }> = {
  news: { bg: 'bg-blue-50', border: 'border-blue-300', icon: '📰', headerBg: 'bg-blue-600' },
  warning: { bg: 'bg-amber-50', border: 'border-amber-300', icon: '⚠️', headerBg: 'bg-amber-600' },
  success: { bg: 'bg-green-50', border: 'border-green-300', icon: '✅', headerBg: 'bg-green-600' },
  crisis: { bg: 'bg-red-50', border: 'border-red-300', icon: '🚨', headerBg: 'bg-red-700' },
};

export default function CrisisPopup() {
  const { popupQueue, dequeuePopup, enterCrisisStaff } = useGameStore();

  if (popupQueue.length === 0) return null;

  const popup = popupQueue[0];
  const style = VARIANT_STYLES[popup.variant] ?? VARIANT_STYLES.news;

  const handleAction = () => {
    if (popup.action === 'enterCrisisStaff') {
      enterCrisisStaff();
    }
    dequeuePopup();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50" role="dialog" aria-modal="true">
      <div className={`${style.bg} ${style.border} border-2 rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden`}>
        {/* Header */}
        <div className={`${style.headerBg} px-4 py-3 flex items-center gap-2`}>
          <span className="text-xl">{style.icon}</span>
          <h2 className="text-white font-bold text-sm flex-1">{popup.title}</h2>
          {popupQueue.length > 1 && (
            <span className="text-white/70 text-xs">+{popupQueue.length - 1}</span>
          )}
        </div>

        {/* Body */}
        <div className="p-4">
          <div className="text-sm text-gray-800 whitespace-pre-line leading-relaxed">
            {popup.body}
          </div>
        </div>

        {/* Action */}
        <div className="px-4 pb-4">
          <button
            onClick={handleAction}
            className={`w-full py-2.5 rounded-lg font-bold text-sm text-white transition-colors ${
              popup.variant === 'crisis'
                ? 'bg-red-600 hover:bg-red-700'
                : popup.variant === 'success'
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {popup.actionLabel ?? 'Pokračovat'}
          </button>
        </div>
      </div>
    </div>
  );
}
