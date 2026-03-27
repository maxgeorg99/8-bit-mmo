import { useState, useCallback } from "react";
import type { BiomeId } from "@/lib/biomeThemes";
import type { MobDefinition } from "@/lib/mobs";
import { getRandomMob, rollLoot } from "@/lib/mobs";
import {
  getPlayerSpells,
  getMobSpells,
  calculateDamage,
  calculateHeal,
  aiSelectSpell,
  pveMaxHp,
  pveMaxMana,
  type PveSpell,
  type PveCombatLogEntry,
} from "@/lib/combatEngine";
import { useMyPlayer } from "@/hooks/useStdbPlayer";
import type { EquipmentItem } from "@/lib/types";

export type PveCombatPhase = "idle" | "fighting" | "victory" | "defeat";

export interface PveCombatState {
  phase: PveCombatPhase;
  mob: MobDefinition | null;
  playerHp: number;
  playerMaxHp: number;
  playerMana: number;
  playerMaxMana: number;
  mobHp: number;
  mobMaxHp: number;
  mobMana: number;
  mobMaxMana: number;
  isPlayerTurn: boolean;
  logs: PveCombatLogEntry[];
  playerSpells: PveSpell[];
  xpEarned: number;
  lootDrops: EquipmentItem[];
}

export function usePveCombat() {
  const { player } = useMyPlayer();

  const [state, setState] = useState<PveCombatState>({
    phase: "idle",
    mob: null,
    playerHp: 0,
    playerMaxHp: 0,
    playerMana: 0,
    playerMaxMana: 0,
    mobHp: 0,
    mobMaxHp: 0,
    mobMana: 0,
    mobMaxMana: 0,
    isPlayerTurn: true,
    logs: [],
    playerSpells: [],
    xpEarned: 0,
    lootDrops: [],
  });

  const startCombat = useCallback(
    (biomeId: BiomeId) => {
      if (!player) return;
      const mob = getRandomMob(biomeId);
      const maxHp = pveMaxHp(player.level, player.stats.CON);
      const maxMana = pveMaxMana(player.level, player.stats.MP, player.stats.INT);
      const spells = getPlayerSpells(player.stats);

      setState({
        phase: "fighting",
        mob,
        playerHp: maxHp,
        playerMaxHp: maxHp,
        playerMana: maxMana,
        playerMaxMana: maxMana,
        mobHp: mob.hp,
        mobMaxHp: mob.hp,
        mobMana: mob.mana,
        mobMaxMana: mob.mana,
        isPlayerTurn: true,
        logs: [],
        playerSpells: spells,
        xpEarned: 0,
        lootDrops: [],
      });
    },
    [player?.level, player?.stats],
  );

  const castSpell = useCallback((spellId: string) => {
    setState((prev) => {
      if (prev.phase !== "fighting" || !prev.isPlayerTurn || !prev.mob) return prev;

      const spell = prev.playerSpells.find((s) => s.id === spellId);
      if (!spell || spell.manaCost > prev.playerMana) return prev;

      let logId = prev.logs.length;
      const newLogs = [...prev.logs];
      let newPlayerHp = prev.playerHp;
      let newPlayerMana = prev.playerMana - spell.manaCost;
      let newMobHp = prev.mobHp;
      let newMobMana = prev.mobMana;

      // Player action
      if (spell.isHeal) {
        const heal = calculateHeal(spell.damage);
        newPlayerHp = Math.min(prev.playerMaxHp, newPlayerHp + heal);
        newLogs.push({
          id: logId++,
          caster: "player",
          spellName: spell.name,
          element: spell.element,
          damage: heal,
          isHeal: true,
        });
      } else {
        const dmg = calculateDamage(spell.damage);
        newMobHp = Math.max(0, newMobHp - dmg);
        newLogs.push({
          id: logId++,
          caster: "player",
          spellName: spell.name,
          element: spell.element,
          damage: dmg,
          isHeal: false,
        });
      }

      // Check if mob is dead
      if (newMobHp <= 0) {
        const loot = rollLoot(prev.mob);
        return {
          ...prev,
          phase: "victory",
          playerHp: newPlayerHp,
          playerMana: newPlayerMana,
          mobHp: 0,
          logs: newLogs,
          isPlayerTurn: false,
          xpEarned: prev.mob.xpReward,
          lootDrops: loot,
        };
      }

      // Mob turn — AI selects spell
      const mobSpells = getMobSpells(prev.mob.damage, prev.mob.mana);
      const mobSpell = aiSelectSpell(mobSpells, newMobMana);
      const mobDmg = calculateDamage(mobSpell.damage);
      newMobMana = Math.max(0, newMobMana - mobSpell.manaCost);
      newPlayerHp = Math.max(0, newPlayerHp - mobDmg);

      newLogs.push({
        id: logId++,
        caster: "mob",
        spellName: mobSpell.name,
        element: mobSpell.element,
        damage: mobDmg,
        isHeal: false,
      });

      // Check if player is dead
      if (newPlayerHp <= 0) {
        return {
          ...prev,
          phase: "defeat",
          playerHp: 0,
          playerMana: newPlayerMana,
          mobHp: newMobHp,
          mobMana: newMobMana,
          logs: newLogs,
          isPlayerTurn: false,
          xpEarned: 0,
          lootDrops: [],
        };
      }

      // Regen 3 mana per turn for player
      const manaRegen = Math.min(3, prev.playerMaxMana - newPlayerMana);
      newPlayerMana += manaRegen;

      return {
        ...prev,
        playerHp: newPlayerHp,
        playerMana: newPlayerMana,
        mobHp: newMobHp,
        mobMana: newMobMana,
        logs: newLogs,
        isPlayerTurn: true,
      };
    });
  }, []);

  const reset = useCallback(() => {
    setState((prev) => ({
      ...prev,
      phase: "idle",
      mob: null,
      logs: [],
      xpEarned: 0,
      lootDrops: [],
    }));
  }, []);

  return {
    ...state,
    startCombat,
    castSpell,
    reset,
  };
}
