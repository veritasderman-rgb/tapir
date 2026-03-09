import { useMemo, useState } from 'react';
import { createClassroom, getTeacherData } from '../lib/classroom-db';

export default function AdminPanel() {
  const [className, setClassName] = useState('XY');
  const [studentCount, setStudentCount] = useState(27);
  const [refreshKey, setRefreshKey] = useState(0);

  const db = useMemo(() => getTeacherData(), [refreshKey]);

  const statsByStudent = useMemo(() => {
    const map = new Map<string, { attempts: number; bestDeaths: number; bestPeak: number }>();
    db.attempts.forEach((a) => {
      const prev = map.get(a.username);
      if (!prev) {
        map.set(a.username, { attempts: 1, bestDeaths: a.totalDeaths, bestPeak: a.peakInfections });
        return;
      }
      map.set(a.username, {
        attempts: prev.attempts + 1,
        bestDeaths: Math.min(prev.bestDeaths, a.totalDeaths),
        bestPeak: Math.min(prev.bestPeak, a.peakInfections),
      });
    });
    return map;
  }, [db]);

  const handleCreateClassroom = () => {
    if (!className.trim()) return;
    if (studentCount < 1 || studentCount > 200) return;
    createClassroom(className.trim(), studentCount);
    setRefreshKey((v) => v + 1);
  };

  return (
    <div className="bg-violet-50 border border-violet-200 rounded-lg p-3 space-y-3">
      <h3 className="text-xs font-semibold text-violet-800">Administrace tříd a studentů</h3>

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

      <button
        onClick={handleCreateClassroom}
        className="w-full text-xs px-3 py-2 bg-violet-600 text-white rounded hover:bg-violet-700"
      >
        Vygenerovat uživatelská jména pro třídu
      </button>

      <div className="space-y-2 max-h-72 overflow-y-auto">
        {db.classrooms.map((classroom) => (
          <div key={classroom.id} className="bg-white border border-violet-200 rounded p-2">
            <div className="flex items-center justify-between">
              <div className="text-xs font-medium text-violet-900">{classroom.name}</div>
              <div className="text-[11px] text-violet-600">{classroom.studentCount} studentů</div>
            </div>

            <div className="mt-2 text-[11px] text-gray-600">
              {classroom.studentUsernames.map((username) => {
                const stats = statsByStudent.get(username);
                return (
                  <div key={username} className="flex items-center justify-between border-b border-gray-100 py-0.5">
                    <span className="font-mono">{username}</span>
                    <span>
                      pokusů: {stats?.attempts ?? 0} | best úmrtí: {stats?.bestDeaths ?? '-'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {db.classrooms.length === 0 && (
        <p className="text-xs text-violet-700">Zatím není vytvořena žádná třída.</p>
      )}
    </div>
  );
}
