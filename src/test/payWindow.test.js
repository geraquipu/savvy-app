import { describe, it, expect } from "vitest";
import { payWindow } from "../constants/config.js";
const H = 3600000;
describe("payWindow", () => {
  const now = Date.now();
  it("ouvert bien avant la session", () => {
    expect(payWindow({ startTs: now + 48*H }, now).canPay).toBe(true);
  });
  it("fermé 2 h avant", () => {
    const r = payWindow({ startTs: now + 1*H }, now);
    expect(r.canPay).toBe(false); expect(r.reason).toBe("tooLate");
  });
  it("le cas de German : session passée depuis 1 h", () => {
    const r = payWindow({ startTs: now - 1.2*H }, now);
    expect(r.canPay).toBe(false); expect(r.reason).toBe("passed");
  });
  it("échéance dépassée même si la session est loin", () => {
    const r = payWindow({ startTs: now + 72*H, pay_deadline: new Date(now - 1*H).toISOString() }, now);
    expect(r.canPay).toBe(false); expect(r.reason).toBe("deadline");
  });
  it("accepte date_session comme startTs", () => {
    expect(payWindow({ date_session: new Date(now + 48*H).toISOString() }, now).canPay).toBe(true);
  });
});
