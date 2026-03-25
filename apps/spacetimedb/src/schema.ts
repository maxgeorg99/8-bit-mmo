import { schema } from "spacetimedb/server";

// Player core
import { player } from "./tables/player";
import { activityLog } from "./tables/activityLog";
import { quest } from "./tables/quest";
import { equipmentItem } from "./tables/equipmentItem";
import { playerTitle } from "./tables/playerTitle";

// Social
import { guild } from "./tables/guild";
import { guildMember } from "./tables/guildMember";
import { message } from "./tables/message";

// PvP combat
import { spell } from "./tables/spell";
import { combat } from "./tables/combat";
import { combatLog } from "./tables/combatLog";

// Raids
import { raid } from "./tables/raid";
import { raidCombatant } from "./tables/raidCombatant";
import { raidLog } from "./tables/raidLog";

// Scheduled
import { idleTickSchedule } from "./tables/idleTickSchedule";

const spacetimedb = schema({
  // Player core
  player,
  activityLog,
  quest,
  equipmentItem,
  playerTitle,

  // Social
  guild,
  guildMember,
  message,

  // PvP combat
  spell,
  combat,
  combatLog,

  // Raids
  raid,
  raidCombatant,
  raidLog,

  // Scheduled
  idleTickSchedule,
});

export default spacetimedb;
