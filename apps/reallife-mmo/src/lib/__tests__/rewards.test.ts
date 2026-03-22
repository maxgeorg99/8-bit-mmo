import { describe, expect, it } from "vite-plus/test";
import { checkMilestoneRewards, getNextMilestones } from "../rewards";

describe("checkMilestoneRewards", () => {
  it("gives starter sword at level 2", () => {
    const items = checkMilestoneRewards(2, 0, "Unclassed", []);
    expect(items.some((i) => i.id === "starter-sword")).toBe(true);
  });

  it("does not re-grant already owned items", () => {
    const items = checkMilestoneRewards(2, 0, "Unclassed", ["starter-sword"]);
    expect(items.some((i) => i.id === "starter-sword")).toBe(false);
  });

  it("gives multiple items at higher levels", () => {
    const items = checkMilestoneRewards(10, 15, "Warrior", []);
    expect(items.length).toBeGreaterThan(3); // starter sword, leather, helm, amulet, steel blade, ring of dedication
  });

  it("gives Ring of Dedication at 10 activities", () => {
    const items = checkMilestoneRewards(1, 10, "Unclassed", []);
    expect(items.some((i) => i.id === "first-ten")).toBe(true);
  });

  it("gives legendary at 100 activities", () => {
    const items = checkMilestoneRewards(1, 100, "Unclassed", []);
    expect(items.some((i) => i.rarity === "legendary")).toBe(true);
  });
});

describe("getNextMilestones", () => {
  it("shows upcoming milestones for a new player", () => {
    const next = getNextMilestones(1, 0, "Unclassed", []);
    expect(next.length).toBeGreaterThan(0);
    expect(next.length).toBeLessThanOrEqual(3);
  });

  it("skips already earned milestones", () => {
    const next = getNextMilestones(1, 0, "Unclassed", ["starter-sword"]);
    expect(next.some((m) => m.item.id === "starter-sword")).toBe(false);
  });

  it("shows fewer milestones as you progress", () => {
    const early = getNextMilestones(1, 0, "Unclassed", []);
    const late = getNextMilestones(50, 100, "Warrior", []);
    // At max level with 100 activities, there should be very few or no milestones left
    expect(late.length).toBeLessThanOrEqual(early.length);
  });
});
