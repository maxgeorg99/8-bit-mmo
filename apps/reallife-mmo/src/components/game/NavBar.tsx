import { useLocation, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

export function NavBar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const NAV_ITEMS = [
    { path: "/character", label: t("nav.hero"), icon: "⚔️" },
    { path: "/activity", label: t("nav.log"), icon: "📝" },
    { path: "/quests", label: t("nav.quests"), icon: "📜" },
    { path: "/map", label: t("nav.map"), icon: "🗺️" },
    { path: "/guild", label: t("nav.guild"), icon: "🏰" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t-4 border-foreground dark:border-ring">
      <div className="flex justify-around items-center max-w-lg mx-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              type="button"
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center py-2 px-3 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="retro text-[6px] mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
