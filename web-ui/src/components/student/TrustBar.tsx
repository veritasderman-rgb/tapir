import { useMemo } from 'react';

interface TrustBarProps {
  label: string;
  value: number;
}

export default function TrustBar({ label, value }: TrustBarProps) {
  const percentage = Math.max(0, Math.min(100, value));

  const status = useMemo(() => {
    if (percentage > 80) return { label: 'Vynikající', color: 'bg-green-500', text: 'text-green-600' };
    if (percentage > 60) return { label: 'Dobrá', color: 'bg-emerald-500', text: 'text-emerald-600' };
    if (percentage > 40) return { label: 'Stabilní', color: 'bg-blue-500', text: 'text-blue-600' };
    if (percentage > 20) return { label: 'Nízká', color: 'bg-orange-500', text: 'text-orange-600' };
    return { label: 'Kritická', color: 'bg-red-600', text: 'text-red-600' };
  }, [percentage]);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-3 shadow-sm">
      <div className="flex justify-between items-end mb-1.5">
        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
        <div className="text-right">
          <span className={`text-[9px] font-black uppercase tracking-tighter mr-2 ${status.text}`}>
            {status.label}
          </span>
          <span className="text-xs font-black text-gray-900">{Math.round(percentage)}%</span>
        </div>
      </div>
      <div className="w-full bg-gray-50 rounded-full h-2 overflow-hidden border border-gray-100/50">
        <div
          className={`h-full transition-all duration-1000 ${status.color} ${percentage < 20 ? 'animate-pulse' : ''}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
