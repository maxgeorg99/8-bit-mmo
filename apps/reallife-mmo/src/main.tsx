import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import { SpacetimeDBProvider } from "spacetimedb/react";
import "./index.css";
import { ActiveThemeProvider } from "./components/active-theme";
import { BiomeProvider } from "./providers/BiomeProvider";
import { useConnectionBuilder } from "./hooks/useSpacetimeDB";
import { GameLayout } from "./components/game/GameLayout";
import { Home } from "./pages/home";
import { Dashboard } from "./pages/dashboard";
import { Character } from "./pages/character";
import { Activity } from "./pages/activity";
import { Quests } from "./pages/quests";
import { WorldMap } from "./pages/world-map";
import { Combat } from "./pages/combat";
import { LocationPage } from "./pages/location";
import { PveCombat } from "./pages/pve-combat";
import { GuildPage } from "./pages/guild";
import { RaidPage } from "./pages/raid";
import { Leaderboard } from "./pages/leaderboard";
import { FriendsPage } from "./pages/friends";
import { NotFound } from "./pages/not-found";

function App() {
  const connectionBuilder = useConnectionBuilder();

  return (
    <SpacetimeDBProvider connectionBuilder={connectionBuilder}>
      <BrowserRouter basename="/8-bit-mmo">
        <ActiveThemeProvider>
          <BiomeProvider>
            <GameLayout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/character" element={<Character />} />
                <Route path="/activity" element={<Activity />} />
                <Route path="/quests" element={<Quests />} />
                <Route path="/map" element={<WorldMap />} />
                <Route path="/location/:locationId" element={<LocationPage />} />
                <Route path="/pve/:biomeId" element={<PveCombat />} />
                <Route path="/guild" element={<GuildPage />} />
                <Route path="/raid/:biomeId" element={<RaidPage />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/friends" element={<FriendsPage />} />
                <Route path="/combat" element={<Combat />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </GameLayout>
          </BiomeProvider>
        </ActiveThemeProvider>
      </BrowserRouter>
    </SpacetimeDBProvider>
  );
}

createRoot(document.getElementById("app")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
