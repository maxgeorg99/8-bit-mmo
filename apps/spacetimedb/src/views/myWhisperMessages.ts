import { t } from "spacetimedb/server";
import spacetimedb from "../schema";
import { message } from "../tables/message";

export const my_whisper_messages = spacetimedb.view(
  { name: "my_whisper_messages", public: true },
  t.array(message.rowType),
  (ctx) => {
    const sent = Array.from(ctx.db.message.authorId.filter(ctx.sender)).filter(
      (m) => m.whisperTo !== undefined,
    );

    const received = Array.from(ctx.db.message.whisperTo.filter(ctx.sender));

    return [...sent, ...received];
  },
);
