import { ScheduleAt } from "spacetimedb";
import spacetimedb from "./schema";
import { generateDailyQuestRows } from "./logic/questGenerator";
export default spacetimedb;

// ── Reducers ─────────────────────────────────────────────────────

// Player
export { create_player } from "./reducers/createPlayer";
export { set_player_name } from "./reducers/setPlayerName";
export { log_activity } from "./reducers/logActivity";
export { select_title } from "./reducers/selectTitle";

// Quests
export { claim_quest } from "./reducers/claimQuest";
export { create_custom_quest, complete_custom_quest } from "./reducers/createQuest";

// Equipment & Shop
export { equip_item, unequip_item } from "./reducers/equipItem";
export { buy_item, sell_item, rest_at_city } from "./reducers/shop";

// Travel
export { travel_to_biome, enter_location } from "./reducers/travel";

// PvP Combat
export { join_combat } from "./reducers/joinCombat";
export { cast_spell } from "./reducers/castSpell";
export { leave_combat } from "./reducers/leaveCombat";

// PvE Combat
export { start_pve_combat } from "./reducers/startPveCombat";
export { pve_cast_spell } from "./reducers/pveCastSpell";

// Guild
export {
  create_guild,
  join_guild,
  leave_guild,
  send_guild_message,
  promote_member,
  kick_member,
} from "./reducers/guild";

// Chat (biome + whisper)
export { send_biome_message, send_whisper } from "./reducers/chat";

// Friends
export {
  send_friend_request,
  accept_friend_request,
  reject_friend_request,
  remove_friend,
} from "./reducers/friendship";

// Raids
export { start_raid, raid_cast_spell, abandon_raid } from "./reducers/raid";
export { contribute_to_raid } from "./reducers/contributeToRaid";

// PvE Rewards
export { grant_pve_rewards } from "./reducers/grantPveRewards";

// Scheduled
export { idle_tick } from "./reducers/idleTick";
export { daily_quest_tick } from "./reducers/dailyQuestTick";

// ── Views ────────────────────────────────────────────────────────

export { my_player } from "./views/myPlayer";
export { my_equipment } from "./views/myEquipment";
export { my_quests } from "./views/myQuests";
export { my_titles } from "./views/myTitles";
export { my_guild } from "./views/myGuild";
export { my_guild_members } from "./views/myGuildMembers";
export { my_guild_messages } from "./views/myGuildMessages";
export { my_biome_messages } from "./views/myBiomeMessages";
export { my_whisper_messages } from "./views/myWhisperMessages";
export { my_combat } from "./views/myCombat";
export { my_combat_log } from "./views/myCombatLog";
export { my_raid } from "./views/myRaid";
export { my_raid_combatants } from "./views/myRaidCombatants";
export { my_raid_log } from "./views/myRaidLog";
export { biome_players } from "./views/biomePlayers";
export { leaderboard } from "./views/leaderboard";
export { browse_guilds } from "./views/browseGuilds";
export { my_activity_logs } from "./views/myActivityLogs";
export { my_friends } from "./views/myFriends";
export { my_pve_combat } from "./views/myPveCombat";
export { my_pve_combat_log } from "./views/myPveCombatLog";
export { biome_mobs } from "./views/biomeMobs";

// ── Init (seed spells + mobs + schedule idle tick) ──────────────

