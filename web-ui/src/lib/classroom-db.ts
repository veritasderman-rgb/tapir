export interface TeacherAccount {
  username: string;
  password: string;
}

export interface AppDatabase {
  teacher: TeacherAccount;
}

const DB_KEY = 'tapir-db-v1';

function createDefaultDb(): AppDatabase {
  return {
    teacher: {
      username: 'ucitel',
      password: 'tapir123',
    },
  };
}

export function loadDb(): AppDatabase {
  if (typeof window === 'undefined') return createDefaultDb();

  const raw = localStorage.getItem(DB_KEY);
  if (!raw) {
    const db = createDefaultDb();
    saveDb(db);
    return db;
  }

  try {
    const parsed = JSON.parse(raw) as AppDatabase;
    return {
      teacher: parsed.teacher ?? createDefaultDb().teacher,
    };
  } catch {
    const db = createDefaultDb();
    saveDb(db);
    return db;
  }
}

export function saveDb(db: AppDatabase): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

export function verifyTeacher(username: string, password: string): boolean {
  const db = loadDb();
  return db.teacher.username === username && db.teacher.password === password;
}
