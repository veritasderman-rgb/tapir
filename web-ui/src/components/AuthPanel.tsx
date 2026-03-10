import { useState } from 'react';
import { AppMode, defaultScenario } from '@tapir/core';
import { findStudentClass, verifyTeacher } from '../lib/classroom-db';
import { useAppStore } from '../store/useAppStore';

export default function AuthPanel() {
  const { setAuth, setAppMode, setScenario } = useAppStore();
  const [teacherUsername, setTeacherUsername] = useState('');
  const [teacherPassword, setTeacherPassword] = useState('');
  const [studentUsername, setStudentUsername] = useState('');
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

  const handleStudentLogin = () => {
    const username = studentUsername.trim();
    if (!username) {
      setError('Zadejte studentské uživatelské jméno.');
      return;
    }

    const studentClass = findStudentClass(username);
    if (!studentClass) {
      setError('Studentské jméno nebylo nalezeno.');
      return;
    }

    setAuth({ role: 'student', username, classId: studentClass.id });
    setAppMode(AppMode.Student);
    setScenario(studentClass.defaultAssignment?.scenario ?? defaultScenario());
    setError(null);
  };

  const handleGuestMode = () => {
    setAuth({ role: 'guest', username: 'test-bez-ulozeni', classId: null });
    setAppMode(AppMode.Student);
    setScenario(defaultScenario());
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl grid md:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
          <h2 className="font-semibold text-gray-900">Učitel — administrace</h2>
          <p className="text-xs text-gray-500">Výchozí demo účet: <code>ucitel / tapir123</code></p>
          <input
            value={teacherUsername}
            onChange={(e) => setTeacherUsername(e.target.value)}
            placeholder="Uživatelské jméno"
            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
          />
          <input
            value={teacherPassword}
            onChange={(e) => setTeacherPassword(e.target.value)}
            placeholder="Heslo"
            type="password"
            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
          />
          <button onClick={handleTeacherLogin} className="w-full bg-indigo-600 text-white rounded py-2 text-sm hover:bg-indigo-700">
            Přihlásit učitele
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
          <h2 className="font-semibold text-gray-900">Student</h2>
          <p className="text-xs text-gray-500">Přihlášení anonymním vygenerovaným jménem od učitele.</p>
          <input
            value={studentUsername}
            onChange={(e) => setStudentUsername(e.target.value)}
            placeholder="Např. tridaa-01"
            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
          />
          <button onClick={handleStudentLogin} className="w-full bg-blue-600 text-white rounded py-2 text-sm hover:bg-blue-700">
            Přihlásit studenta
          </button>
          <button onClick={handleGuestMode} className="w-full bg-gray-100 text-gray-800 rounded py-2 text-sm hover:bg-gray-200 border border-gray-300">
            Krizový štáb — vstup
          </button>
        </div>
      </div>

      {error && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-red-100 border border-red-300 text-red-800 px-4 py-2 rounded text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
