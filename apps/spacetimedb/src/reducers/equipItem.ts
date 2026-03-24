import { t, SenderError } from "spacetimedb/server";
import spacetimedb from "../schema";

export const equip_item = spacetimedb.reducer({ itemId: t.string() }, (ctx, { itemId }) => {
  const p = ctx.db.player.identity.find(ctx.sender);
  if (!p) throw new SenderError("Player not found");

  const item = ctx.db.equipmentItem.id.find(itemId);
  if (!item) throw new SenderError("Item not found");
  if (!item.playerId.isEqual(ctx.sender)) throw new SenderError("Not your item");
  if (p.level < item.levelReq) throw new SenderError("Level too low");

  // Unequip current item in the same slot
  for (const existing of ctx.db.equipmentItem.playerId.filter(ctx.sender)) {
    if (existing.equipped && existing.slot.tag === item.slot.tag && existing.id !== itemId) {
      ctx.db.equipmentItem.id.update({ ...existing, equipped: false });
    }
  }

  // Equip the new item
  ctx.db.equipmentItem.id.update({ ...item, equipped: true });
});

export const unequip_item = spacetimedb.reducer({ itemId: t.string() }, (ctx, { itemId }) => {
  const item = ctx.db.equipmentItem.id.find(itemId);
  if (!item) throw new SenderError("Item not found");
  if (!item.playerId.isEqual(ctx.sender)) throw new SenderError("Not your item");

  ctx.db.equipmentItem.id.update({ ...item, equipped: false });
});
