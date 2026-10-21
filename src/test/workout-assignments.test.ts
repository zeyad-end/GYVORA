import { beforeEach, describe, expect, it } from "vitest";
import { setDemoSession, sendDemoAssignment, respondDemoAssignment, pendingDemoAssignments, getDemoState, demoUserId, writeDemoGym, readDemoGym } from "@/lib/demo";

const program = { id: "p1", name: "Leg Day", trainer: "", notes: "", exercises: [{ name: "Squat", sets: 5, reps: "5" }] };
describe("workout assignments", () => {
  beforeEach(() => {
    const g = readDemoGym("demo-gym", true);
    writeDemoGym("demo-gym", g);
    setDemoSession("owner", "gym email");
  });
  it("sends once per request key to a member of the gym only", () => {
    const m = readDemoGym("demo-gym", true).members[0]!;
    const a = sendDemoAssignment({ requestKey: "k1", gymId: "demo-gym", gymName: "IRONHAUS", memberId: m.id, program });
    sendDemoAssignment({ requestKey: "k1", gymId: "demo-gym", gymName: "IRONHAUS", memberId: m.id, program });
    expect(getDemoState().assignments.filter(x => x.requestKey === "k1")).toHaveLength(1);
    expect(a.recipientId).toBe(m.clientId ?? demoUserId(m.email));
    expect(() => sendDemoAssignment({ requestKey: "k2", gymId: "demo-gym", gymName: "x", memberId: "M-9999", program })).toThrow();
  });
  it("persists the chosen trainer attribution in the notification and independent client copy", () => {
    const m = readDemoGym("demo-gym", true).members[0];
    if (!m) throw new Error("Missing member fixture");
    const a = sendDemoAssignment({ requestKey: "attribution", gymId: "demo-gym", gymName: "IRONHAUS", memberId: m.id, program: { ...program, trainer: "Coach Manual" } });
    expect(getDemoState().assignments.find((row) => row.id === a.id)?.program.trainer).toBe("Coach Manual");
    setDemoSession("individual", m.email);
    respondDemoAssignment(a.id, true);
    expect(getDemoState().programs[0]?.definition.trainer).toBe("Coach Manual");
  });
  it("only the recipient sees it; save makes an independent copy, delete saves nothing", () => {
    const m = readDemoGym("demo-gym", true).members[1]!;
    const a = sendDemoAssignment({ requestKey: "k3", gymId: "demo-gym", gymName: "IRONHAUS", memberId: m.id, program });
    const b = sendDemoAssignment({ requestKey: "k4", gymId: "demo-gym", gymName: "IRONHAUS", memberId: m.id, program });
    expect(pendingDemoAssignments(demoUserId("someone@else.com"))).toHaveLength(0);
    setDemoSession("individual", "someone@else.com");
    expect(() => respondDemoAssignment(a.id, true)).toThrow();
    setDemoSession("individual", m.email);
    const before = getDemoState().programs.length;
    respondDemoAssignment(a.id, true);
    respondDemoAssignment(b.id, false);
    expect(getDemoState().programs.length).toBe(before + 1);
    a.program.exercises[0]!.name = "changed";
    expect(getDemoState().programs[0]!.definition.exercises[0]!.name).toBe("Squat");
    expect(pendingDemoAssignments(a.recipientId)).toHaveLength(0);
  });
});
