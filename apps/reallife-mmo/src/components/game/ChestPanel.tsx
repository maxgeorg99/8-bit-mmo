import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/8bit/card";
import { Button } from "@/components/ui/8bit/button";
import type { EquipSlot, EquipmentItem } from "@/lib/types";
import { RARITY_BORDER, RARITY_COLORS, SLOT_ICONS } from "@/lib/types";
import { cn, asset } from "@/lib/utils";
import { getEquipmentName, formatStatBonuses } from "@/lib/i18nEquipment";

interface ChestPanelProps {
  items: EquipmentItem[];
  equipped: Partial<Record<EquipSlot, EquipmentItem>>;
  playerLevel: number;
  onEquip: (itemId: string) => void;
  onUnequip: (slot: EquipSlot) => void;
}

export function ChestPanel({ items, equipped, playerLevel, onEquip, onUnequip }: ChestPanelProps) {
  const { t } = useTranslation();
  const equippedIds = new Set(
    Object.values(equipped)
      .map((i) => i?.id)
      .filter(Boolean),
  );

  if (items.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs flex items-center gap-2">
            <img src={asset("8bit-treasure.png")} alt="Chest" className="pixelated w-6 h-6" />
            {t("character.chest")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="retro text-[7px] text-muted-foreground text-center py-4">
            {t("character.chestEmpty")}
          </p>
        </CardContent>
      </Card>
    );
  }

  // Sort: equipped first, then by rarity (legendary > common), then by name
  const rarityOrder = { legendary: 0, epic: 1, rare: 2, uncommon: 3, common: 4 };
  const sorted = [...items].sort((a, b) => {
    const aEquipped = equippedIds.has(a.id) ? 0 : 1;
    const bEquipped = equippedIds.has(b.id) ? 0 : 1;
    if (aEquipped !== bEquipped) return aEquipped - bEquipped;
    return rarityOrder[a.rarity] - rarityOrder[b.rarity];
  });

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs flex items-center gap-2">
          <img src={asset("8bit-treasure.png")} alt="Chest" className="pixelated w-6 h-6" />
          {t("character.chestCount", { count: items.length })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {sorted.map((item) => {
          const isEquipped = equippedIds.has(item.id);
          const canEquip = playerLevel >= item.levelReq;

          return (
            <div
              key={item.id}
              className={cn(
                "flex items-center justify-between p-2 border-2",
                isEquipped ? "border-primary/50 bg-primary/5" : RARITY_BORDER[item.rarity],
              )}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm shrink-0">{SLOT_ICONS[item.slot]}</span>
                <div className="min-w-0">
                  <div className={cn("retro text-[8px] truncate", RARITY_COLORS[item.rarity])}>
                    {getEquipmentName(t, item.id, item.name)}
                  </div>
                  <div className="retro text-[6px] text-muted-foreground">
                    {formatStatBonuses(t, item.statBonus)}
                  </div>
                  <div className="retro text-[5px] text-muted-foreground/60">{item.source}</div>
                </div>
              </div>
              <div className="shrink-0 ml-2">
                {isEquipped ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-[6px] px-2"
                    onClick={() => onUnequip(item.slot)}
                  >
                    {t("common.unequip")}
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="text-[6px] px-2"
                    disabled={!canEquip}
                    onClick={() => onEquip(item.id)}
                  >
                    {canEquip ? t("common.equip") : t("common.levelAbbr", { level: item.levelReq })}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
