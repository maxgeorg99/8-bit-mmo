import { t } from "spacetimedb/server";
import spacetimedb from "../schema";
import { raidCombatant } from "../tables/raidCombatant";

export const my_raid_combatants = spacetimedb.view(
  { name: "my_raid_combatants", public: true },
  t.array(raidCombatant.rowType),
  (ctx) => {
    // Find the caller's guild's active raid combatants
    for (const membership of ctx.db.guildMember.playerId.filter(ctx.sender)) {
      for (const r of ctx.db.raid.guildId.filter(membership.guildId)) {
        if (r.phase.tag === "Victory" || r.phase.tag === "Defeat") continue;
        const combatants = [];
        for (const rc of ctx.db.raidCombatant.raidId.filter(r.id)) {
          combatants.push(rc);
        }
        return combatants;
      }
    }
    return [];
  },
);
