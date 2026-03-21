import { useCallback, useEffect, useRef, useState } from "react";
import type { Identity } from "spacetimedb";
import {
  DbConnection,
  type EventContext,
  type SubscriptionEventContext,
  type SubscriptionHandle,
} from "@/generated";
import type { Combat, CombatLog, Player, Spell } from "@/generated/types";
import { connect, disconnect } from "@/lib/spacetimedb";

export type { Combat, CombatLog, Player, Spell };

function findMyCombat(ctx: { db: DbConnection["db"] }, id: Identity): Combat | null {
  for (const c of ctx.db.combat.iter()) {
    if (c.status.tag === "Finished") continue;
    if (c.player1.isEqual(id) || (c.player2 && c.player2.isEqual(id))) {
      return c;
    }
  }
  return null;
}

export function useCombat() {
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [connected, setConnected] = useState(false);
  const [combat, setCombat] = useState<Combat | null>(null);
  const [spells, setSpells] = useState<Spell[]>([]);
  const [logs, setLogs] = useState<CombatLog[]>([]);
  const [myPlayer, setMyPlayer] = useState<Player | null>(null);
  const [opponent, setOpponent] = useState<Player | null>(null);
  const connRef = useRef<DbConnection | null>(null);
  const identityRef = useRef<Identity | null>(null);
  const subRef = useRef<SubscriptionHandle | null>(null);

  useEffect(() => {
    connect(
      (ctx, id) => {
        connRef.current = ctx;
        identityRef.current = id;
        setIdentity(id);
        setConnected(true);

        // Live update callbacks (for changes AFTER initial subscription)
        ctx.db.combat.onInsert((_ctx: EventContext, c: Combat) => {
          if (c.player1.isEqual(id) || (c.player2 && c.player2.isEqual(id))) {
            setCombat(c);
          }
        });
        ctx.db.combat.onUpdate((_ctx: EventContext, _old: Combat, c: Combat) => {
          if (c.player1.isEqual(id) || (c.player2 && c.player2.isEqual(id))) {
            setCombat(c);
          }
        });
        ctx.db.combat.onDelete((_ctx: EventContext, c: Combat) => {
          if (c.player1.isEqual(id) || (c.player2 && c.player2.isEqual(id))) {
            setCombat(null);
            setLogs([]);
          }
        });

        ctx.db.combatLog.onInsert((_ctx: EventContext, log: CombatLog) => {
          setLogs((prev) => [...prev, log]);
        });

        ctx.db.player.onInsert((_ctx: EventContext, p: Player) => {
          if (p.identity.isEqual(id)) setMyPlayer(p);
          else setOpponent(p);
        });
        ctx.db.player.onUpdate((_ctx: EventContext, _old: Player, p: Player) => {
          if (p.identity.isEqual(id)) setMyPlayer(p);
          else setOpponent(p);
        });

        // Subscribe and load initial state onApplied
        subRef.current = ctx
          .subscriptionBuilder()
          .onApplied((subCtx: SubscriptionEventContext) => {
            // Read full initial state from the cache
            setSpells([...subCtx.db.spell.iter()]);
            setCombat(findMyCombat(subCtx, id));
            setLogs([...subCtx.db.combatLog.iter()]);

            for (const p of subCtx.db.player.iter()) {
              if (p.identity.isEqual(id)) setMyPlayer(p);
              else setOpponent(p);
            }
          })
          .onError((e: unknown) => {
            console.error("[SpacetimeDB] Subscription error:", e);
          })
          .subscribe([
            "SELECT * FROM spell",
            "SELECT * FROM combat",
            "SELECT * FROM combat_log",
            "SELECT * FROM player",
          ]);
      },
      (err) => {
        console.error("SpacetimeDB connect error:", err);
      },
    );

    return () => {
      disconnect();
      connRef.current = null;
    };
  }, []);

  const isMyTurn =
    combat?.status.tag === "InProgress" && identity != null && combat.currentTurn.isEqual(identity);

  const isPlayer1 = identity != null && combat != null && combat.player1.isEqual(identity);

  const myHp = combat ? (isPlayer1 ? combat.player1Hp : combat.player2Hp) : 0;
  const myMana = combat ? (isPlayer1 ? combat.player1Mana : combat.player2Mana) : 0;
  const opponentHp = combat ? (isPlayer1 ? combat.player2Hp : combat.player1Hp) : 0;
  const opponentMana = combat ? (isPlayer1 ? combat.player2Mana : combat.player1Mana) : 0;

  const joinCombat = useCallback(() => {
    void connRef.current?.reducers.joinCombat({});
  }, []);

  const castSpell = useCallback(
    (spellId: bigint) => {
      if (combat) {
        void connRef.current?.reducers.castSpell({
          combatId: BigInt(combat.id),
          spellId: BigInt(spellId),
        });
      }
    },
    [combat],
  );

  const leaveCombat = useCallback(() => {
    if (combat) {
      void connRef.current?.reducers.leaveCombat({
        combatId: BigInt(combat.id),
      });
    }
  }, [combat]);

  return {
    connected,
    identity,
    combat,
    spells,
    logs: combat ? logs.filter((l) => l.combatId === combat.id) : [],
    myPlayer,
    opponent,
    isMyTurn,
    isPlayer1,
    myHp,
    myMana,
    opponentHp,
    opponentMana,
    joinCombat,
    castSpell,
    leaveCombat,
  };
}
