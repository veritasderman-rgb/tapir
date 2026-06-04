import { describe, it, expect } from 'vitest';
import { AppMode } from '@tapir/core';
import { parseLocation, buildPath, type Route } from './route';

describe('parseLocation', () => {
  it('prázdný hash → rozcestník', () => {
    expect(parseLocation('')).toEqual({ screen: 'hub', roomCode: undefined });
    expect(parseLocation('#/')).toEqual({ screen: 'hub', roomCode: undefined });
  });

  it('mapuje slugy na režimy', () => {
    expect(parseLocation('#/sandbox').screen).toBe(AppMode.Expert);
    expect(parseLocation('#/ucitel').screen).toBe(AppMode.Instructor);
    expect(parseLocation('#/prirucka').screen).toBe(AppMode.Handbook);
    expect(parseLocation('#/hra/osacka').screen).toBe(AppMode.OsackaHorecka);
    expect(parseLocation('#/hra/oyster-bay').screen).toBe(AppMode.TyfovaMary);
    expect(parseLocation('#/hra/krizovy-stab').screen).toBe(AppMode.CrisisStaff);
  });

  it('neznámý slug → rozcestník', () => {
    expect(parseLocation('#/neexistuje').screen).toBe('hub');
  });

  it('čte ?s= a ?room= z hashe', () => {
    const r = parseLocation('#/hra/krizovy-stab?s=ABC&room=TAPIR-1');
    expect(r.screen).toBe(AppMode.CrisisStaff);
    expect(r.scenarioParam).toBe('ABC');
    expect(r.roomCode).toBe('TAPIR-1');
  });

  it('rozpozná legacy #game= a označí legacy', () => {
    const r = parseLocation('#game=XYZ');
    expect(r).toEqual({ screen: AppMode.CrisisStaff, scenarioParam: 'XYZ', legacy: true });
  });

  it('rozpozná legacy ?game= ze search', () => {
    const r = parseLocation('', '?game=XYZ');
    expect(r.screen).toBe(AppMode.CrisisStaff);
    expect(r.scenarioParam).toBe('XYZ');
    expect(r.legacy).toBe(true);
  });
});

describe('buildPath ↔ parseLocation round-trip', () => {
  it('hub', () => {
    expect(buildPath({ screen: 'hub' })).toBe('/');
  });

  it('zachová base64 scénář se znaky +, /, = (URL kódování)', () => {
    const scenarioParam = 'aGVsbG8+d29ybGQ/Zm9v==';
    const route: Route = { screen: AppMode.CrisisStaff, scenarioParam };
    const path = buildPath(route);
    // Round-trip: z buildPath zpět přes parseLocation musí vyjít stejný base64.
    const parsed = parseLocation('#' + path);
    expect(parsed.screen).toBe(AppMode.CrisisStaff);
    expect(parsed.scenarioParam).toBe(scenarioParam);
  });

  it('zachová room kód', () => {
    const path = buildPath({ screen: AppMode.OsackaHorecka, roomCode: 'TAPIR-7Q2K' });
    expect(parseLocation('#' + path).roomCode).toBe('TAPIR-7Q2K');
  });
});
