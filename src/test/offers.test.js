import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { normalizeOffer, offerSubtitle, slotStepFor, MIN_SLOT_MIN } from '../constants/offers';

/**
 * Les données d'une offre (durée, format, prix) sont enregistrées sous des
 * formes historiques différentes : `duree: "15 min"`, `what: "Appel audio
 * 15min"`, `format: "Chat 30min"`. Chaque écran qui les lisait directement
 * réinventait sa propre interprétation — et se trompait.
 *
 * Le bug est revenu trois fois de suite, dans trois écrans différents, parce
 * qu'on corrigeait l'écran signalé sans voir les autres. Ce test vérifie que
 * plus aucun écran ne court-circuite normalizeOffer().
 */

// Racine du code source. Vitest s'exécute à la racine du projet.
const SRC = join(globalThis.process.cwd(), 'src');

function jsxFiles(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) jsxFiles(full, out);
    else if (name.endsWith('.jsx')) out.push(full);
  }
  return out;
}

describe('offres — forme canonique', () => {
  it('relève les durées sous l\'unité minimale', () => {
    expect(normalizeOffer({ duree: '15 min', format: 'audio' }).durationMin).toBe(MIN_SLOT_MIN);
    expect(normalizeOffer({ what: 'Appel audio 15min' }).durationMin).toBe(MIN_SLOT_MIN);
    expect(normalizeOffer({ duree: '1h' }).durationMin).toBe(60);
  });

  it('laisse au livrable écrit son délai (24h n\'est pas une durée d\'entretien)', () => {
    expect(normalizeOffer({ duree: '24h', format: 'doc' }).durationMin).toBe(1440);
  });

  it('annonce la durée comme un plafond, jamais comme un quota', () => {
    expect(offerSubtitle({ duree: '30 min', format: 'video' })).toContain("jusqu'à");
    // sauf pour un document, qui a un délai de livraison
    expect(offerSubtitle({ duree: '24h', format: 'doc' })).not.toContain("jusqu'à");
  });

  it('ne descend jamais sous l\'unité minimale pour les créneaux', () => {
    expect(slotStepFor(15)).toBe(MIN_SLOT_MIN);
    expect(slotStepFor(5)).toBe(MIN_SLOT_MIN);
    expect(slotStepFor(1440)).toBeLessThanOrEqual(240);
  });

  it('aucun écran n\'affiche une durée d\'offre sans passer par normalizeOffer', () => {
    // On cherche `{…offre.duree…}` ou `{…offre.what…}` rendus tels quels.
    // Les durées de RÉSERVATION (session_duration) sont exclues : ce sont des
    // faits passés, pas ce qu'on vend aujourd'hui.
    const raw = /\{[^{}]*\b\w+\.(duree|what)\b[^{}]*\}/g;
    const offenders = [];

    for (const file of jsxFiles(SRC)) {
      if (file.includes('/test/')) continue;
      const lines = readFileSync(file, 'utf8').split('\n');
      lines.forEach((line, i) => {
        const t = line.trim();
        if (t.startsWith('//') || t.startsWith('*')) return;
        for (const m of line.matchAll(raw)) {
          const frag = m[0];
          if (/normalizeOffer|offerSubtitle|parseDuration|durationCeiling/.test(frag)) continue;
          // duree d'une réservation déjà passée : légitime
          if (/\b(s|r|b|nextSession|session)\.duree\b/.test(frag)) continue;
          offenders.push(`${file.split('/src/')[1]}:${i + 1} → ${frag.slice(0, 70)}`);
        }
      });
    }

    expect(offenders, `Passer par normalizeOffer() :\n${offenders.join('\n')}`).toEqual([]);
  });
});