export const init = spacetimedb.init((ctx) => {
  // Seed spell catalog
  const spells = [
    {
      name: "Slash",
      element: { tag: "Physical" },
      damage: 8,
      manaCost: 0,
      isHeal: false,
    },
    {
      name: "Fireball",
      element: { tag: "Fire" },
      damage: 15,
      manaCost: 12,
      isHeal: false,
    },
    {
      name: "Ice Shard",
      element: { tag: "Ice" },
      damage: 13,
      manaCost: 10,
      isHeal: false,
    },
    {
      name: "Thunder",
      element: { tag: "Lightning" },
      damage: 18,
      manaCost: 16,
      isHeal: false,
    },
    {
      name: "Arcane Bolt",
      element: { tag: "Arcane" },
      damage: 20,
      manaCost: 20,
      isHeal: false,
    },
    {
      name: "Heal",
      element: { tag: "Heal" },
      damage: 15,
      manaCost: 14,
      isHeal: true,
    },
    {
      name: "Chain Lightning",
      element: { tag: "Lightning" },
      damage: 35,
      manaCost: 30,
      isHeal: false,
    },
    {
      name: "Frost Nova",
      element: { tag: "Ice" },
      damage: 20,
      manaCost: 15,
      isHeal: false,
    },
    {
      name: "Arcane Missile",
      element: { tag: "Arcane" },
      damage: 10,
      manaCost: 5,
      isHeal: false,
    },
  ];

  for (const sp of spells) {
    ctx.db.spell.insert({
      id: 0n,
      name: sp.name,
      element: sp.element as any,
      damage: sp.damage,
      manaCost: sp.manaCost,
      isHeal: sp.isHeal,
    });
  }

  // Seed mob catalog (mirrors client-side mobs.ts)
  const mobs: Array<{
    id: string;
    biomeId: string;
    name: string;
    sprite: string;
    hp: number;
    mana: number;
    damageMin: number;
    damageMax: number;
    xpReward: number;
    tier: number;
  }> = [
    // Plains (tier 1)
    {
      id: "slime",
      biomeId: "plains",
      name: "Green Slime",
      sprite: "\uD83D\uDFE2",
      hp: 30,
      mana: 20,
      damageMin: 3,
      damageMax: 6,
      xpReward: 15,
      tier: 1,
    },
    {
      id: "wild-boar",
      biomeId: "plains",
      name: "Wild Boar",
      sprite: "\uD83D\uDC17",
      hp: 40,
      mana: 15,
      damageMin: 4,
      damageMax: 8,
      xpReward: 20,
      tier: 1,
    },
    {
      id: "field-sprite",
      biomeId: "plains",
      name: "Field Sprite",
      sprite: "\uD83E\uDDDA",
      hp: 25,
      mana: 40,
      damageMin: 5,
      damageMax: 9,
      xpReward: 18,
      tier: 1,
    },
    // Forest (tier 2)
    {
      id: "treant",
      biomeId: "forest",
      name: "Angry Treant",
      sprite: "\uD83C\uDF33",
      hp: 55,
      mana: 25,
      damageMin: 6,
      damageMax: 11,
      xpReward: 30,
      tier: 2,
    },
    {
      id: "forest-wolf",
      biomeId: "forest",
      name: "Shadow Wolf",
      sprite: "\uD83D\uDC3A",
      hp: 45,
      mana: 20,
      damageMin: 7,
      damageMax: 12,
      xpReward: 28,
      tier: 2,
    },
    {
      id: "vine-creeper",
      biomeId: "forest",
      name: "Vine Creeper",
      sprite: "\uD83C\uDF3F",
      hp: 35,
      mana: 35,
      damageMin: 5,
      damageMax: 10,
      xpReward: 25,
      tier: 2,
    },
    // Tundra (tier 2)
    {
      id: "ice-wolf",
      biomeId: "tundra",
      name: "Frost Wolf",
      sprite: "\uD83D\uDC3A",
      hp: 50,
      mana: 25,
      damageMin: 7,
      damageMax: 12,
      xpReward: 30,
      tier: 2,
    },
    {
      id: "frost-sprite",
      biomeId: "tundra",
      name: "Frost Sprite",
      sprite: "\u2744\uFE0F",
      hp: 35,
      mana: 45,
      damageMin: 8,
      damageMax: 13,
      xpReward: 28,
      tier: 2,
    },
    {
      id: "yeti",
      biomeId: "tundra",
      name: "Mountain Yeti",
      sprite: "\uD83E\uDD8D",
      hp: 65,
      mana: 15,
      damageMin: 9,
      damageMax: 15,
      xpReward: 35,
      tier: 2,
    },
    // Desert (tier 3)
    {
      id: "sand-worm",
      biomeId: "desert",
      name: "Sand Worm",
      sprite: "\uD83E\uDEB1",
      hp: 70,
      mana: 20,
      damageMin: 10,
      damageMax: 16,
      xpReward: 40,
      tier: 3,
    },
    {
      id: "desert-bandit",
      biomeId: "desert",
      name: "Desert Bandit",
      sprite: "\uD83D\uDDE1\uFE0F",
      hp: 55,
      mana: 30,
      damageMin: 9,
      damageMax: 14,
      xpReward: 35,
      tier: 3,
    },
    {
      id: "scorpion",
      biomeId: "desert",
      name: "Giant Scorpion",
      sprite: "\uD83E\uDD82",
      hp: 60,
      mana: 25,
      damageMin: 11,
      damageMax: 17,
      xpReward: 38,
      tier: 3,
    },
    // Dungeon (tier 3)
    {
      id: "cave-bat",
      biomeId: "dungeon",
      name: "Giant Bat",
      sprite: "\uD83E\uDD87",
      hp: 50,
      mana: 30,
      damageMin: 9,
      damageMax: 15,
      xpReward: 35,
      tier: 3,
    },
    {
      id: "wraith",
      biomeId: "dungeon",
      name: "Dungeon Wraith",
      sprite: "\uD83D\uDC7B",
      hp: 45,
      mana: 50,
      damageMin: 12,
      damageMax: 18,
      xpReward: 42,
      tier: 3,
    },
    {
      id: "skeleton",
      biomeId: "dungeon",
      name: "Skeleton Warrior",
      sprite: "\uD83D\uDC80",
      hp: 60,
      mana: 20,
      damageMin: 10,
      damageMax: 16,
      xpReward: 38,
      tier: 3,
    },
    // Volcano (tier 4)
    {
      id: "fire-elemental",
      biomeId: "volcano",
      name: "Fire Elemental",
      sprite: "\uD83D\uDD25",
      hp: 75,
      mana: 40,
      damageMin: 14,
      damageMax: 20,
      xpReward: 50,
      tier: 4,
    },
    {
      id: "magma-crawler",
      biomeId: "volcano",
      name: "Magma Crawler",
      sprite: "\uD83D\uDC1B",
      hp: 85,
      mana: 20,
      damageMin: 13,
      damageMax: 19,
      xpReward: 48,
      tier: 4,
    },
    {
      id: "lava-imp",
      biomeId: "volcano",
      name: "Lava Imp",
      sprite: "\uD83D\uDE08",
      hp: 55,
      mana: 55,
      damageMin: 15,
      damageMax: 22,
      xpReward: 45,
      tier: 4,
    },
    // Spire (tier 4)
    {
      id: "spell-construct",
      biomeId: "spire",
      name: "Spell Construct",
      sprite: "\uD83E\uDD16",
      hp: 70,
      mana: 60,
      damageMin: 14,
      damageMax: 21,
      xpReward: 50,
      tier: 4,
    },
    {
      id: "animated-book",
      biomeId: "spire",
      name: "Animated Tome",
      sprite: "\uD83D\uDCD5",
      hp: 50,
      mana: 70,
      damageMin: 16,
      damageMax: 23,
      xpReward: 48,
      tier: 4,
    },
    {
      id: "rune-golem",
      biomeId: "spire",
      name: "Rune Golem",
      sprite: "\uD83D\uDDFF",
      hp: 95,
      mana: 30,
      damageMin: 13,
      damageMax: 19,
      xpReward: 52,
      tier: 4,
    },
    // Ruins (tier 5)
    {
      id: "undead-knight",
      biomeId: "ruins",
      name: "Undead Knight",
      sprite: "\u2694\uFE0F",
      hp: 100,
      mana: 30,
      damageMin: 16,
      damageMax: 24,
      xpReward: 60,
      tier: 5,
    },
    {
      id: "bone-mage",
      biomeId: "ruins",
      name: "Bone Mage",
      sprite: "\u2620\uFE0F",
      hp: 65,
      mana: 70,
      damageMin: 18,
      damageMax: 26,
      xpReward: 58,
      tier: 5,
    },
    {
      id: "dragon-whelp",
      biomeId: "ruins",
      name: "Dragon Whelp",
      sprite: "\uD83D\uDC32",
      hp: 110,
      mana: 45,
      damageMin: 17,
      damageMax: 25,
      xpReward: 65,
      tier: 5,
    },
    // Celestial (tier 6)
    {
      id: "void-walker",
      biomeId: "celestial",
      name: "Void Walker",
      sprite: "\uD83C\uDF00",
      hp: 120,
      mana: 60,
      damageMin: 20,
      damageMax: 30,
      xpReward: 80,
      tier: 6,
    },
    {
      id: "astral-phantom",
      biomeId: "celestial",
      name: "Astral Phantom",
      sprite: "\uD83D\uDC41\uFE0F",
      hp: 90,
      mana: 80,
      damageMin: 22,
      damageMax: 32,
      xpReward: 75,
      tier: 6,
    },
    {
      id: "star-golem",
      biomeId: "celestial",
      name: "Star Colossus",
      sprite: "\u2B50",
      hp: 140,
      mana: 40,
      damageMin: 19,
      damageMax: 28,
      xpReward: 85,
      tier: 6,
    },
  ];

  for (const m of mobs) {
    ctx.db.mob.insert(m);
  }

  // Schedule idle tick — runs every 1 hour (3_600_000_000 microseconds)
  const ONE_HOUR_MICROS = 3_600_000_000n;
  ctx.db.idleTickSchedule.insert({
    scheduledId: 0n,
    scheduledAt: ScheduleAt.interval(ONE_HOUR_MICROS),
  });

  // Schedule daily quest generation — runs every 24 hours
  const ONE_DAY_MICROS = 24n * 3_600_000_000n;
  ctx.db.dailyQuestSchedule.insert({
    scheduledId: 0n,
    scheduledAt: ScheduleAt.interval(ONE_DAY_MICROS),
  });
});

