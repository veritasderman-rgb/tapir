export interface TeacherAccount {
  username: string;
  password: string;
}

export interface Classroom {
  id: string;
  name: string;
  studentCount: number;
  studentUsernames: string[];
  createdAt: string;
}

export interface StudentAttempt {
  id: string;
  username: string;
  classId: string;
  playedAt: string;
  totalDeaths: number;
  peakInfections: number;
  overflowDays: number;
}

export interface AppDatabase {
  teacher: TeacherAccount;
  classrooms: Classroom[];
  attempts: StudentAttempt[];
}

const DB_KEY = 'tapir-db-v1';

function createDefaultDb(): AppDatabase {
  return {
    teacher: {
      username: 'ucitel',
      password: 'tapir123',
    },
    classrooms: [],
    attempts: [],
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
      classrooms: parsed.classrooms ?? [],
      attempts: parsed.attempts ?? [],
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

export function findStudentClass(username: string): Classroom | null {
  const db = loadDb();
  return db.classrooms.find((c) => c.studentUsernames.includes(username)) ?? null;
}

export function createClassroom(name: string, studentCount: number): Classroom {
  const db = loadDb();
  const id = `class-${crypto.randomUUID()}`;
  const studentUsernames = generateStudentUsernames(name, studentCount, db.classrooms);
  const classroom: Classroom = {
    id,
    name,
    studentCount,
    studentUsernames,
    createdAt: new Date().toISOString(),
  };

  db.classrooms.unshift(classroom);
  saveDb(db);
  return classroom;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

function generateStudentUsernames(name: string, count: number, existing: Classroom[]): string[] {
  const prefix = slugify(name).slice(0, 6) || 'trida';
  const taken = new Set(existing.flatMap((c) => c.studentUsernames));
  const usernames: string[] = [];

  let i = 1;
  while (usernames.length < count) {
    const candidate = `${prefix}-${String(i).padStart(2, '0')}`;
    if (!taken.has(candidate)) {
      usernames.push(candidate);
      taken.add(candidate);
    }
    i += 1;
  }

  return usernames;
}

export function saveAttempt(attempt: StudentAttempt): void {
  const db = loadDb();
  db.attempts.unshift(attempt);
  saveDb(db);
}

export function getTeacherData(): AppDatabase {
  return loadDb();
}
