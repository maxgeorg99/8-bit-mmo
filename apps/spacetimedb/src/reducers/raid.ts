import { t, SenderError } from "spacetimedb/server";
import spacetimedb from "../schema";
import { Identity } from "spacetimedb";

// ── Boss data (mirrors client-side bossDefinitions.ts) ──────────

interface BossAbility {
  name: string;
  element: string;
  damage: number;
  isAoe: boolean;
}

interface BossConfig {
  baseHp: number;
  perMemberHp: number;
  mana: number;
  abilities: BossAbility[];
  biome: string;
  name: string;
}

const BOSSES: Record<string, BossConfig> = {
  plains: {
    name: "Thornback the Elder",
    biome: "plains",
    baseHp: 150,
    perMemberHp: 40,
    mana: 50,
    abilities: [
      { name: "Thorn Lash", element: "Nature", damage: 8, isAoe: false },
      { name: "Vine Storm", element: "Nature", damage: 5, isAoe: true },
      { name: "Root Slam", element: "Nature", damage: 12, isAoe: false },
    ],
  },
  forest: {
    name: "Rootwarden",
    biome: "forest",
    baseHp: 200,
    perMemberHp: 50,
    mana: 60,
    abilities: [
      { name: "Bark Crush", element: "Nature", damage: 10, isAoe: false },
      { name: "Spore Cloud", element: "Poison", damage: 6, isAoe: true },
      { name: "Entangle", element: "Nature", damage: 14, isAoe: false },
    ],
  },
  mountains: {
    name: "Gorvath the Stonelord",
    biome: "mountains",
    baseHp: 250,
    perMemberHp: 60,
    mana: 40,
    abilities: [
      { name: "Boulder Throw", element: "Earth", damage: 15, isAoe: false },
      { name: "Earthquake", element: "Earth", damage: 8, isAoe: true },
      { name: "Stone Fist", element: "Earth", damage: 18, isAoe: false },
    ],
  },
  desert: {
    name: "Skarathi",
    biome: "desert",
    baseHp: 220,
    perMemberHp: 55,
    mana: 70,
    abilities: [
      { name: "Sandstorm", element: "Wind", damage: 7, isAoe: true },
      { name: "Scorching Ray", element: "Fire", damage: 16, isAoe: false },
      { name: "Mirage Strike", element: "Arcane", damage: 12, isAoe: false },
    ],
  },
  tundra: {
    name: "Frostmaw",
    biome: "tundra",
    baseHp: 280,
    perMemberHp: 65,
    mana: 50,
    abilities: [
      { name: "Blizzard", element: "Ice", damage: 9, isAoe: true },
      { name: "Ice Fang", element: "Ice", damage: 20, isAoe: false },
      { name: "Frost Breath", element: "Ice", damage: 12, isAoe: false },
    ],
  },
  swamp: {
    name: "Mirefiend",
    biome: "swamp",
    baseHp: 200,
    perMemberHp: 50,
    mana: 80,
    abilities: [
      { name: "Toxic Spray", element: "Poison", damage: 8, isAoe: true },
      { name: "Swamp Grasp", element: "Nature", damage: 14, isAoe: false },
      { name: "Acid Spit", element: "Poison", damage: 16, isAoe: false },
    ],
  },
  volcano: {
    name: "Ignazar",
    biome: "volcano",
    baseHp: 300,
    perMemberHp: 70,
    mana: 60,
    abilities: [
      { name: "Lava Wave", element: "Fire", damage: 10, isAoe: true },
      { name: "Magma Bolt", element: "Fire", damage: 22, isAoe: false },
      { name: "Eruption", element: "Fire", damage: 14, isAoe: true },
    ],
  },
  ruins: {
    name: "Skarveth the Lich",
    biome: "ruins",
    baseHp: 260,
    perMemberHp: 60,
    mana: 100,
    abilities: [
      { name: "Soul Drain", element: "Dark", damage: 12, isAoe: false },
      { name: "Necrotic Wave", element: "Dark", damage: 8, isAoe: true },
      { name: "Shadow Bolt", element: "Dark", damage: 18, isAoe: false },
    ],
  },
  ocean: {
    name: "Leviathan",
    biome: "ocean",
    baseHp: 350,
    perMemberHp: 80,
    mana: 70,
    abilities: [
      { name: "Tidal Wave", element: "Water", damage: 11, isAoe: true },
      { name: "Whirlpool", element: "Water", damage: 20, isAoe: false },
      { name: "Deep Crush", element: "Water", damage: 25, isAoe: false },
    ],
  },
};

// ── Combat helpers ──────────────────────────────────────────────

function calculateDamage(base: number): number {
  const variance = 0.8 + Math.random() * 0.4; // 80% - 120%
  return Math.max(1, Math.round(base * variance));
}

function bossPickAbility(abilities: BossAbility[], mana: number): BossAbility {
  if (mana > 30) {
    const aoe = abilities.find((a) => a.isAoe);
    if (aoe && Math.random() > 0.4) return aoe;
  }
  return abilities[Math.floor(Math.random() * abilities.length)]!;
}

