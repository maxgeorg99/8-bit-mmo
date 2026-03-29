import { useState } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/8bit/button";
import { Card, CardContent } from "@/components/ui/8bit/card";
import { Badge } from "@/components/ui/8bit/badge";
import { Input } from "@/components/ui/8bit/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/8bit/tabs";
import { Progress } from "@/components/ui/8bit/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/8bit/dialog";
import { useFriends, type FriendDisplay } from "@/hooks/useFriends";
import { useMyPlayer } from "@/hooks/useStdbPlayer";
import { CLASS_SPRITES, CLASS_COLORS, STAT_COLORS, type StatName } from "@/lib/types";
import { BIOME_META } from "@/lib/biomeThemes";
import { asset, cn } from "@/lib/utils";

const STATS_ORDER: StatName[] = ["STR", "AGI", "INT", "CON", "WIS", "CHA", "MP"];

export function FriendsPage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState("friends");
  const {
    friends,
    incomingRequests,
    outgoingRequests,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
  } = useFriends();

  const [addName, setAddName] = useState("");
  const [compareTarget, setCompareTarget] = useState<FriendDisplay | null>(null);

  const handleAdd = () => {
    const name = addName.trim();
    if (name.length < 1) return;
    void sendFriendRequest(name);
    setAddName("");
  };

  return (
    <div className="space-y-4">
      <h1 className="retro text-sm text-center text-foreground">{t("friends.title")}</h1>

      {/* Add friend bar */}
      <Card>
        <CardContent className="py-3">
          <div className="flex gap-2">
            <Input
              value={addName}
              onChange={(e) => setAddName(e.target.value)}
              placeholder={t("friends.playerNamePlaceholder")}
              className="text-[8px] flex-1"
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
            <Button
              size="sm"
              className="text-[7px] shrink-0"
              disabled={addName.trim().length < 1}
              onClick={handleAdd}
            >
              {t("friends.addFriend")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full">
          <TabsTrigger value="friends" className="flex-1 text-[7px]">
            {t("friends.friendsTab", { count: friends.length })}
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex-1 text-[7px]">
            {t("friends.requestsTab")}{" "}
            {incomingRequests.length > 0 && (
              <Badge variant="outline" className="ml-1 text-[5px] text-amber-400">
                {incomingRequests.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="friends" className="mt-2 space-y-2">
          {friends.length === 0 ? (
            <Card>
              <CardContent className="py-6 text-center">
                <span className="text-2xl block mb-2">👥</span>
                <p className="retro text-[8px] text-muted-foreground">
                  {t("friends.noFriendsYet")}
                </p>
              </CardContent>
            </Card>
          ) : (
            friends.map((f) => (
              <FriendCard
                key={String(f.friendshipId)}
                friend={f}
                onRemove={() => void removeFriend(f.friendshipId)}
                onCompare={() => setCompareTarget(f)}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="requests" className="mt-2 space-y-3">
          {/* Incoming */}
          {incomingRequests.length > 0 && (
            <div className="space-y-2">
              <h2 className="retro text-[9px] text-foreground">{t("friends.incomingRequests")}</h2>
              {incomingRequests.map((r) => (
                <Card key={String(r.friendshipId)}>
                  <CardContent className="py-2">
                    <div className="flex items-center gap-2">
                      <img
                        src={asset(CLASS_SPRITES[r.playerClass])}
                        alt={r.playerClass}
                        className="pixelated w-6 h-6"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="retro text-[8px] text-foreground">{r.name}</span>
                        <div className="flex items-center gap-1">
                          <span className={cn("retro text-[6px]", CLASS_COLORS[r.playerClass])}>
                            Lv.{r.level} {r.playerClass}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button
                          size="sm"
                          className="text-[6px] px-2"
                          onClick={() => void acceptFriendRequest(r.friendshipId)}
                        >
                          {t("common.accept")}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-[6px] px-2 text-red-400"
                          onClick={() => void rejectFriendRequest(r.friendshipId)}
                        >
                          {t("common.decline")}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Outgoing */}
          {outgoingRequests.length > 0 && (
            <div className="space-y-2">
              <h2 className="retro text-[9px] text-foreground">{t("friends.sentRequests")}</h2>
              {outgoingRequests.map((r) => (
                <Card key={String(r.friendshipId)}>
                  <CardContent className="py-2">
                    <div className="flex items-center gap-2">
                      <img
                        src={asset(CLASS_SPRITES[r.playerClass])}
                        alt={r.playerClass}
                        className="pixelated w-6 h-6"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="retro text-[8px] text-foreground">{r.name}</span>
                        <span className="retro text-[6px] text-muted-foreground block">
                          {t("friends.pending")}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-[6px] px-2 text-red-400 shrink-0"
                        onClick={() => void removeFriend(r.friendshipId)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {incomingRequests.length === 0 && outgoingRequests.length === 0 && (
            <Card>
              <CardContent className="py-6 text-center">
                <p className="retro text-[8px] text-muted-foreground">
                  {t("friends.noPendingRequests")}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Stat comparison dialog */}
      <StatCompareDialog
        open={compareTarget !== null}
        onOpenChange={(open) => !open && setCompareTarget(null)}
        friend={compareTarget}
      />
    </div>
  );
}

// ── Friend Card ─────────────────────────────────────────────────

function FriendCard({
  friend,
  onRemove,
  onCompare,
}: {
  friend: FriendDisplay;
  onRemove: () => void;
  onCompare: () => void;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const biomeMeta = BIOME_META[friend.currentBiome as keyof typeof BIOME_META];

  return (
    <Card>
      <CardContent className="py-2">
        <div className="flex items-center gap-2">
          <div className="relative">
            <img
              src={asset(CLASS_SPRITES[friend.playerClass])}
              alt={friend.playerClass}
              className="pixelated w-8 h-8"
            />
            <span
              className={cn(
                "absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-background",
                friend.online ? "bg-green-500" : "bg-muted-foreground/50",
              )}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="retro text-[8px] text-foreground truncate">{friend.name}</span>
              {friend.online && (
                <Badge variant="outline" className="text-[4px] text-green-400 py-0">
                  Online
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className={cn("retro text-[6px]", CLASS_COLORS[friend.playerClass])}>
                Lv.{friend.level} {friend.playerClass}
              </span>
              {biomeMeta && (
                <span className="retro text-[5px] text-muted-foreground">
                  {biomeMeta.icon} {biomeMeta.name}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-1.5 mt-2">
          <Button size="sm" variant="outline" className="text-[6px] flex-1" onClick={onCompare}>
            {t("friends.compareStats")}
          </Button>
          {friend.online && (
            <Button
              size="sm"
              variant="outline"
              className="text-[6px] flex-1 text-red-400"
              onClick={() => void navigate("/combat")}
            >
              {t("friends.pvpChallenge")}
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            className="text-[6px] text-muted-foreground px-2 shrink-0"
            onClick={onRemove}
          >
            {t("common.remove")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Stat Compare Dialog ─────────────────────────────────────────

function StatCompareDialog({
  open,
  onOpenChange,
  friend,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  friend: FriendDisplay | null;
}) {
  const { t } = useTranslation();
  const { player } = useMyPlayer();

  if (!friend || !player) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-xs">{t("friends.statComparison")}</DialogTitle>
          <DialogDescription className="retro text-[7px]">
            {t("friends.vsLabel", { name1: player.name, name2: friend.name })}
          </DialogDescription>
        </DialogHeader>

        {/* Side by side headers */}
        <div className="flex items-center justify-between px-2">
          <div className="text-center">
            <img
              src={asset(CLASS_SPRITES[player.playerClass])}
              alt={player.playerClass}
              className="pixelated w-8 h-8 mx-auto"
            />
            <span className="retro text-[7px] text-primary block">{player.name}</span>
            <span className={cn("retro text-[5px]", CLASS_COLORS[player.playerClass])}>
              Lv.{player.level}
            </span>
          </div>
          <span className="retro text-[10px] text-muted-foreground">VS</span>
          <div className="text-center">
            <img
              src={asset(CLASS_SPRITES[friend.playerClass])}
              alt={friend.playerClass}
              className="pixelated w-8 h-8 mx-auto"
            />
            <span className="retro text-[7px] text-foreground block">{friend.name}</span>
            <span className={cn("retro text-[5px]", CLASS_COLORS[friend.playerClass])}>
              Lv.{friend.level}
            </span>
          </div>
        </div>

        {/* Stat bars comparison */}
        <Card>
          <CardContent className="py-2 space-y-2">
            {STATS_ORDER.map((stat) => {
              const myVal = player.stats[stat];
              const theirVal = friend.stats[stat];
              const maxVal = Math.max(myVal, theirVal, 1);
              const myPct = Math.round((myVal / maxVal) * 100);
              const theirPct = Math.round((theirVal / maxVal) * 100);
              const diff = myVal - theirVal;

              return (
                <div key={stat} className="space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="retro text-[7px] text-muted-foreground w-6">{stat}</span>
                    <span
                      className={cn(
                        "retro text-[6px]",
                        diff > 0
                          ? "text-green-400"
                          : diff < 0
                            ? "text-red-400"
                            : "text-muted-foreground",
                      )}
                    >
                      {diff > 0 ? "+" : ""}
                      {diff !== 0 ? Math.round(diff) : "="}
                    </span>
                  </div>
                  <div className="flex gap-1 items-center">
                    <span className="retro text-[5px] w-5 text-right text-primary">
                      {Math.round(myVal)}
                    </span>
                    <Progress
                      value={myPct}
                      variant="retro"
                      progressBg={STAT_COLORS[stat]}
                      className="h-1 flex-1"
                    />
                  </div>
                  <div className="flex gap-1 items-center">
                    <span className="retro text-[5px] w-5 text-right text-foreground/70">
                      {Math.round(theirVal)}
                    </span>
                    <Progress
                      value={theirPct}
                      variant="retro"
                      progressBg="bg-muted-foreground/50"
                      className="h-1 flex-1"
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Total power comparison */}
        <div className="flex items-center justify-between px-2">
          <div className="text-center">
            <span className="retro text-[6px] text-muted-foreground">
              {t("friends.totalPower")}
            </span>
            <span className="retro text-[10px] text-primary block">
              {Math.round(STATS_ORDER.reduce((sum, s) => sum + player.stats[s], 0))}
            </span>
          </div>
          <div className="text-center">
            <span className="retro text-[6px] text-muted-foreground">
              {t("friends.totalPower")}
            </span>
            <span className="retro text-[10px] text-foreground block">
              {Math.round(STATS_ORDER.reduce((sum, s) => sum + friend.stats[s], 0))}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
