import { schema } from "spacetimedb/server";
import { player } from "./tables/player";
import { spell } from "./tables/spell";
import { combat } from "./tables/combat";
import { combatLog } from "./tables/combatLog";

const spacetimedb = schema({ player, spell, combat, combatLog });

export default spacetimedb;