// ── Reducers ────────────────────────────────────────────────────

export const start_raid = spacetimedb.reducer({ biomeId: t.string() }, (ctx, { biomeId }) => {
  const p = ctx.db.player.identity.find(ctx.sender);
  if (!p) throw new SenderError("Player not found");

  // Find caller's guild
  let guildId: bigint | null = null;
  for (const m of ctx.db.guildMember.playerId.filter(ctx.sender)) {
    guildId = m.guildId;
    break;
  }
  if (guildId === null) throw new SenderError("Not in a guild");

  // Check no active raid
  for (const r of ctx.db.raid.guildId.filter(guildId)) {
    if (r.phase.tag === "Lobby" || r.phase.tag === "Fighting") {
      throw new SenderError("Guild already has an active raid");
    }
  }

  const boss = BOSSES[biomeId];
  if (!boss) throw new SenderError("Invalid biome for raid");

  // Count guild members
  const members = [];
  for (const m of ctx.db.guildMember.guildId.filter(guildId)) {
    members.push(m);
  }
  if (members.length < 3) throw new SenderError("Need at least 3 guild members");

  const bossMaxHp = boss.baseHp + boss.perMemberHp * members.length;

  // Create raid
  const raid = ctx.db.raid.insert({
    id: 0n,
    guildId,
    biomeId,
    bossId: biomeId,
    phase: { tag: "Fighting" },
    bossHp: bossMaxHp,
    bossMaxHp,
    bossMana: boss.mana,
    currentTurnIndex: 0,
    startedAt: ctx.timestamp,
  });

  // Create combatants from guild members
  for (const m of members) {
    const player = ctx.db.player.identity.find(m.playerId);
    const level = player?.level ?? 1;
    const baseHp = 40 + level * 5;
    const baseMana = 20 + level * 3;
    ctx.db.raidCombatant.insert({
      id: 0n,
      raidId: raid.id,
      playerId: m.playerId,
      playerName: player?.name ?? "Unknown",
      playerClass: player?.characterClass?.tag ?? "Unclassed",
      hp: baseHp,
      maxHp: baseHp,
      mana: baseMana,
      maxMana: baseMana,
      ko: false,
    });
  }

  // System message
  ctx.db.message.insert({
    id: 0n,
    guildId,
    biomeId: "",
    whisperTo: Identity.zero(),
    authorId: ctx.sender,
    authorName: "System",
    text: `⚔️ Raid started against ${boss.name}!`,
    timestamp: ctx.timestamp,
  });
});

