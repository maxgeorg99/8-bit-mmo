import { ScheduleAt, Timestamp } from "spacetimedb";
import spacetimedb from "./schema";
export default spacetimedb;

// ── Reducers ─────────────────────────────────────────────────────

// Player
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

// Guild
export {
  create_guild,
  join_guild,
  leave_guild,
  send_guild_message,
  promote_member,
  kick_member,
} from "./reducers/guild";

// PvE Rewards
export { grant_pve_rewards } from "./reducers/grantPveRewards";

// Scheduled
export { idle_tick } from "./reducers/idleTick";

// ── Views ────────────────────────────────────────────────────────

export { my_player } from "./views/myPlayer";
export { my_equipment } from "./views/myEquipment";
export { my_quests } from "./views/myQuests";
export { my_titles } from "./views/myTitles";
export { my_guild } from "./views/myGuild";
export { my_guild_members } from "./views/myGuildMembers";
export { my_guild_messages } from "./views/myGuildMessages";
export { my_combat } from "./views/myCombat";
export { my_combat_log } from "./views/myCombatLog";
export { my_raid } from "./views/myRaid";
export { my_raid_combatants } from "./views/myRaidCombatants";
export { my_raid_log } from "./views/myRaidLog";
export { biome_players } from "./views/biomePlayers";
export { leaderboard } from "./views/leaderboard";
export { browse_guilds } from "./views/browseGuilds";

// ── Init (seed spells + schedule idle tick) ──────────────────────

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

  // Schedule idle tick — runs every 1 hour (3_600_000_000 microseconds)
  const ONE_HOUR_MICROS = 3_600_000_000n;
  ctx.db.idleTickSchedule.insert({
    scheduledId: 0n,
    scheduledAt: ScheduleAt.interval(ONE_HOUR_MICROS),
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
  }
});

export const onDisconnect = spacetimedb.clientDisconnected((ctx) => {
  const existing = ctx.db.player.identity.find(ctx.sender);
  if (existing) {
    ctx.db.player.identity.update({ ...existing, online: false });
  }
});
