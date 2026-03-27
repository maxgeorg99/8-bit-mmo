import { useState } from "react";
import { Button } from "@/components/ui/8bit/button";
import { Card, CardContent } from "@/components/ui/8bit/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/8bit/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/8bit/tabs";
import { Badge } from "@/components/ui/8bit/badge";
import { useReducer } from "spacetimedb/react";
import { reducers } from "@/generated";
import { useMyPlayer } from "@/hooks/useStdbPlayer";
import { BIOME_SHOPS, BIOME_MERCHANTS, SELL_PRICES } from "@/lib/shopItems";
import type { BiomeId } from "@/lib/biomeThemes";
import { RARITY_COLORS, RARITY_BORDER, SLOT_ICONS } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ShopDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  biomeId: BiomeId;
}

export function ShopDialog({ open, onOpenChange, biomeId }: ShopDialogProps) {
  const { player } = useMyPlayer();
  const buyItem = useReducer(reducers.buyItem);
  const sellItem = useReducer(reducers.sellItem);
  const [tab, setTab] = useState<string>("buy");

  if (!player) {
    return null;
  }

  const merchant = BIOME_MERCHANTS[biomeId];
  const shopItems = BIOME_SHOPS[biomeId];
  const ownedIds = new Set(player.chest.map((i) => i.id));
  const equippedIds = new Set(
    Object.values(player.equipment)
      .map((i) => i?.id)
      .filter(Boolean),
  );

  // Sellable items: in chest but not equipped
  const sellableItems = player.chest.filter((i) => !equippedIds.has(i.id));

  // Map local slot/rarity strings to SpacetimeDB enum tags (capitalize first letter)
  const toEnumTag = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-xs flex items-center gap-2">
            <span className="text-lg">{merchant.sprite}</span>
            {merchant.name}
          </DialogTitle>
          <DialogDescription className="retro text-[7px] italic">
            "{merchant.greeting}"
          </DialogDescription>
        </DialogHeader>

        {/* Gold display */}
        <div className="flex items-center justify-center gap-1 py-1">
          <span className="text-sm">💰</span>
          <span className="retro text-[10px] text-amber-400">{player.gold}g</span>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="w-full">
            <TabsTrigger value="buy" className="flex-1 text-[8px]">
              Buy
            </TabsTrigger>
            <TabsTrigger value="sell" className="flex-1 text-[8px]">
              Sell
            </TabsTrigger>
          </TabsList>

          <TabsContent value="buy" className="space-y-2 mt-2">
            {shopItems.map(({ item, cost }) => {
              const owned = ownedIds.has(item.id);
              const canAfford = player.gold >= cost;
              const meetsLevel = player.level >= item.levelReq;

              return (
                <Card key={item.id}>
                  <CardContent className="flex items-center gap-2 py-2 px-3">
                    <span className="text-sm shrink-0">{SLOT_ICONS[item.slot]}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={cn("retro text-[8px] truncate", RARITY_COLORS[item.rarity])}
                        >
                          {item.name}
                        </span>
                        <Badge variant="outline" className="text-[5px] shrink-0">
                          Lv.{item.levelReq}
                        </Badge>
                      </div>
                      <div className="retro text-[6px] text-muted-foreground">
                        {Object.entries(item.statBonus)
                          .map(([s, v]) => `+${v} ${s}`)
                          .join("  ")}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      {owned ? (
                        <span className="retro text-[7px] text-muted-foreground">Owned</span>
                      ) : (
                        <Button
                          size="sm"
                          className="text-[6px] px-2"
                          disabled={!canAfford || !meetsLevel}
                          onClick={() =>
                            void buyItem({
                              itemId: item.id,
                              itemName: item.name,
                              slot: { tag: toEnumTag(item.slot) } as any,
                              rarity: { tag: toEnumTag(item.rarity) } as any,
                              levelReq: item.levelReq,
                              bonusStr: item.statBonus.STR ?? 0,
                              bonusAgi: item.statBonus.AGI ?? 0,
                              bonusInt: item.statBonus.INT ?? 0,
                              bonusCon: item.statBonus.CON ?? 0,
                              bonusWis: item.statBonus.WIS ?? 0,
                              bonusCha: item.statBonus.CHA ?? 0,
                              bonusMp: item.statBonus.MP ?? 0,
                            })
                          }
                        >
                          {!meetsLevel ? `Lv.${item.levelReq}` : `${cost}g`}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="sell" className="space-y-2 mt-2">
            {sellableItems.length === 0 ? (
              <p className="retro text-[7px] text-muted-foreground text-center py-4">
                No items to sell. Equipped items must be unequipped first.
              </p>
            ) : (
              sellableItems.map((item) => {
                const price = SELL_PRICES[item.rarity];
                return (
                  <Card key={item.id}>
                    <CardContent className="flex items-center gap-2 py-2 px-3">
                      <span className="text-sm shrink-0">{SLOT_ICONS[item.slot]}</span>
                      <div className="flex-1 min-w-0">
                        <span
                          className={cn("retro text-[8px] truncate", RARITY_COLORS[item.rarity])}
                        >
                          {item.name}
                        </span>
                        <div className="retro text-[6px] text-muted-foreground">
                          {Object.entries(item.statBonus)
                            .map(([s, v]) => `+${v} ${s}`)
                            .join("  ")}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className={cn("text-[6px] px-2 shrink-0", RARITY_BORDER[item.rarity])}
                        onClick={() => void sellItem({ itemId: item.id })}
                      >
                        Sell {price}g
                      </Button>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
