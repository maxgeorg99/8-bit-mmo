import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Guild,
  GuildMember,
  GuildMessage,
  PlayerClass,
  Raid,
  RaidCombatant,
  RaidLogEntry,
} from "./types";
import type { BiomeId } from "./biomeThemes";
import { RAID_BOSSES, type BossAbility } from "./bossDefinitions";
import { calculateDamage } from "./combatEngine";

// ── Raid helper spells for combatants ─────────────────────────

interface RaidSpell {
  id: string;
  name: string;
  element: string;
  damage: number;
  manaCost: number;
  isHeal?: boolean;
}

const PLAYER_SPELLS_RAID: RaidSpell[] = [
  { id: "r-slash", name: "Slash", element: "Physical", damage: 10, manaCost: 0 },
  { id: "r-fireball", name: "Fireball", element: "Fire", damage: 16, manaCost: 10 },
  { id: "r-heal", name: "Heal", element: "Heal", damage: 14, manaCost: 12, isHeal: true },
  { id: "r-arcane", name: "Arcane Bolt", element: "Arcane", damage: 20, manaCost: 16 },
];

export { PLAYER_SPELLS_RAID };

function bossPickAbility(abilities: BossAbility[], mana: number): BossAbility {
  // Prefer AoE when mana is high, otherwise pick random
  if (mana > 30) {
    const aoe = abilities.find((a) => a.isAoe);
    if (aoe && Math.random() > 0.4) return aoe;
  }
  return abilities[Math.floor(Math.random() * abilities.length)]!;
}

// ── Fake NPC guild members (pre-SpacetimeDB) ──────────────────

const NPC_MEMBERS: Omit<GuildMember, "joinedAt">[] = [
  { name: "Thalion", playerClass: "Warrior", level: 12, role: "member", online: true },
  { name: "Lyra", playerClass: "Mage", level: 9, role: "member", online: false },
  { name: "Kael", playerClass: "Rogue", level: 15, role: "officer", online: true },
  { name: "Bramble", playerClass: "Druid", level: 7, role: "member", online: false },
  { name: "Seraphina", playerClass: "Paladin", level: 11, role: "member", online: true },
];

const NPC_GREETINGS = [
  "Welcome to the guild! 🎉",
  "Good to have you! Ready for some raids?",
  "Another hero joins! Let's go hunting.",
  "The guild grows stronger! 💪",
];

// ── Pre-made guilds for browsing ──────────────────────────────

function makeGuild(
  id: string,
  name: string,
  tag: string,
  description: string,
  members: Omit<GuildMember, "joinedAt">[],
): Guild {
  const now = Date.now();
  return {
    id,
    name,
    tag,
    description,
    createdAt: now - 7 * 86_400_000,
    members: members.map((m) => ({
      ...m,
      joinedAt: now - Math.floor(Math.random() * 7 * 86_400_000),
    })),
    messages: [
      {
        id: `msg-${id}-1`,
        authorName: members[0]?.name ?? "System",
        text: "Guild founded! Let's conquer the world.",
        timestamp: now - 6 * 86_400_000,
      },
    ],
    maxMembers: 20,
    activeRaid: null,
    raidWins: 0,
  };
}

const BROWSE_GUILDS: Guild[] = [
  makeGuild(
    "guild-ironwolves",
    "Iron Wolves",
    "IW",
    "Warriors forged in iron. Strength above all.",
    [
      { name: "Grimjaw", playerClass: "Warrior", level: 18, role: "leader", online: true },
      { name: "Stonehelm", playerClass: "Paladin", level: 14, role: "officer", online: true },
      { name: "Ragna", playerClass: "Ranger", level: 10, role: "member", online: false },
    ],
  ),
  makeGuild("guild-arcanum", "Arcanum", "ARC", "Seekers of forbidden knowledge.", [
    { name: "Vex", playerClass: "Mage", level: 20, role: "leader", online: false },
    { name: "Nyx", playerClass: "Scholar", level: 16, role: "officer", online: true },
  ]),
  makeGuild("guild-shadowstep", "Shadowstep", "SS", "Strike fast. Leave no trace.", [
    { name: "Shade", playerClass: "Rogue", level: 22, role: "leader", online: true },
    { name: "Whisper", playerClass: "Rogue", level: 13, role: "member", online: false },
    { name: "Dusk", playerClass: "Ranger", level: 11, role: "member", online: true },
    { name: "Echo", playerClass: "Bard", level: 8, role: "member", online: false },
  ]),
  makeGuild("guild-healers", "Order of the Green", "OG", "Protectors and healers of the realm.", [
    { name: "Willowroot", playerClass: "Druid", level: 17, role: "leader", online: true },
    { name: "Solace", playerClass: "Paladin", level: 12, role: "officer", online: true },
  ]),
];