export const raid_cast_spell = spacetimedb.reducer(
  {
    raidId: t.u64(),
    spellName: t.string(),
    spellDamage: t.u32(),
    spellManaCost: t.u32(),
    isHeal: t.bool(),
    spellElement: t.string(),
  },
  (ctx, { raidId, spellName, spellDamage, spellManaCost, isHeal, spellElement }) => {
    const raid = ctx.db.raid.id.find(raidId);
    if (!raid) throw new SenderError("Raid not found");
    if (raid.phase.tag !== "Fighting") throw new SenderError("Raid is not in progress");

    const boss = BOSSES[raid.biomeId];
    if (!boss) throw new SenderError("Invalid boss");

    // Get all combatants sorted by id (stable order)
    const combatants = [];
    for (const c of ctx.db.raidCombatant.raidId.filter(raidId)) {
      combatants.push(c);
    }
    combatants.sort((a, b) => Number(a.id - b.id));

    const current = combatants[raid.currentTurnIndex];
    if (!current || current.ko) throw new SenderError("Current combatant is KO");
    if (spellManaCost > current.mana) throw new SenderError("Not enough mana");

    // Deduct mana
    current.mana -= spellManaCost;

    let newBossHp = raid.bossHp;
    let newBossMana = raid.bossMana;

    if (isHeal) {
      // Heal most damaged ally
      const alive = combatants.filter((c) => !c.ko);
      alive.sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp);
      const target = alive[0];
      if (target) {
        const heal = Math.max(1, calculateDamage(spellDamage));
        target.hp = Math.min(target.maxHp, target.hp + heal);
        ctx.db.raidLog.insert({
          id: 0n,
          raidId,
          caster: current.playerName,
          target: target.playerName,
          spellName,
          element: spellElement,
          damage: heal,
          isHeal: true,
        });
        ctx.db.raidCombatant.id.update({ ...target });
      }
    } else {
      const dmg = calculateDamage(spellDamage);
      newBossHp = Math.max(0, newBossHp - dmg);
      ctx.db.raidLog.insert({
        id: 0n,
        raidId,
        caster: current.playerName,
        target: boss.name,
        spellName,
        element: spellElement,
        damage: dmg,
        isHeal: false,
      });
    }

    // Update current combatant mana
    ctx.db.raidCombatant.id.update({ ...current });

    // Check boss dead
    if (newBossHp <= 0) {
      ctx.db.raid.id.update({ ...raid, bossHp: 0, phase: { tag: "Victory" } as any });
      // Increment guild raid wins
      const guild = ctx.db.guild.id.find(raid.guildId);
      if (guild) {
        ctx.db.guild.id.update({ ...guild, raidWins: guild.raidWins + 1 });
      }
      ctx.db.message.insert({
        id: 0n,
        guildId: raid.guildId,
        biomeId: "",
        whisperTo: Identity.zero(),
        authorId: ctx.sender,
        authorName: "System",
        text: `🎉 ${boss.name} has been defeated! Raid victory!`,
        timestamp: ctx.timestamp,
      });
      return;
    }

    // Advance to next alive combatant
    let nextIndex = (raid.currentTurnIndex + 1) % combatants.length;
    let safety = 0;
    while (combatants[nextIndex]?.ko && safety < combatants.length) {
      nextIndex = (nextIndex + 1) % combatants.length;
      safety++;
    }

    // Boss turn — after full round
    const isNewRound = nextIndex <= raid.currentTurnIndex;
    if (isNewRound) {
      const ability = bossPickAbility(boss.abilities, newBossMana);
      newBossMana = Math.max(0, newBossMana - 10);

      if (ability.isAoe) {
        for (const c of combatants) {
          if (c.ko) continue;
          const dmg = calculateDamage(ability.damage);
          c.hp = Math.max(0, c.hp - dmg);
          if (c.hp <= 0) c.ko = true;
          ctx.db.raidLog.insert({
            id: 0n,
            raidId,
            caster: boss.name,
            target: c.playerName,
            spellName: ability.name,
            element: ability.element,
            damage: dmg,
            isHeal: false,
          });
          ctx.db.raidCombatant.id.update({ ...c });
        }
      } else {
        const alive = combatants.filter((c) => !c.ko);
        const target = alive[Math.floor(Math.random() * alive.length)];
        if (target) {
          const dmg = calculateDamage(ability.damage);
          target.hp = Math.max(0, target.hp - dmg);
          if (target.hp <= 0) target.ko = true;
          ctx.db.raidLog.insert({
            id: 0n,
            raidId,
            caster: boss.name,
            target: target.playerName,
            spellName: ability.name,
            element: ability.element,
            damage: dmg,
            isHeal: false,
          });
          ctx.db.raidCombatant.id.update({ ...target });
        }
      }

      // Boss self-heal for Rootwarden (forest)
      if (boss.biome === "forest" && newBossHp > 0) {
        const heal = Math.round(boss.baseHp * 0.05);
        newBossHp = Math.min(raid.bossMaxHp, newBossHp + heal);
        ctx.db.raidLog.insert({
          id: 0n,
          raidId,
          caster: boss.name,
          target: boss.name,
          spellName: "Regrowth",
          element: "Heal",
          damage: heal,
          isHeal: true,
        });
      }

      // Boss drain for Skarveth (ruins)
      if (boss.biome === "ruins" && newBossHp > 0) {
        const drain = Math.round(ability.damage * 0.3);
        newBossHp = Math.min(raid.bossMaxHp, newBossHp + drain);
      }

      // Mana regen for alive combatants
      for (const c of combatants) {
        if (!c.ko) {
          c.mana = Math.min(c.maxMana, c.mana + 3);
          ctx.db.raidCombatant.id.update({ ...c });
        }
      }
    }

    // Check all KO
    const allKo = combatants.every((c) => c.ko);
    if (allKo) {
      ctx.db.raid.id.update({
        ...raid,
        bossHp: newBossHp,
        bossMana: newBossMana,
        phase: { tag: "Defeat" } as any,
        currentTurnIndex: nextIndex,
      });
      ctx.db.message.insert({
        id: 0n,
        guildId: raid.guildId,
        biomeId: "",
        whisperTo: Identity.zero(),
        authorId: ctx.sender,
        authorName: "System",
        text: `💀 The guild was defeated by ${boss.name}...`,
        timestamp: ctx.timestamp,
      });
      return;
    }

    // Re-find next alive after boss turn
    while (combatants[nextIndex]?.ko) {
      nextIndex = (nextIndex + 1) % combatants.length;
    }

    ctx.db.raid.id.update({
      ...raid,
      bossHp: newBossHp,
      bossMana: newBossMana,
      currentTurnIndex: nextIndex,
    });
  },
);

export const abandon_raid = spacetimedb.reducer({ raidId: t.u64() }, (ctx, { raidId }) => {
  const raid = ctx.db.raid.id.find(raidId);
  if (!raid) throw new SenderError("Raid not found");

  // Clean up combatants and logs
  for (const c of ctx.db.raidCombatant.raidId.filter(raidId)) {
    ctx.db.raidCombatant.id.delete(c.id);
  }
  for (const l of ctx.db.raidLog.raidId.filter(raidId)) {
    ctx.db.raidLog.id.delete(l.id);
  }
  ctx.db.raid.id.delete(raidId);
});
