import { t, SenderError } from "spacetimedb/server";
import spacetimedb from "../schema";
import { Identity } from "spacetimedb";

export const create_guild = spacetimedb.reducer(
  { name: t.string(), tag: t.string(), description: t.string() },
  (ctx, { name, tag, description }) => {
    const p = ctx.db.player.identity.find(ctx.sender);
    if (!p) throw new SenderError("Player not found");

    // Check player is not already in a guild
    for (const _m of ctx.db.guildMember.playerId.filter(ctx.sender)) {
      throw new SenderError("Already in a guild");
    }

    if (name.length < 2 || name.length > 30)
      throw new SenderError("Guild name must be 2-30 characters");
    if (tag.length < 1 || tag.length > 4) throw new SenderError("Tag must be 1-4 characters");

    // Check guild name uniqueness
    for (const _g of ctx.db.guild.name.filter(name)) {
      throw new SenderError("Guild name already taken");
    }

    const guild = ctx.db.guild.insert({
      id: 0n,
      name,
      tag: tag.toUpperCase().slice(0, 4),
      description,
      createdAt: ctx.timestamp,
      maxMembers: 20,
      memberCount: 1,
      raidWins: 0,
    });

    ctx.db.guildMember.insert({
      id: 0n,
      guildId: guild.id,
      playerId: ctx.sender,
      role: { tag: "Leader" },
      joinedAt: ctx.timestamp,
    });

    ctx.db.message.insert({
      id: 0n,
      guildId: guild.id,
      biomeId: "",
      whisperTo: Identity.zero(),
      authorId: ctx.sender,
      authorName: "System",
      text: `Guild "${name}" has been founded!`,
      timestamp: ctx.timestamp,
    });
  },
);

export const join_guild = spacetimedb.reducer({ guildId: t.u64() }, (ctx, { guildId }) => {
  const p = ctx.db.player.identity.find(ctx.sender);
  if (!p) throw new SenderError("Player not found");

  // Check player is not already in a guild
  for (const _m of ctx.db.guildMember.playerId.filter(ctx.sender)) {
    throw new SenderError("Already in a guild");
  }

  const g = ctx.db.guild.id.find(guildId);
  if (!g) throw new SenderError("Guild not found");
  if (g.memberCount >= g.maxMembers) throw new SenderError("Guild is full");

  ctx.db.guildMember.insert({
    id: 0n,
    guildId,
    playerId: ctx.sender,
    role: { tag: "Member" },
    joinedAt: ctx.timestamp,
  });

  // Increment denormalized member count
  ctx.db.guild.id.update({ ...g, memberCount: g.memberCount + 1 });

  ctx.db.message.insert({
    id: 0n,
    guildId,
    biomeId: "",
    whisperTo: Identity.zero(),
    authorId: ctx.sender,
    authorName: "System",
    text: `${p.name} has joined the guild!`,
    timestamp: ctx.timestamp,
  });
});

