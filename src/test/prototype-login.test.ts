import { beforeEach, describe, expect, it } from "vitest";
import { enterPrototype, getPrototypePreference, savePrototypePreference } from "@/lib/prototype-login";
import { getDemoAccount, getDemoSessionInfo, registerDemoAccount } from "@/lib/demo";

describe("destination-based prototype login", () => {
  beforeEach(() => localStorage.clear());

  it("accepts two-character display values for Gym Account and opens the owner dashboard", () => {
    expect(enterPrototype({ destination: "gym", name: "zy", email: "zy" }, false)).toBe("/dashboard");
    expect(getDemoSessionInfo()).toEqual({ kind: "owner", name: "zy", email: "zy", directAccess: true });
  });

  it("allows blank Client / Individual entry", () => {
    expect(enterPrototype({ destination: "individual", name: "", email: "" }, false)).toBe("/member");
    expect(getDemoSessionInfo()?.kind).toBe("individual");
  });

  it("allows blank Dashboard entry", () => {
    expect(enterPrototype({ destination: "dashboard", name: "", email: "" }, false)).toBe("/super-admin");
    expect(getDemoSessionInfo()?.kind).toBe("super");
  });

  it("ignores an existing account role and pending subscription", () => {
    registerDemoAccount("Previous owner", "ab", "old", "gym");
    expect(enterPrototype({ destination: "individual", name: "New client", email: "ab" }, false)).toBe("/member");
    expect(getDemoAccount()).toBeNull();
    expect(enterPrototype({ destination: "gym", name: "Owner", email: "ab" }, false)).toBe("/dashboard");
    expect(getDemoAccount()).toBeNull();
  });

  it("remembers only destination and display details", () => {
    const details = { destination: "dashboard" as const, name: "zy", email: "xy" };
    enterPrototype(details, true);
    expect(getPrototypePreference()).toEqual(details);
    expect(getDemoSessionInfo()?.name).toBe("zy");
    expect(localStorage.getItem("ironhaus-prototype-login-preference")).not.toContain("password");
  });

  it("clears the preference when Remember Me is disabled without ending demo access", () => {
    const details = { destination: "gym" as const, name: "ab", email: "cd" };
    enterPrototype(details, true);
    savePrototypePreference(details, false);
    expect(getPrototypePreference()).toBeNull();
    expect(getDemoSessionInfo()?.kind).toBe("owner");
  });
});