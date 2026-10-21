import { describe, expect, it } from "vitest";
import { initialState } from "@/lib/store";
import { deleteTrainerProfile, updateTrainerProfile } from "@/lib/trainer-profiles";
import { defaultSchedule } from "@/lib/gym-updates";

describe("gym trainer profiles", () => {
  it("updates profile fields without changing the weekly schedule or other trainers", () => {
    const base = initialState.trainers[0];
    if (!base) throw new Error("Missing trainer fixture");
    const rows = [{ ...base, schedule: defaultSchedule() }, ...initialState.trainers.slice(1)];
    const next = updateTrainerProfile(rows, base.id, { name: "Coach Updated", specialty: "Strength", phone: "01012345678", image: "data:image/png;base64,test" });
    expect(next[0]).toMatchObject({ name: "Coach Updated", specialty: "Strength", phone: "01012345678", image: "data:image/png;base64,test", schedule: rows[0]?.schedule });
    expect(next.slice(1)).toEqual(rows.slice(1));
  });
  it("deletes only the target trainer from the supplied gym records", () => {
    const rows = structuredClone(initialState.trainers);
    const target = rows[0];
    if (!target) throw new Error("Missing trainer fixture");
    expect(deleteTrainerProfile(rows, target.id)).toEqual(rows.slice(1));
    expect(initialState.trainers).toHaveLength(rows.length);
  });
  it("rejects blank profile values and missing gym trainers", () => {
    const profile = { name: " ", specialty: "Strength", phone: "01012345678", image: "" };
    expect(() => updateTrainerProfile(initialState.trainers, "missing", profile)).toThrow();
    expect(() => updateTrainerProfile([], "missing", { ...profile, name: "Coach" })).toThrow("Trainer no longer exists in this gym");
  });
});