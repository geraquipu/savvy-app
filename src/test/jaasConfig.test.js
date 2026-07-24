import { describe, it, expect } from "vitest";
// Même règle que meeting-token : une valeur d'exemple ne doit jamais passer.
const looksReal = (v) => !!v && v.length >= 20 && !/\s/.test(v);
const configured = (appId, kid, pem) =>
  looksReal(appId) && looksReal(kid) && !!pem && pem.includes("BEGIN PRIVATE KEY");

const REAL_APP = "vpaas-magic-cookie-1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d";
const REAL_KID = REAL_APP + "/a1b2c3";
const REAL_PEM = "-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----";

describe("configuration JaaS", () => {
  it("le cas réel de ce matin : les valeurs d'exemple sont refusées", () => {
    expect(configured("tu_app_id", "tu_kid", null)).toBe(false);
    expect(configured("tu_app_id", "tu_kid", REAL_PEM)).toBe(false);
  });
  it("rien de posé → salle publique", () => {
    expect(configured(undefined, undefined, undefined)).toBe(false);
  });
  it("clé privée manquante ou tronquée", () => {
    expect(configured(REAL_APP, REAL_KID, undefined)).toBe(false);
    expect(configured(REAL_APP, REAL_KID, "MIIE...")).toBe(false);
  });
  it("une valeur avec un espace (copier-coller sale) est refusée", () => {
    expect(configured(REAL_APP + " ", REAL_KID, REAL_PEM)).toBe(false);
  });
  it("les vraies clés passent", () => {
    expect(configured(REAL_APP, REAL_KID, REAL_PEM)).toBe(true);
  });
});
