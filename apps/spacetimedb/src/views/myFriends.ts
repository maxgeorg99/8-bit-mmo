import { t } from "spacetimedb/server";
import spacetimedb from "../schema";
import { friendship } from "../tables/friendship";

/**
 * Returns all friendships where the caller is either sender or receiver.
 * This includes both Pending requests and Accepted friendships.
 */
export const my_friends = spacetimedb.view(
  { name: "my_friends", public: true },
  t.array(friendship.rowType),
  (ctx) => {
    const results = [];

    // Friendships where I'm the sender
    for (const f of ctx.db.friendship.senderId.filter(ctx.sender)) {
      results.push(f);
    }

    // Friendships where I'm the receiver
    for (const f of ctx.db.friendship.receiverId.filter(ctx.sender)) {
      results.push(f);
    }

    return results;
  },
);
