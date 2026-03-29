import { table, t } from "spacetimedb/server";
import { FriendshipStatus } from "../types/friendshipStatus";

export const friendship = table(
  { name: "friendship", public: true },
  {
    id: t.u64().primaryKey().autoInc(),
    senderId: t.identity().index("btree"),
    receiverId: t.identity().index("btree"),
    status: FriendshipStatus,
    createdAt: t.timestamp(),
  },
);
