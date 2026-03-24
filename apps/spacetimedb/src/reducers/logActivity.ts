import { t, SenderError } from "spacetimedb/server";
import spacetimedb from "../schema";
import { ActivityType } from "../types/activityType";

// ── Stat engine (mirrors client-side statEngine.ts) ──────────────

const BASE_RATES: Record<string, Record<string, number>> = {
  StrengthTraining: { str: 3.0, con: 1.5 },
  Cardio: { agi: 3.0, con: 1.0 },
  Hiit: { str: 1.5, agi: 1.5, con: 1.0 },
  MindLearning: { intStat: 3.0, mp: 1.5 },
  Nutrition: { con: 2.0, wis: 1.5 },
  Hydration: { con: 1.0 },
  Sleep: { con: 2.0, wis: 1.0 },
  Mindfulness: { wis: 3.0, mp: 1.0 },
  Creativity: { cha: 3.0, wis: 1.0 },
  Social: { cha: 2.5, wis: 0.5, con: 0.5 },
};

const INPUT_MODES: Record<string, string> = {
  StrengthTraining: "duration",
  Cardio: "duration",
  Hiit: "duration",
  MindLearning: "duration",
  Nutrition: "meal",
  Hydration: "glasses",
  Sleep: "sleep",
  Mindfulness: "duration",
  Creativity: "duration",
  Social: "duration",
};

const HAS_INTENSITY: Record<string, boolean> = {
  StrengthTraining: true,
  Cardio: true,
  Hiit: true,
  MindLearning: true,
  Creativity: true,
};

function toEffectiveMinutes(activityType: string, rawValue: number): number {
  const mode = INPUT_MODES[activityType] ?? "duration";
  switch (mode) {
    case "duration":
      return rawValue;
    case "meal":
      return rawValue * 10;
    case "glasses":
      return rawValue * 5;
    case "sleep":
      return Math.min(rawValue, 10) * 60;
    default:
      return rawValue;
  }
}

function intensityMultiplier(intensity: number): number {
  const clamped = Math.max(1, Math.min(10, intensity));
  return 0.5 + clamped / 20;
}

function streakMultiplier(streakDays: number): number {
  return Math.min(1.0 + streakDays * 0.0167, 1.5);
}

function xpToNextLevel(level: number): number {
  if (level <= 4) return 25 * level;
  return Math.round((level * level * 0.25 + 10 * level + 140) / 10) * 10;
}

function maxHp(level: number, con: number): number {
  return 50 + level * 2 + Math.floor(con / 2);
}

// ── Class derivation (mirrors client-side classEngine.ts) ────────

const ARCHETYPE_WEIGHTS: Record<string, Record<string, number>> = {
  StrengthTraining: { Warrior: 3, Paladin: 1, Ranger: 1 },
  Cardio: { Rogue: 3, Ranger: 2 },
  Hiit: { Warrior: 1, Rogue: 2, Ranger: 1 },
  MindLearning: { Mage: 3, Scholar: 2 },
  Nutrition: { Paladin: 2, Druid: 2 },
  Hydration: { Druid: 1, Paladin: 1 },
  Sleep: { Druid: 2, Paladin: 1 },
  Mindfulness: { Druid: 3, Bard: 1 },
  Creativity: { Bard: 3, Mage: 1 },
  Social: { Bard: 3, Paladin: 1 },
};

function deriveClass(ctx: any, playerId: any, now: Date): { tag: string } {
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const uniqueDays = new Set<string>();
  const scores: Record<string, number> = {};

  for (const log of ctx.db.activityLog.playerId.filter(playerId)) {
    const logDate = log.timestamp.toDate();
    if (logDate < thirtyDaysAgo) continue;

    uniqueDays.add(logDate.toDateString());
    const weights = ARCHETYPE_WEIGHTS[log.activityType.tag] ?? {};
    const durationWeight = Math.min(log.durationMin, 180) / 60;

    for (const [cls, weight] of Object.entries(weights)) {
      scores[cls] = (scores[cls] ?? 0) + weight * durationWeight;
    }
  }

  if (uniqueDays.size < 7) return { tag: "Unclassed" };

  let bestClass = "Unclassed";
  let bestScore = 0;
  for (const [cls, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score;
      bestClass = cls;
    }
  }

  return { tag: bestClass };
}

// ── Reducer ─────────────────────────────────────────────────────

