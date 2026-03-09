import { useMemo, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import {
  assignDefaultScenario,
  createClassroom,
  exportClassroomResults,
  getTeacherData,
} from '../lib/classroom-db';

function downloadText(filename: string, text: string, mime: string) {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminPanel() {
  const { scenario } = useAppStore();
  const [className, setClassName] = useState('XY');
  const [studentCount, setStudentCount] = useState(27);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [scenarioTag, setScenarioTag] = useState('seminar-1');
  const [refreshKey, setRefreshKey] = useState(0);

  const db = useMemo(() => getTeacherData(), [refreshKey]);
  const selectedClassroom = db.classrooms.find((c) => c.id === selectedClassId) ?? null;

  const attemptsByClass = useMemo(() => {
    const map = new Map<string, typeof db.attempts>();
    db.classrooms.forEach((c) => map.set(c.id, []));
    db.attempts.forEach((a) => {
      const arr = map.get(a.classId);
      if (arr) arr.push(a);
    });
    return map;
  }, [db]);

  const handleCreateClassroom = () => {
    if (!className.trim()) return;
    if (studentCount < 1 || studentCount > 200) return;
    const created = createClassroom(className.trim(), studentCount);
    setSelectedClassId(created.id);
    setRefreshKey((v) => v + 1);
  };

  const handleAssignDefaultScenario = () => {
    if (!selectedClassId) return;
    assignDefaultScenario(selectedClassId, scenario, scenarioTag);
    setRefreshKey((v) => v + 1);
  };

  const handleExportSelected = () => {
    if (!selectedClassId) return;
    const data = exportClassroomResults(selectedClassId);
    if (!data) return;

    downloadText(`${data.filename}.json`, data.json, 'application/json');
    downloadText(`${data.filename}.csv`, data.csv, 'text/csv');
  };

  return (
    <div className="bg-violet-50 border border-violet-200 rounded-lg p-3 space-y-3">
      <h3 className="text-xs font-semibold text-violet-800">Administrace tříd, scénářů a výsledků</h3>

      <div className="grid grid-cols-2 gap-2">
        <input
          className="border border-violet-300 rounded px-2 py-1 text-xs"
          value={className}
          onChange={(e) => setClassName(e.target.value)}
          placeholder="Název třídy"
        />
        <input
          className="border border-violet-300 rounded px-2 py-1 text-xs"
          type="number"
          min={1}
          max={200}
          value={studentCount}
          onChange={(e) => setStudentCount(Number(e.target.value))}
          placeholder="Počet studentů"
        />
      </div>

      <button onClick={handleCreateClassroom} className="w-full text-xs px-3 py-2 bg-violet-600 text-white rounded hover:bg-violet-700">
        Vygenerovat uživatelská jména pro třídu
      </button>

      <div className="space-y-2">
        <label className="text-xs text-violet-800 block">Vybraná třída pro správu scénáře a export</label>
        <select
          className="w-full border border-violet-300 rounded px-2 py-1 text-xs"
          value={selectedClassId}
          onChange={(e) => setSelectedClassId(e.target.value)}
        >
          <option value="">-- vyberte třídu --</option>
          {db.classrooms.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <div className="grid grid-cols-2 gap-2">
          <input
            className="border border-violet-300 rounded px-2 py-1 text-xs"
            value={scenarioTag}
            onChange={(e) => setScenarioTag(e.target.value)}
            placeholder="Označení scénáře"
          />
          <button
            onClick={handleAssignDefaultScenario}
            disabled={!selectedClassId}
            className="text-xs px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
          >
            Nastavit aktuální scénář jako default
          </button>
        </div>

        <button
          onClick={handleExportSelected}
          disabled={!selectedClassId}
          className="w-full text-xs px-3 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:opacity-50"
        >
          Exportovat výsledky třídy (JSON + CSV)
        </button>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {db.classrooms.map((classroom) => {
          const classAttempts = attemptsByClass.get(classroom.id) ?? [];
          return (
            <div key={classroom.id} className="bg-white border border-violet-200 rounded p-2">
              <div className="flex items-center justify-between">
                <div className="text-xs font-medium text-violet-900">{classroom.name}</div>
                <div className="text-[11px] text-violet-600">
                  {classroom.studentCount} studentů | pokusů celkem: {classAttempts.length}
                </div>
              </div>

              <div className="text-[11px] text-violet-700 mt-1">
                Default scénář: {classroom.defaultAssignment?.tag ?? 'nenastaven'}
              </div>

              <div className="mt-2 text-[11px] text-gray-700 space-y-1">
                {classroom.studentUsernames.map((username) => {
                  const attempts = classAttempts.filter((a) => a.username === username);
                  const bestDeaths = attempts.length ? Math.min(...attempts.map((a) => a.totalDeaths)) : null;
                  const lastAttempt = attempts.length
                    ? attempts.slice().sort((a, b) => b.playedAt.localeCompare(a.playedAt))[0]
                    : null;

                  return (
                    <div key={username} className="border-b border-gray-100 pb-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono">{username}</span>
                        <span>pokusů: {attempts.length}</span>
                      </div>
                      <div className="text-[10px] text-gray-600">
                        naposledy: {lastAttempt ? new Date(lastAttempt.playedAt).toLocaleString('cs-CZ') : '-'} | nejlepší úmrtí: {bestDeaths ?? '-'}
                      </div>
                      {lastAttempt && (
                        <div className="text-[10px] text-gray-500">
                          poslední výsledek → peak inf: {lastAttempt.peakInfections}, overflow days: {lastAttempt.overflowDays}, scénář: {lastAttempt.scenarioTag ?? '-'}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {db.classrooms.length === 0 && <p className="text-xs text-violet-700">Zatím není vytvořena žádná třída.</p>}
      {selectedClassroom && (
        <p className="text-[11px] text-violet-800">
          Vybraná třída: <strong>{selectedClassroom.name}</strong>
        </p>
      )}
    </div>
  );
}
