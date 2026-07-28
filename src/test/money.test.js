import { describe, it, expect } from "vitest";
import {
  expertPayout, savvyCut, EXPERT_SHARE,
  sessionHeld, revenueSettled, splitRevenue,
} from "../constants/config.js";

const H = 3600000;
const MIN = 60000;

// Une réservation payée dont la session commence à `offsetMs` de maintenant.
const bk = (offsetMs, extra = {}) => ({
  paid: true,
  date_session: new Date(Date.now() + offsetMs).toISOString(),
  ...extra,
});

describe("répartition de l'argent — expertPayout / savvyCut", () => {
  it("80 % à l'expert, arrondi à l'euro", () => {
    expect(expertPayout(20)).toBe(16);
    expect(expertPayout(25)).toBe(20);
    expect(expertPayout(350)).toBe(280);
    expect(expertPayout(10)).toBe(8);
  });

  it("le partage tient sur le tarif exact (constante = 0.8)", () => {
    expect(EXPERT_SHARE).toBe(0.8);
  });

  it("INVARIANT : expert + Savvy = prix client, jamais un centime perdu ni créé", () => {
    // Le plus important : l'arrondi ne doit ni faire disparaître ni inventer
    // de l'argent. On le vérifie sur toute une plage, arrondis inclus.
    for (let p = 0; p <= 500; p++) {
      expect(expertPayout(p) + savvyCut(p)).toBe(p);
    }
  });

  it("valeurs sales : null, undefined, texte → 0, jamais NaN", () => {
    for (const v of [null, undefined, "", "abc", NaN]) {
      expect(expertPayout(v)).toBe(0);
      expect(savvyCut(v)).toBe(0);
    }
  });
});

describe("une session est-elle « tenue » ? (sessionHeld)", () => {
  const past = -100 * MIN;   // commencée il y a 100 min (> 90)
  const soon = 30 * MIN;     // dans 30 min

  it("payée + terminée depuis plus de 90 min → tenue", () => {
    expect(sessionHeld(bk(past))).toBe(true);
  });
  it("session encore à venir → pas tenue", () => {
    expect(sessionHeld(bk(soon))).toBe(false);
  });
  it("juste finie (moins de 90 min) → pas encore tenue", () => {
    expect(sessionHeld(bk(-30 * MIN))).toBe(false);
  });
  it("non payée → jamais tenue, même si l'heure est passée", () => {
    expect(sessionHeld(bk(past, { paid: false }))).toBe(false);
  });
  it("remboursement demandé ou fait → pas tenue (l'argent n'est plus dû)", () => {
    expect(sessionHeld(bk(past, { refund_status: "requested" }))).toBe(false);
    expect(sessionHeld(bk(past, { refund_status: "done" }))).toBe(false);
  });
});

describe("le revenu est-il acquis ? (revenueSettled — délai de réclamation 48 h)", () => {
  it("tenue mais dans les 48 h → pas encore acquis (le client peut réclamer)", () => {
    expect(revenueSettled(bk(-100 * MIN))).toBe(false);
  });
  it("tenue depuis plus de 48 h → acquis", () => {
    expect(revenueSettled(bk(-49 * H))).toBe(true);
  });
  it("pas tenue → pas acquis", () => {
    expect(revenueSettled(bk(30 * MIN))).toBe(false);
  });
});

describe("splitRevenue — les trois états de l'argent", () => {
  it("classe chaque réservation dans le bon seau et n'en perd aucune", () => {
    const bookings = [
      bk(48 * H),         // à venir
      bk(-100 * MIN),     // tenue, délai en cours → enCours
      bk(-49 * H),        // acquis
      bk(-49 * H, { paid: false }), // non payée → ignorée partout
    ];
    const { aVenir, enCours, acquis } = splitRevenue(bookings);
    expect(aVenir).toHaveLength(1);
    expect(enCours).toHaveLength(1);
    expect(acquis).toHaveLength(1);
    // La non payée n'apparaît dans aucun seau.
    expect(aVenir.length + enCours.length + acquis.length).toBe(3);
  });

  it("liste vide ou invalide → trois seaux vides, jamais d'erreur", () => {
    for (const v of [[], null, undefined]) {
      const r = splitRevenue(v);
      expect(r.aVenir).toEqual([]);
      expect(r.enCours).toEqual([]);
      expect(r.acquis).toEqual([]);
    }
  });
});
