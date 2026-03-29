import { t, SenderError } from "spacetimedb/server";
import spacetimedb from "../schema";

/**
 * Send a friend request by target player name.
 * Creates a Pending friendship row.
 */
export const send_friend_request = spacetimedb.reducer(
  { targetName: t.string() },
  (ctx, { targetName }) => {
    const me = ctx.db.player.identity.find(ctx.sender);
    if (!me) throw new SenderError("Player not found");

    // Find target player by name
    let target = null;
    for (const p of ctx.db.player.iter()) {
      if (p.name === targetName && !p.identity.isEqual(ctx.sender)) {
        target = p;
        break;
      }
    }
    if (!target) throw new SenderError("Player not found");

    // Check for existing friendship in either direction
    for (const f of ctx.db.friendship.senderId.filter(ctx.sender)) {
      if (f.receiverId.isEqual(target.identity)) {
        throw new SenderError("Friend request already sent");
      }
    }
    for (const f of ctx.db.friendship.receiverId.filter(ctx.sender)) {
      if (f.senderId.isEqual(target.identity)) {
        throw new SenderError("Already friends or request pending");
      }
    }

    ctx.db.friendship.insert({
      id: 0n,
      senderId: ctx.sender,
      receiverId: target.identity,
      status: { tag: "Pending" },
      createdAt: ctx.timestamp,
    });
  },
);

/**
 * Accept a pending friend request.
 */
export const accept_friend_request = spacetimedb.reducer(
  { friendshipId: t.u64() },
  (ctx, { friendshipId }) => {
    const f = ctx.db.friendship.id.find(friendshipId);
    if (!f) throw new SenderError("Friendship not found");
    if (!f.receiverId.isEqual(ctx.sender)) throw new SenderError("Only the receiver can accept");
    if (f.status.tag !== "Pending") throw new SenderError("Already accepted");

    ctx.db.friendship.id.update({ ...f, status: { tag: "Accepted" } });
  },
);

/**
 * Reject a pending friend request.
 */
export const reject_friend_request = spacetimedb.reducer(
  { friendshipId: t.u64() },
  (ctx, { friendshipId }) => {
    const f = ctx.db.friendship.id.find(friendshipId);
    if (!f) throw new SenderError("Friendship not found");
    if (!f.receiverId.isEqual(ctx.sender)) throw new SenderError("Only the receiver can reject");
    if (f.status.tag !== "Pending") throw new SenderError("Not a pending request");

    ctx.db.friendship.id.delete(friendshipId);
  },
);

/**
 * Remove an existing friend (either side can remove).
 */
export const remove_friend = spacetimedb.reducer(
  { friendshipId: t.u64() },
  (ctx, { friendshipId }) => {
    const f = ctx.db.friendship.id.find(friendshipId);
    if (!f) throw new SenderError("Friendship not found");
    if (!f.senderId.isEqual(ctx.sender) && !f.receiverId.isEqual(ctx.sender)) {
      throw new SenderError("Not your friendship");
    }

    ctx.db.friendship.id.delete(friendshipId);
  },
);
