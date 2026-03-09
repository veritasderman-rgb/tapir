import { useAppStore } from '../store/useAppStore';
import { exportCSV, exportJSON, getWatermarkText } from '@tapir/core';

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadBlob(blob: Blob, filename: string) {
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

  const handlePNG = () => {
    // Find chart containers and export with watermark
    const chartContainer = document.querySelector('.recharts-wrapper');
    if (!chartContainer) {
      alert('Žádný graf k exportu. Spusťte simulaci.');
      return;
    }

    const svgEl = chartContainer.querySelector('svg');
    if (!svgEl) return;

    const canvas = document.createElement('canvas');
    const bbox = svgEl.getBoundingClientRect();
    const scale = 2; // retina
    canvas.width = bbox.width * scale;
    canvas.height = (bbox.height + 80) * scale; // extra space for watermark
    const ctx = canvas.getContext('2d')!;
    ctx.scale(scale, scale);

    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, bbox.width, bbox.height + 80);

    // Draw SVG
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const img = new Image();
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx.drawImage(img, 0, 0, bbox.width, bbox.height);
      URL.revokeObjectURL(svgUrl);

      // Draw watermark
      const watermark = getWatermarkText(result);
      ctx.fillStyle = '#991b1b';
      ctx.font = '10px monospace';
      watermark.forEach((line, i) => {
        ctx.fillText(line, 10, bbox.height + 15 + i * 13);
      });

      // Semi-transparent diagonal "SIMULACE" watermark
      ctx.save();
      ctx.translate(bbox.width / 2, bbox.height / 2);
      ctx.rotate(-Math.PI / 6);
      ctx.fillStyle = 'rgba(239, 68, 68, 0.08)';
      ctx.font = 'bold 60px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('SIMULACE', 0, 0);
      ctx.restore();

      canvas.toBlob((blob) => {
        if (blob) {
          downloadBlob(blob, `${scenario.name.replace(/\s+/g, '_')}_chart.png`);
        }
      }, 'image/png');
    };

    img.src = svgUrl;
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

      <button
        onClick={handlePNG}
        className="w-full text-xs px-3 py-2 bg-orange-50 text-orange-700 rounded hover:bg-orange-100 border border-orange-200"
      >
        Export PNG (graf s watermarkem)
      </button>

      <div className="text-xs text-gray-400 mt-1">
        Exporty obsahují disclaimer, parametry, seed, verzi a časové razítko.
        PNG obsahuje vodoznak „SIMULACE".
      </div>
    </div>
  );
}
