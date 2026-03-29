import { t } from "spacetimedb/server";

export const FriendshipStatus = t.enum("FriendshipStatus", {
  Pending: t.unit(),
  Accepted: t.unit(),
});
