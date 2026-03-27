import type { ReactNode } from "react";
import { useLocation } from "react-router";
import { Toaster } from "@/components/ui/sonner";
import { NavBar } from "./NavBar";
import { ChatPanel } from "./ChatPanel";
import { LevelUpOverlay } from "./LevelUpOverlay";

interface GameLayoutProps {
  children: ReactNode;
}

/** Pages where the NavBar is hidden (landing, onboarding). */
const NO_NAV_PATHS = ["/"];

export function GameLayout({ children }: GameLayoutProps) {
  const location = useLocation();
  const showNav = !NO_NAV_PATHS.includes(location.pathname);

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <main className={showNav ? "max-w-lg mx-auto px-4 pt-4 pb-28" : ""}>{children}</main>
      {showNav && <ChatPanel />}
      {showNav && <NavBar />}
      <Toaster position="top-center" />
      <LevelUpOverlay />
    </div>
  );
}
