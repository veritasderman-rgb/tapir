import { useAppStore } from '../store/useAppStore';
import { exportCSV, exportJSON } from '@tapir/core';

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ExportPanel() {
  const { result, scenario } = useAppStore();

  if (!result) {
    return (
      <div className="text-xs text-gray-400">Spusťte simulaci pro export dat.</div>
    );
  }

  const handleCSV = () => {
    const csv = exportCSV(result);
    downloadFile(csv, `${scenario.name.replace(/\s+/g, '_')}_export.csv`, 'text/csv');
  };

  const handleJSON = () => {
    const json = exportJSON(result);
    downloadFile(json, `${scenario.name.replace(/\s+/g, '_')}_scenario.json`, 'application/json');
  };

  return (
    <div className="space-y-3">
      <span className="text-xs font-semibold text-gray-600">Export</span>

      <button
        onClick={handleCSV}
        className="w-full text-xs px-3 py-2 bg-green-50 text-green-700 rounded hover:bg-green-100 border border-green-200"
      >
        Export CSV (denní data + metadata)
      </button>

      <button
        onClick={handleJSON}
        className="w-full text-xs px-3 py-2 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 border border-blue-200"
      >
        Export JSON (kompletní scénář)
      </button>

      <div className="text-xs text-gray-400 mt-1">
        Exporty obsahují disclaimer, parametry, seed, verzi a časové razítko.
      </div>
    </div>
  );
}