// ── Store ─────────────────────────────────────────────────────

interface GuildState {
  /** The player's current guild, or null if not in one */
  guild: Guild | null;
  /** Available guilds to browse/join */
  browseGuilds: Guild[];

  createGuild: (
    name: string,
    tag: string,
    description: string,
    playerName: string,
    playerClass: PlayerClass,
    playerLevel: number,
  ) => void;
  joinGuild: (
    guildId: string,
    playerName: string,
    playerClass: PlayerClass,
    playerLevel: number,
  ) => void;
  leaveGuild: (playerName: string) => void;
  sendMessage: (authorName: string, text: string) => void;
  promoteMember: (memberName: string) => void;
  kickMember: (memberName: string) => void;
  /** Start a raid against the boss of a given biome */
  startRaid: (biomeId: BiomeId) => void;
  /** Current combatant casts a spell during raid combat */
  raidCastSpell: (spellId: string) => void;
  /** Abandon/reset the current raid */
  abandonRaid: () => void;
}

export const useGuildStore = create<GuildState>()(
  persist(
    (set, get) => ({
      guild: null,
      browseGuilds: BROWSE_GUILDS,

      createGuild: (name, tag, description, playerName, playerClass, playerLevel) => {
        const id = `guild-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        const now = Date.now();

        // Player is the leader
        const leader: GuildMember = {
          name: playerName || "Hero",
          playerClass,
          level: playerLevel,
          joinedAt: now,
          role: "leader",
          online: true,
        };

        // Add a few NPC members to make it feel alive
        const npcPool = [...NPC_MEMBERS].sort(() => Math.random() - 0.5).slice(0, 3);
        const npcMembers: GuildMember[] = npcPool.map((m) => ({
          ...m,
          joinedAt: now,
        }));

        const greeting = NPC_GREETINGS[Math.floor(Math.random() * NPC_GREETINGS.length)]!;

        const guild: Guild = {
          id,
          name,
          tag: tag.toUpperCase().slice(0, 4),
          description,
          createdAt: now,
          members: [leader, ...npcMembers],
          messages: [
            {
              id: `msg-${now}-sys`,
              authorName: "System",
              text: `Guild "${name}" has been founded!`,
              timestamp: now,
            },
            {
              id: `msg-${now}-npc`,
              authorName: npcPool[0]?.name ?? "System",
              text: greeting,
              timestamp: now + 1000,
            },
          ],
          maxMembers: 20,
          activeRaid: null,
          raidWins: 0,
        };

        set({ guild });
      },

      joinGuild: (guildId, playerName, playerClass, playerLevel) => {
        const state = get();
        const target = state.browseGuilds.find((g) => g.id === guildId);
        if (!target) return;
        if (target.members.length >= target.maxMembers) return;

        const now = Date.now();
        const newMember: GuildMember = {
          name: playerName || "Hero",
          playerClass,
          level: playerLevel,
          joinedAt: now,
          role: "member",
          online: true,
        };

        const joinMsg: GuildMessage = {
          id: `msg-${now}-join`,
          authorName: "System",
          text: `${newMember.name} has joined the guild!`,
          timestamp: now,
        };

        const updatedGuild: Guild = {
          ...target,
          members: [...target.members, newMember],
          messages: [...target.messages, joinMsg],
          activeRaid: target.activeRaid ?? null,
          raidWins: target.raidWins ?? 0,
        };

        // Remove from browse list
        set({
          guild: updatedGuild,
          browseGuilds: state.browseGuilds.filter((g) => g.id !== guildId),
        });
      },

      leaveGuild: (playerName) => {
        const state = get();
        if (!state.guild) return;

        // If leaving, add guild back to browse list (without the player)
        const remainingMembers = state.guild.members.filter((m) => m.name !== playerName);
        if (remainingMembers.length > 0) {
          // Promote first member to leader if leader left
          const hasLeader = remainingMembers.some((m) => m.role === "leader");
          if (!hasLeader && remainingMembers[0]) {
            remainingMembers[0] = { ...remainingMembers[0], role: "leader" };
          }
          const leftGuild: Guild = {
            ...state.guild,
            members: remainingMembers,
          };
          set({
            guild: null,
            browseGuilds: [...state.browseGuilds, leftGuild],
          });
        } else {
          // Guild is empty — dissolve
          set({ guild: null });
        }
      },

      sendMessage: (authorName, text) => {
        set((state) => {
          if (!state.guild) return state;
          const msg: GuildMessage = {
            id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 4)}`,
            authorName,
            text,
            timestamp: Date.now(),
          };
          // Keep last 50 messages
          const messages = [...state.guild.messages, msg].slice(-50);
          return { guild: { ...state.guild, messages } };
        });
      },

      promoteMember: (memberName) => {
        set((state) => {
          if (!state.guild) return state;
          return {
            guild: {
              ...state.guild,
              members: state.guild.members.map((m) =>
                m.name === memberName && m.role === "member" ? { ...m, role: "officer" } : m,
              ),
            },
          };
        });
      },

      kickMember: (memberName) => {
        set((state) => {
          if (!state.guild) return state;
          return {
            guild: {
              ...state.guild,
              members: state.guild.members.filter((m) => m.name !== memberName),
            },
          };
        });
      },

      startRaid: (biomeId) => {
        const state = get();
        if (!state.guild) return;
        if (state.guild.members.length < 3) return;
        if (state.guild.activeRaid) return;

        const boss = RAID_BOSSES[biomeId];
        if (!boss) return;

        const memberCount = state.guild.members.length;
        const bossMaxHp = boss.baseHp + boss.perMemberHp * memberCount;

        // Create combatants from guild members
        const combatants: RaidCombatant[] = state.guild.members.map((m) => {
          const baseHp = 40 + m.level * 5;
          const baseMana = 20 + m.level * 3;
          return {
            name: m.name,
            playerClass: m.playerClass,
            hp: baseHp,
            maxHp: baseHp,
            mana: baseMana,
            maxMana: baseMana,
            ko: false,
          };
        });

        const raid: Raid = {
          biomeId,
          bossId: boss.id,
          phase: "fighting",
          bossHp: bossMaxHp,
          bossMaxHp: bossMaxHp,
          bossMana: boss.mana,
          combatants,
          currentTurnIndex: 0,
          log: [],
          startedAt: Date.now(),
        };

        set({
          guild: {
            ...state.guild,
            activeRaid: raid,
            messages: [
              ...state.guild.messages,
              {
                id: `msg-${Date.now()}-raid`,
                authorName: "System",
                text: `⚔️ Raid started against ${boss.name}!`,
                timestamp: Date.now(),
              },
            ],
          },
        });
      },

      raidCastSpell: (spellId) => {
        set((state) => {
          if (!state.guild?.activeRaid) return state;
          const raid = state.guild.activeRaid;
          if (raid.phase !== "fighting") return state;

          const boss = RAID_BOSSES[raid.biomeId as BiomeId];
          if (!boss) return state;

          // Find player spell
          const spell = PLAYER_SPELLS_RAID.find((s) => s.id === spellId);
          if (!spell) return state;

          const combatant = raid.combatants[raid.currentTurnIndex];
          if (!combatant || combatant.ko) return state;
          if (spell.manaCost > combatant.mana) return state;

          let logId = raid.log.length;
          const newLog: RaidLogEntry[] = [...raid.log];
          const newCombatants = raid.combatants.map((c) => ({ ...c }));
          let newBossHp = raid.bossHp;
          let newBossMana = raid.bossMana;
          const current = newCombatants[raid.currentTurnIndex]!;

          // Player action
          current.mana -= spell.manaCost;

          if (spell.isHeal) {
            // Heal the most damaged ally
            const alive = newCombatants.filter((c) => !c.ko);
            const mostDamaged = alive.sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0];
            if (mostDamaged) {
              const heal = Math.max(1, Math.round(spell.damage * (0.9 + Math.random() * 0.2)));
              mostDamaged.hp = Math.min(mostDamaged.maxHp, mostDamaged.hp + heal);
              newLog.push({
                id: logId++,
                caster: current.name,
                target: mostDamaged.name,
                spellName: spell.name,
                element: spell.element,
                damage: heal,
                isHeal: true,
              });
            }
          } else {
            const dmg = calculateDamage(spell.damage);
            newBossHp = Math.max(0, newBossHp - dmg);
            newLog.push({
              id: logId++,
              caster: current.name,
              target: boss.name,
              spellName: spell.name,
              element: spell.element,
              damage: dmg,
              isHeal: false,
            });
          }

          // Check boss dead
          if (newBossHp <= 0) {
            return {
              guild: {
                ...state.guild,
                activeRaid: {
                  ...raid,
                  phase: "victory",
                  bossHp: 0,
                  combatants: newCombatants,
                  log: newLog,
                },
                raidWins: (state.guild.raidWins ?? 0) + 1,
                messages: [
                  ...state.guild.messages,
                  {
                    id: `msg-${Date.now()}-win`,
                    authorName: "System",
                    text: `🎉 ${boss.name} has been defeated! Raid victory!`,
                    timestamp: Date.now(),
                  },
                ],
              },
            };
          }

          // Advance to next alive combatant
          let nextIndex = (raid.currentTurnIndex + 1) % newCombatants.length;
          let safety = 0;
          while (newCombatants[nextIndex]?.ko && safety < newCombatants.length) {
            nextIndex = (nextIndex + 1) % newCombatants.length;
            safety++;
          }

          // Boss turn — happens after each full round (when we wrap back to 0 or completed a cycle)
          const isNewRound = nextIndex <= raid.currentTurnIndex;
          if (isNewRound) {
            // Boss picks an ability
            const ability = bossPickAbility(boss.abilities, newBossMana);
            newBossMana = Math.max(0, newBossMana - 10); // Boss spends mana

            if (ability.isAoe) {
              // Hit all alive combatants
              for (const c of newCombatants) {
                if (c.ko) continue;
                const dmg = calculateDamage(ability.damage);
                c.hp = Math.max(0, c.hp - dmg);
                if (c.hp <= 0) c.ko = true;
                newLog.push({
                  id: logId++,
                  caster: boss.name,
                  target: c.name,
                  spellName: ability.name,
                  element: ability.element,
                  damage: dmg,
                  isHeal: false,
                });
              }
            } else {
              // Hit a random alive target
              const alive = newCombatants.filter((c) => !c.ko);
              const target = alive[Math.floor(Math.random() * alive.length)];
              if (target) {
                const dmg = calculateDamage(ability.damage);
                target.hp = Math.max(0, target.hp - dmg);
                if (target.hp <= 0) target.ko = true;
                newLog.push({
                  id: logId++,
                  caster: boss.name,
                  target: target.name,
                  spellName: ability.name,
                  element: ability.element,
                  damage: dmg,
                  isHeal: false,
                });
              }
            }

            // Boss self-heal for Rootwarden
            if (boss.biome === "forest" && newBossHp > 0) {
              const heal = Math.round(boss.baseHp * 0.05);
              newBossHp = Math.min(raid.bossMaxHp, newBossHp + heal);
              newLog.push({
                id: logId++,
                caster: boss.name,
                target: boss.name,
                spellName: "Regrowth",
                element: "Heal",
                damage: heal,
                isHeal: true,
              });
            }

            // Boss drain for Skarveth
            if (boss.biome === "ruins" && newBossHp > 0) {
              const drain = Math.round(ability.damage * 0.3);
              newBossHp = Math.min(raid.bossMaxHp, newBossHp + drain);
            }

            // Mana regen for alive combatants
            for (const c of newCombatants) {
              if (!c.ko) {
                c.mana = Math.min(c.maxMana, c.mana + 3);
              }
            }
          }

          // Check if all combatants are KO
          const allKo = newCombatants.every((c) => c.ko);
          if (allKo) {
            return {
              guild: {
                ...state.guild,
                activeRaid: {
                  ...raid,
                  phase: "defeat",
                  bossHp: newBossHp,
                  bossMana: newBossMana,
                  combatants: newCombatants,
                  log: newLog,
                  currentTurnIndex: nextIndex,
                },
                messages: [
                  ...state.guild.messages,
                  {
                    id: `msg-${Date.now()}-lose`,
                    authorName: "System",
                    text: `💀 The guild was defeated by ${boss.name}...`,
                    timestamp: Date.now(),
                  },
                ],
              },
            };
          }

          // Re-find next alive combatant after boss turn
          while (newCombatants[nextIndex]?.ko) {
            nextIndex = (nextIndex + 1) % newCombatants.length;
          }

          return {
            guild: {
              ...state.guild,
              activeRaid: {
                ...raid,
                bossHp: newBossHp,
                bossMana: newBossMana,
                combatants: newCombatants,
                currentTurnIndex: nextIndex,
                log: newLog,
              },
            },
          };
        });
      },

      abandonRaid: () => {
        set((state) => {
          if (!state.guild) return state;
          return {
            guild: { ...state.guild, activeRaid: null },
          };
        });
      },
    }),
    {
      name: "reallife-mmo-guild",
      merge: (persisted, current) => {
        const p = persisted as Partial<GuildState> | undefined;
        if (!p) return current;
        const guild = p.guild
          ? {
              ...p.guild,
              activeRaid: p.guild.activeRaid ?? null,
              raidWins: p.guild.raidWins ?? 0,
            }
          : null;
        return {
          ...current,
          guild,
          browseGuilds: p.browseGuilds ?? BROWSE_GUILDS,
        };
      },
    },
  ),
);
