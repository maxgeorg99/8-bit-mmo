import spacetimedb from "./schema";
export default spacetimedb;

// --- Reducers ---
export { join_combat } from "./reducers/joinCombat";
export { cast_spell } from "./reducers/castSpell";
export { leave_combat } from "./reducers/leaveCombat";

// --- Views ---
export { my_combat } from "./views/myCombat";
export { my_player } from "./views/myPlayer";

// --- Init (seed spells) ---

export const init = spacetimedb.init((ctx) => {
  const spells = [
    { name: "Fireball", element: { tag: "Fire" }, damage: 25, manaCost: 20 },
    { name: "Ice Shard", element: { tag: "Ice" }, damage: 15, manaCost: 10 },
    { name: "Lightning Bolt", element: { tag: "Lightning" }, damage: 30, manaCost: 25 },
    { name: "Arcane Missile", element: { tag: "Fire" }, damage: 10, manaCost: 5 },
    { name: "Frost Nova", element: { tag: "Ice" }, damage: 20, manaCost: 15 },
    { name: "Chain Lightning", element: { tag: "Lightning" }, damage: 35, manaCost: 30 },
  ];

  for (const sp of spells) {
    ctx.db.spell.insert({
      id: 0n,
      name: sp.name,
      element: sp.element as any,
      damage: sp.damage,
      manaCost: sp.manaCost,
    });
  }
});

// --- Lifecycle ---

export const onConnect = spacetimedb.clientConnected((ctx) => {
  const existing = ctx.db.player.identity.find(ctx.sender);
  if (existing) {
    ctx.db.player.identity.update({ ...existing, online: true });
  } else {
    ctx.db.player.insert({
      identity: ctx.sender,
      name: "",
      online: true,
      characterClass: undefined,
      wins: 0,
      losses: 0,
    });
  }
});

export const onDisconnect = spacetimedb.clientDisconnected((ctx) => {
  const existing = ctx.db.player.identity.find(ctx.sender);
  if (existing) {
    ctx.db.player.identity.update({ ...existing, online: false });
  }
});
