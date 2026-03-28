import { t, SenderError } from "spacetimedb/server";
import spacetimedb from "../schema";
import { EquipSlot } from "../types/equipSlot";
import { ItemRarity } from "../types/itemRarity";

const SELL_PRICES: Record<string, number> = {
  Common: 5,
  Uncommon: 12,
  Rare: 25,
  Epic: 60,
  Legendary: 150,
};

// Server-side shop catalog — prices are authoritative here, never from client
const SHOP_PRICES: Record<string, number> = {
  // Plains
  "shop-plains-staff": 15,
  "shop-plains-tunic": 20,
  "shop-plains-cap": 30,
  // Tundra
  "shop-tundra-axe": 35,
  "shop-tundra-fur": 40,
  "shop-tundra-helm": 50,
  // Volcano
  "shop-volcano-blade": 45,
  "shop-volcano-plate": 55,
  "shop-volcano-crown": 60,
  // Forest
  "shop-forest-bow": 30,
  "shop-forest-cloak": 35,
  "shop-forest-circlet": 45,
  // Desert
  "shop-desert-scimitar": 50,
  "shop-desert-robe": 55,
  "shop-desert-turban": 60,
  // Dungeon
  "shop-dungeon-dagger": 55,
  "shop-dungeon-shadow": 60,
  "shop-dungeon-hood": 65,
  // Spire
  "shop-spire-wand": 60,
  "shop-spire-vest": 65,
  "shop-spire-tiara": 70,
  // Ruins
  "shop-ruins-hammer": 65,
  "shop-ruins-mail": 70,
  "shop-ruins-mask": 75,
  // Celestial
  "shop-celestial-scepter": 80,
  "shop-celestial-aegis": 85,
  "shop-celestial-halo": 90,
};

export const buy_item = spacetimedb.reducer(
  {
    itemId: t.string(),
    itemName: t.string(),
    slot: EquipSlot,
    rarity: ItemRarity,
    levelReq: t.u32(),
    bonusStr: t.i32(),
    bonusAgi: t.i32(),
    bonusInt: t.i32(),
    bonusCon: t.i32(),
    bonusWis: t.i32(),
    bonusCha: t.i32(),
    bonusMp: t.i32(),
  },
  (ctx, args) => {
    const p = ctx.db.player.identity.find(ctx.sender);
    if (!p) throw new SenderError("Player not found");

    // Server-side price lookup — never trust client cost
    const cost = SHOP_PRICES[args.itemId];
    if (cost === undefined) throw new SenderError("Item not in shop catalog");
    if (p.gold < cost) throw new SenderError("Not enough gold");

    // Check level requirement
    if (p.level < args.levelReq) throw new SenderError("Level too low");

    // Build a unique ID for this player + item combination
    const uniqueId = `${ctx.sender.toHexString().slice(0, 16)}-${args.itemId}`;

    // Check if player already owns this item
    const existing = ctx.db.equipmentItem.id.find(uniqueId);
    if (existing) {
      throw new SenderError("Already own this item");
    }

    // Deduct gold using server-side price
    ctx.db.player.identity.update({ ...p, gold: p.gold - cost });

    // Add item to inventory
    ctx.db.equipmentItem.insert({
      id: uniqueId,
      playerId: ctx.sender,
      name: args.itemName,
      slot: args.slot,
      rarity: args.rarity,
      equipped: false,
      levelReq: args.levelReq,
      source: "shop",
      bonusStr: args.bonusStr,
      bonusAgi: args.bonusAgi,
      bonusInt: args.bonusInt,
      bonusCon: args.bonusCon,
      bonusWis: args.bonusWis,
      bonusCha: args.bonusCha,
      bonusMp: args.bonusMp,
    });
  },
);

export const sell_item = spacetimedb.reducer({ itemId: t.string() }, (ctx, { itemId }) => {
  const p = ctx.db.player.identity.find(ctx.sender);
  if (!p) throw new SenderError("Player not found");

  const item = ctx.db.equipmentItem.id.find(itemId);
  if (!item) throw new SenderError("Item not found");
  if (!item.playerId.isEqual(ctx.sender)) throw new SenderError("Not your item");
  if (item.equipped) throw new SenderError("Cannot sell equipped item");

  const sellPrice = SELL_PRICES[item.rarity.tag] ?? 5;
  ctx.db.player.identity.update({ ...p, gold: p.gold + sellPrice });
  ctx.db.equipmentItem.id.delete(itemId);
});

export const rest_at_city = spacetimedb.reducer({}, (ctx) => {
  const p = ctx.db.player.identity.find(ctx.sender);
  if (!p) throw new SenderError("Player not found");
  if (p.hp >= p.maxHp) throw new SenderError("Already at full HP");

  const healCost = Math.max(5, Math.floor(p.level * 2));
  if (p.gold < healCost) throw new SenderError("Not enough gold");

  ctx.db.player.identity.update({
    ...p,
    hp: p.maxHp,
    gold: p.gold - healCost,
  });
});