// ── Lifecycle ────────────────────────────────────────────────────

export const onConnect = spacetimedb.clientConnected((ctx) => {
  const existing = ctx.db.player.identity.find(ctx.sender);
  if (existing) {
    ctx.db.player.identity.update({ ...existing, online: true });
  } else {
    ctx.db.player.insert({
      identity: ctx.sender,
      name: "",
      online: true,
      characterClass: { tag: "Unclassed" },
      level: 1,
      xp: 0,
      xpToNext: 25,
      hp: 50,
      maxHp: 50,
      gold: 50,
      streakDays: 0,
      totalActivities: 0,
      questsCompleted: 0,
      lastActivityAt: ctx.timestamp,
      strength: 0,
      agility: 0,
      intelligence: 0,
      constitution: 0,
      wisdom: 0,
      charisma: 0,
      mana: 0,
      currentBiome: "plains",
      currentLocation: undefined,
      activeTitle: undefined,
      pvpWins: 0,
      pvpLosses: 0,
      unlockedBiomes: ["plains"],
      joinedAt: ctx.timestamp,
    });

    // Generate initial daily quests for the new player
    const quests = generateDailyQuestRows(ctx.sender, ctx.timestamp);
    for (const q of quests) {
      ctx.db.quest.insert(q as any);
    }
  }
});

export const onDisconnect = spacetimedb.clientDisconnected((ctx) => {
  const existing = ctx.db.player.identity.find(ctx.sender);
  if (existing) {
    ctx.db.player.identity.update({ ...existing, online: false });
  }
});
