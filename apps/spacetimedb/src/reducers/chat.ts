import { t, SenderError } from "spacetimedb/server";
import spacetimedb from "../schema";
import { Identity } from "spacetimedb";

export const send_biome_message = spacetimedb.reducer({ text: t.string() }, (ctx, { text }) => {
  const p = ctx.db.player.identity.find(ctx.sender);
  if (!p) throw new SenderError("Player not found");
  if (!p.currentBiome) throw new SenderError("Not in a biome");
  if (text.length < 1 || text.length > 500)
    throw new SenderError("Message must be 1-500 characters");

  ctx.db.message.insert({
    id: 0n,
    guildId: 0n,
    biomeId: p.currentBiome,
    whisperTo: Identity.zero(),
    authorId: ctx.sender,
    authorName: p.name || "Anonymous",
    text,
    timestamp: ctx.timestamp,
  });
});

export const send_whisper = spacetimedb.reducer(
  { targetName: t.string(), text: t.string() },
  (ctx, { targetName, text }) => {
    const sender = ctx.db.player.identity.find(ctx.sender);
    if (!sender) throw new SenderError("Player not found");
    if (text.length < 1 || text.length > 500)
      throw new SenderError("Message must be 1-500 characters");

    // Find target player by name
    let target = null;
    for (const p of ctx.db.player.iter()) {
      if (p.name === targetName) {
        target = p;
        break;
      }
    }
    if (!target) throw new SenderError(`Player "${targetName}" not found`);
    if (target.identity.isEqual(ctx.sender)) throw new SenderError("Cannot whisper to yourself");

    ctx.db.message.insert({
      id: 0n,
      guildId: 0n,
      biomeId: "",
      whisperTo: target.identity,
      authorId: ctx.sender,
      authorName: sender.name || "Anonymous",
      text,
      timestamp: ctx.timestamp,
    });
  },
);
