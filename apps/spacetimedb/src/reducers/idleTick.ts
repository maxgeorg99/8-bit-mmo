import spacetimedb from "../schema";
import { idleTickSchedule, setIdleTickReducer } from "../tables/idleTickSchedule";

/**
 * Idle tick — runs every hour via schedule table.
 * Responsibilities:
 * 1. Break streaks for players who missed a day
 * 2. Expire daily quests past their expiry time
 * 3. Clean up finished combats older than 24h
 * 4. Expire raids older than 7 days
 */
export const idle_tick = spacetimedb.reducer(
  { arg: idleTickSchedule.rowType },
  (ctx, { arg: _arg }) => {
    const now = ctx.timestamp.toDate();
    const todayStr = now.toDateString();
    const nowMs = now.getTime();
    const oneDayMs = 24 * 60 * 60 * 1000;
    const sevenDaysMs = 7 * oneDayMs;

    // ── 1. Break streaks for inactive players ──────────────────
    for (const p of ctx.db.player.iter()) {
      if (!p.lastActivityAt || p.streakDays === 0) continue;

      const lastDate = p.lastActivityAt.toDate();
      lastDate.setHours(0, 0, 0, 0);
      const today = new Date(todayStr);
      const diffDays = Math.round((today.getTime() - lastDate.getTime()) / oneDayMs);

      if (diffDays > 1) {
        ctx.db.player.identity.update({ ...p, streakDays: 0 });
      }
    }

    // ── 2. Expire daily quests ─────────────────────────────────
    for (const q of ctx.db.quest.iter()) {
      if (q.claimed) continue;
      if (q.expiresAt !== undefined && q.expiresAt.toDate() < now) {
        ctx.db.quest.id.delete(q.id);
      }
    }

    // ── 3. Clean up finished combats older than 24h ────────────
    for (const c of ctx.db.combat.iter()) {
      if (c.status.tag !== "Finished") continue;
      let oldest = nowMs;
      for (const log of ctx.db.combatLog.combatId.filter(c.id)) {
        const logMs = Number(log.timestamp.toMillis());
        if (logMs < oldest) oldest = logMs;
      }
      if (nowMs - oldest > oneDayMs) {
        for (const log of ctx.db.combatLog.combatId.filter(c.id)) {
          ctx.db.combatLog.id.delete(log.id);
        }
        ctx.db.combat.id.delete(c.id);
      }
    }

    // ── 4. Expire stale raids ──────────────────────────────────
    for (const r of ctx.db.raid.iter()) {
      if (r.phase.tag === "Victory" || r.phase.tag === "Defeat") {
        const raidMs = Number(r.startedAt.toMillis());
        if (nowMs - raidMs > oneDayMs) {
          for (const rc of ctx.db.raidCombatant.raidId.filter(r.id)) {
            ctx.db.raidCombatant.id.delete(rc.id);
          }
          for (const rl of ctx.db.raidLog.raidId.filter(r.id)) {
            ctx.db.raidLog.id.delete(rl.id);
          }
          ctx.db.raid.id.delete(r.id);
        }
      } else if (r.phase.tag === "Fighting" || r.phase.tag === "Lobby") {
        const raidMs = Number(r.startedAt.toMillis());
        if (nowMs - raidMs > sevenDaysMs) {
          ctx.db.raid.id.update({ ...r, phase: { tag: "Defeat" } as any });
        }
      }
    }
  },
);

// Wire up the lazy reference so the schedule table can find the reducer
setIdleTickReducer(idle_tick);