export const leave_guild = spacetimedb.reducer({}, (ctx) => {
  const p = ctx.db.player.identity.find(ctx.sender);
  if (!p) throw new SenderError("Player not found");

  let myMembership = null;
  for (const m of ctx.db.guildMember.playerId.filter(ctx.sender)) {
    myMembership = m;
    break;
  }
  if (!myMembership) throw new SenderError("Not in a guild");

  const guildId = myMembership.guildId;
  const g = ctx.db.guild.id.find(guildId);

  // Post leave message
  ctx.db.message.insert({
    id: 0n,
    guildId,
    biomeId: "",
    whisperTo: Identity.zero(),
    authorId: ctx.sender,
    authorName: "System",
    text: `${p.name} has left the guild.`,
    timestamp: ctx.timestamp,
  });

  // Remove membership
  ctx.db.guildMember.id.delete(myMembership.id);

  // Decrement count
  const newCount = g ? g.memberCount - 1 : 0;

  if (newCount <= 0) {
    // Guild is empty — cascade delete everything
    // Delete all remaining members (shouldn't be any, but safety)
    for (const m of ctx.db.guildMember.guildId.filter(guildId)) {
      ctx.db.guildMember.id.delete(m.id);
    }
    // Delete all guild messages
    for (const msg of ctx.db.message.guildId.filter(guildId)) {
      ctx.db.message.id.delete(msg.id);
    }
    // Delete any active raids + combatants + logs
    for (const r of ctx.db.raid.guildId.filter(guildId)) {
      for (const rc of ctx.db.raidCombatant.raidId.filter(r.id)) {
        ctx.db.raidCombatant.id.delete(rc.id);
      }
      for (const rl of ctx.db.raidLog.raidId.filter(r.id)) {
        ctx.db.raidLog.id.delete(rl.id);
      }
      ctx.db.raid.id.delete(r.id);
    }
    // Delete the guild
    ctx.db.guild.id.delete(guildId);
  } else {
    // Update count
    if (g) ctx.db.guild.id.update({ ...g, memberCount: newCount });

    // If leader left, promote first remaining member
    if (myMembership.role.tag === "Leader") {
      for (const m of ctx.db.guildMember.guildId.filter(guildId)) {
        ctx.db.guildMember.id.update({ ...m, role: { tag: "Leader" } });
        break;
      }
    }
  }
});

export const send_guild_message = spacetimedb.reducer({ text: t.string() }, (ctx, { text }) => {
  const p = ctx.db.player.identity.find(ctx.sender);
  if (!p) throw new SenderError("Player not found");
  if (text.length < 1 || text.length > 500)
    throw new SenderError("Message must be 1-500 characters");

  let guildId: bigint | null = null;
  for (const m of ctx.db.guildMember.playerId.filter(ctx.sender)) {
    guildId = m.guildId;
    break;
  }
  if (guildId === null) throw new SenderError("Not in a guild");

  ctx.db.message.insert({
    id: 0n,
    guildId,
    biomeId: "",
    whisperTo: Identity.zero(),
    authorId: ctx.sender,
    authorName: p.name,
    text,
    timestamp: ctx.timestamp,
  });
});

export const promote_member = spacetimedb.reducer(
  { targetPlayerId: t.identity() },
  (ctx, { targetPlayerId }) => {
    let callerMembership = null;
    for (const m of ctx.db.guildMember.playerId.filter(ctx.sender)) {
      callerMembership = m;
      break;
    }
    if (!callerMembership) throw new SenderError("Not in a guild");
    if (callerMembership.role.tag === "Member") throw new SenderError("No permission");

    for (const m of ctx.db.guildMember.guildId.filter(callerMembership.guildId)) {
      if (m.playerId.isEqual(targetPlayerId) && m.role.tag === "Member") {
        ctx.db.guildMember.id.update({ ...m, role: { tag: "Officer" } });
        return;
      }
    }
    throw new SenderError("Target not found or already promoted");
  },
);

export const kick_member = spacetimedb.reducer(
  { targetPlayerId: t.identity() },
  (ctx, { targetPlayerId }) => {
    if (ctx.sender.isEqual(targetPlayerId)) throw new SenderError("Cannot kick yourself");

    let callerMembership = null;
    for (const m of ctx.db.guildMember.playerId.filter(ctx.sender)) {
      callerMembership = m;
      break;
    }
    if (!callerMembership) throw new SenderError("Not in a guild");
    if (callerMembership.role.tag === "Member") throw new SenderError("No permission");

    const guildId = callerMembership.guildId;

    for (const m of ctx.db.guildMember.guildId.filter(guildId)) {
      if (m.playerId.isEqual(targetPlayerId)) {
        if (m.role.tag === "Leader") throw new SenderError("Cannot kick the leader");
        ctx.db.guildMember.id.delete(m.id);

        // Decrement member count
        const g = ctx.db.guild.id.find(guildId);
        if (g) ctx.db.guild.id.update({ ...g, memberCount: g.memberCount - 1 });
        return;
      }
    }
    throw new SenderError("Target not found");
  },
);
