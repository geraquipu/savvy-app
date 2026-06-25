import { describe, it, expect } from 'vitest';
import { getCountdown, EXPERTS } from '../constants/data';

describe('getCountdown', () => {
  it('returns null for undefined', () => {
    expect(getCountdown(undefined)).toBeNull();
  });

  it('returns En cours for 0 hours', () => {
    const r = getCountdown(0);
    expect(r.label).toContain('En cours');
    expect(r.pulse).toBe(true);
  });

  it('returns red label for < 1h', () => {
    const r = getCountdown(0.5);
    expect(r.color).toBe('#EF4444');
    expect(r.pulse).toBe(true);
  });

  it('returns Aujourd\'hui for < 24h', () => {
    const r = getCountdown(10);
    expect(r.label).toBe('Aujourd\'hui');
  });

  it('returns Demain for 24-48h', () => {
    const r = getCountdown(36);
    expect(r.label).toBe('Demain');
  });

  it('returns null for > 48h', () => {
    expect(getCountdown(72)).toBeNull();
  });
});

describe('EXPERTS data', () => {
  it('each expert has required fields', () => {
    EXPERTS.forEach(e => {
      expect(e.id).toBeDefined();
      expect(e.name).toBeTruthy();
      expect(e.initials).toBeTruthy();
      expect(Array.isArray(e.langs)).toBe(true);
      expect(Array.isArray(e.phases ?? e.offres ?? [])).toBe(true);
    });
  });
});
