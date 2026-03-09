import type { ScenarioConfig } from '@tapir/core';

export interface TeacherAccount {
  username: string;
  password: string;
}

export interface ScenarioAssignment {
  tag: string;
  scenario: ScenarioConfig;
  assignedAt: string;
}

export interface Classroom {
  id: string;
  name: string;
  studentCount: number;
  studentUsernames: string[];
  createdAt: string;
  defaultAssignment?: ScenarioAssignment;
}

export interface StudentAttempt {
  id: string;
  username: string;
  classId: string;
  playedAt: string;
  totalDeaths: number;
  peakInfections: number;
  overflowDays: number;
  scenarioTag?: string;
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
      classrooms: (parsed.classrooms ?? []).map((c) => ({ ...c })),
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

export function getClassroomById(classId: string): Classroom | null {
  const db = loadDb();
  return db.classrooms.find((c) => c.id === classId) ?? null;
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

export function assignDefaultScenario(classId: string, scenario: ScenarioConfig, tag: string): boolean {
  const db = loadDb();
  const classroom = db.classrooms.find((c) => c.id === classId);
  if (!classroom) return false;

  classroom.defaultAssignment = {
    tag: tag.trim() || 'bez-oznaceni',
    scenario,
    assignedAt: new Date().toISOString(),
  };

  saveDb(db);
  return true;
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

export function exportClassroomResults(classId: string): { filename: string; json: string; csv: string } | null {
  const db = loadDb();
  const classroom = db.classrooms.find((c) => c.id === classId);
  if (!classroom) return null;

  const attempts = db.attempts
    .filter((a) => a.classId === classId)
    .sort((a, b) => a.playedAt.localeCompare(b.playedAt));

  const payload = {
    exportedAt: new Date().toISOString(),
    classroom,
    attempts,
  };

  const csvLines = [
    'username,playedAt,scenarioTag,attemptId,totalDeaths,peakInfections,overflowDays',
    ...attempts.map((a) => [
      a.username,
      a.playedAt,
      a.scenarioTag ?? '',
      a.id,
      a.totalDeaths,
      a.peakInfections,
      a.overflowDays,
    ].join(',')),
  ];

  return {
    filename: `results-${classroom.name.replace(/\s+/g, '_')}`,
    json: JSON.stringify(payload, null, 2),
    csv: csvLines.join('\n'),
  };
}
