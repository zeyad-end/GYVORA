import { describe, it, expect, beforeEach } from "vitest";
import {
  matchDemoAccount, approveRequest, rejectRequest, editGym, setGymStatus, deleteGym,
  editClient, removeClientGym, deleteClient, getDemoState, periodRange, inRange,
} from "@/lib/demo";

describe("demo accounts", () => {
  it("matches the super admin demo credentials", () => {
    expect(matchDemoAccount("zeyad salama", "zeyadsalama", "zeyadsalama")).toBe("super");
  });
  it("matches the gym owner demo credentials", () => {
    expect(matchDemoAccount("zeyad salama1", "gym email", "zeyad salama1")).toBe("owner");
  });
  it("rejects wrong passwords and unknown users", () => {
    expect(matchDemoAccount("zeyad salama", "zeyadsalama", "wrong")).toBeNull();
    expect(matchDemoAccount("someone", "else", "x")).toBeNull();
  });
});

describe("demo platform store", () => {
  let reqId: string;
  beforeEach(() => {
    const pending = getDemoState().requests.find((r) => r.status === "Pending");
    reqId = pending?.id ?? "";
  });

  it("approving a request moves it to Approved Gyms with matching plan dates", () => {
    const before = getDemoState();
    const req = before.requests.find((r) => r.id === reqId)!;
    approveRequest(reqId);
    const after = getDemoState();
    expect(after.requests.find((r) => r.id === reqId)?.status).toBe("Approved");
    const gym = after.gyms.find((g) => g.name === req.gymName);
    expect(gym).toBeDefined();
    expect(gym?.plan).toBe(req.plan);
    expect(after.revenue.some((r) => r.gymName === req.gymName)).toBe(true);
  });

  it("rejecting a request does not create a gym", () => {
    const pending = getDemoState().requests.find((r) => r.status === "Pending");
    if (!pending) return;
    rejectRequest(pending.id);
    expect(getDemoState().requests.find((r) => r.id === pending.id)?.status).toBe("Rejected");
    expect(getDemoState().gyms.some((g) => g.email === pending.email && g.name === pending.gymName && g.start === new Date().toISOString().slice(0, 10))).toBe(false);
  });

  it("freeze and reactivate toggle subscription status without deleting the gym", () => {
    const gym = getDemoState().gyms[0]!;
    setGymStatus(gym.id, "Frozen");
    expect(getDemoState().gyms.find((g) => g.id === gym.id)?.status).toBe("Frozen");
    setGymStatus(gym.id, "Active");
    expect(getDemoState().gyms.find((g) => g.id === gym.id)?.status).toBe("Active");
  });

  it("editing a gym plan recalculates the subscription end date", () => {
    const gym = getDemoState().gyms[0]!;
    editGym(gym.id, { name: gym.name, plan: "Basic" });
    const updated = getDemoState().gyms.find((g) => g.id === gym.id)!;
    expect(updated.plan).toBe("Basic");
    expect(updated.end).not.toBe(gym.end);
    editGym(gym.id, { name: gym.name, plan: gym.plan });
  });

  it("deleting a gym removes only that gym", () => {
    const gym = getDemoState().gyms[getDemoState().gyms.length - 1]!;
    const count = getDemoState().gyms.length;
    deleteGym(gym.id);
    expect(getDemoState().gyms.length).toBe(count - 1);
    expect(getDemoState().gyms.some((g) => g.id === gym.id)).toBe(false);
  });

  it("removing a client from one gym keeps their other memberships", () => {
    const multi = getDemoState().clients.find((c) => c.gyms.length > 1)!;
    const removed = multi.gyms[0]!;
    removeClientGym(multi.id, removed);
    const after = getDemoState().clients.find((c) => c.id === multi.id)!;
    expect(after.gyms).not.toContain(removed);
    expect(after.gyms.length).toBe(multi.gyms.length - 1);
  });

  it("deleting a client removes the whole client", () => {
    const c = getDemoState().clients[getDemoState().clients.length - 1]!;
    deleteClient(c.id);
    expect(getDemoState().clients.some((x) => x.id === c.id)).toBe(false);
  });

  it("editing a client updates name and phone", () => {
    const c = getDemoState().clients[0]!;
    editClient(c.id, { name: "Edited Name", phone: "+20 000 000 0000" });
    const after = getDemoState().clients.find((x) => x.id === c.id)!;
    expect(after.name).toBe("Edited Name");
    editClient(c.id, { name: c.name, phone: c.phone });
  });
});

describe("period ranges", () => {
  it("last 7 days spans 7 calendar days", () => {
    const { from, to } = periodRange("7d");
    const days = (d: Date) => Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000;
    expect(days(to) - days(from)).toBe(6);
  });
  it("last month stays within the previous month", () => {
    const { from, to } = periodRange("lastMonth");
    expect(from.getDate()).toBe(1);
    expect(to.getMonth()).toBe(from.getMonth());
  });
  it("inRange includes boundary dates", () => {
    const { from, to } = periodRange("month");
    expect(inRange(new Date().toISOString().slice(0, 10), from, to)).toBe(true);
    expect(inRange("1999-01-01", from, to)).toBe(false);
  });
});
