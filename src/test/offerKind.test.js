import { describe, it, expect } from "vitest";
import { normalizeOffer, normalizeKind } from "../constants/offers.js";

describe("type d'offre", () => {
  it("les offres existantes deviennent des sessions, sans migration", () => {
    expect(normalizeOffer({ name:"Conseil", price:25 }).kind).toBe("session");
    expect(normalizeOffer({ name:"X", price:25, kind:"nimporte quoi" }).kind).toBe("session");
  });

  it("un parcours garde son contenu", () => {
    const o = normalizeOffer({
      name:"Choisir ton équipement", price:400, kind:"parcours",
      outcome:"Tu sauras quelle machine acheter",
      sessionsIncluded:3, deliverables:"comparatif écrit", durationWeeks:4,
    });
    expect(o.kind).toBe("parcours");
    expect(o.sessionsIncluded).toBe(3);
    expect(o.durationWeeks).toBe(4);
    expect(o.outcome).toBe("Tu sauras quelle machine acheter");
  });

  it("un parcours sans détails reçoit des valeurs sensées, jamais NaN", () => {
    const o = normalizeOffer({ name:"P", price:300, kind:"parcours" });
    expect(o.sessionsIncluded).toBe(3);
    expect(o.durationWeeks).toBe(4);
  });

  it("une session ne porte pas de champs de parcours", () => {
    const o = normalizeOffer({ name:"S", price:20, sessionsIncluded:9, durationWeeks:6 });
    expect(o.sessionsIncluded).toBeNull();
    expect(o.durationWeeks).toBeNull();
    expect(o.deliverables).toBe("");
  });

  it("normalizeKind ne renvoie jamais une valeur inconnue", () => {
    for (const v of [null, undefined, "", 0, "PARCOURS", "session"]) {
      expect(["session","parcours"]).toContain(normalizeKind(v));
    }
    expect(normalizeKind("PARCOURS")).toBe("parcours");
  });
});