export const log_activity = spacetimedb.reducer(
  {
    activityType: ActivityType,
    rawValue: t.f32(),
    intensity: t.u8(),
    note: t.option(t.string()),
  },
  (ctx, { activityType, rawValue, intensity, note }) => {
    const p = ctx.db.player.identity.find(ctx.sender);
    if (!p) throw new SenderError("Player not found");

    const typeTag = activityType.tag;

    // Validate intensity
    if (intensity < 1 || intensity > 10) throw new SenderError("Intensity must be 1-10");

    // Use server timestamp consistently
    const now = ctx.timestamp.toDate();
    const todayStr = now.toDateString();

    // Count same-type activities today
    let sameTypeToday = 0;
    for (const log of ctx.db.activityLog.playerId.filter(ctx.sender)) {
      if (log.activityType.tag === typeTag) {
        const logDate = log.timestamp.toDate().toDateString();
        if (logDate === todayStr) sameTypeToday++;
      }
    }

    // Calculate effective minutes and deltas
    const effectiveMin = toEffectiveMinutes(typeTag, rawValue);
    const capped = Math.min(effectiveMin, 180);
    const hours = capped / 60;

    const hasInt = HAS_INTENSITY[typeTag] ?? false;
    const intMul = hasInt ? intensityMultiplier(intensity) : 0.8;
    const strMul = streakMultiplier(p.streakDays);
    const diminish = sameTypeToday >= 3 ? 0.25 : 1;

    const rates = BASE_RATES[typeTag] ?? {};
    const deltas: Record<string, number> = {};
    for (const [stat, rate] of Object.entries(rates)) {
      deltas[stat] = Math.round(rate * hours * intMul * strMul * diminish * 100) / 100;
    }

    // XP gain
    const xpBase = (capped / 30) * 10;
    const xpGain = Math.round(xpBase * intMul * strMul);

    // Insert activity log
    ctx.db.activityLog.insert({
      id: 0n,
      playerId: ctx.sender,
      activityType,
      rawValue,
      durationMin: effectiveMin,
      intensity,
      timestamp: ctx.timestamp,
      note: note ?? undefined,
      deltaStr: deltas.str ?? 0,
      deltaAgi: deltas.agi ?? 0,
      deltaInt: deltas.intStat ?? 0,
      deltaCon: deltas.con ?? 0,
      deltaWis: deltas.wis ?? 0,
      deltaCha: deltas.cha ?? 0,
      deltaMp: deltas.mp ?? 0,
    });

    // Update player stats — f32 preserves fractional gains
    const newStr = p.str + (deltas.str ?? 0);
    const newAgi = p.agi + (deltas.agi ?? 0);
    const newInt = p.intStat + (deltas.intStat ?? 0);
    const newCon = p.con + (deltas.con ?? 0);
    const newWis = p.wis + (deltas.wis ?? 0);
    const newCha = p.cha + (deltas.cha ?? 0);
    const newMp = p.mp + (deltas.mp ?? 0);

    // Level up
    let level = p.level;
    let xp = p.xp + xpGain;
    let xpNext = xpToNextLevel(level);
    while (xp >= xpNext) {
      xp -= xpNext;
      level++;
      xpNext = xpToNextLevel(level);
    }

    // Streak calculation using server timestamp
    let streakDays = p.streakDays;
    if (p.lastActivityDate) {
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);
      const last = new Date(p.lastActivityDate);
      last.setHours(0, 0, 0, 0);
      const diffDays = Math.round((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) streakDays = p.streakDays + 1;
      else if (diffDays > 1) streakDays = 1;
      // diffDays === 0: same day, no change
    } else {
      streakDays = 1;
    }

    const newMaxHp = maxHp(level, Math.floor(newCon));

    // Update quest progress
    for (const q of ctx.db.quest.playerId.filter(ctx.sender)) {
      if (q.completed || q.claimed) continue;
      if (q.activityType && q.activityType.tag === typeTag) {
        const newProgress = q.progressMin + Math.round(effectiveMin);
        const completed = newProgress >= q.targetMin;
        ctx.db.quest.id.update({ ...q, progressMin: newProgress, completed });
      }
    }

    // Derive class from 30-day activity profile
    const newClass = deriveClass(ctx, ctx.sender, now);

    ctx.db.player.identity.update({
      ...p,
      str: newStr,
      agi: newAgi,
      intStat: newInt,
      con: newCon,
      wis: newWis,
      cha: newCha,
      mp: newMp,
      characterClass: newClass as any,
      level,
      xp,
      xpToNext: xpNext,
      hp: newMaxHp,
      maxHp: newMaxHp,
      streakDays,
      totalActivities: p.totalActivities + 1,
      lastActivityDate: todayStr,
    });
  },
);
