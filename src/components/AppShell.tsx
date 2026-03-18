import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDb } from "@/db/provider";
import { getProfile } from "@/db/operations/profile";
import AppLayout from "@/components/layout/AppLayout";
import ProfileSetup from "@/components/ProfileSetup";
import DashboardPage from "@/pages/DashboardPage";
import SessionFormPage from "@/pages/SessionFormPage";
import SessionDetailPage from "@/pages/SessionDetailPage";
import HistoryPage from "@/pages/HistoryPage";
import PyramidPage from "@/pages/PyramidPage";
import LocationsPage from "@/pages/LocationsPage";
import ProfilePage from "@/pages/ProfilePage";
import { Loader2 } from "lucide-react";

export default function AppShell() {
  const { db, isLoading, error } = useDb();
  const { t, i18n } = useTranslation();
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);

  useEffect(() => {
    if (!db) return;
    const profile = getProfile(db);
    setHasProfile(!!profile);
    if (profile?.locale) {
      i18n.changeLanguage(profile.locale);
    }
  }, [db, i18n]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">{t("common.loading")}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-destructive">{t("common.error")}: {error}</div>
      </div>
    );
  }

  if (hasProfile === null || hasProfile === false) {
    return (
      <ProfileSetup
        onComplete={() => setHasProfile(true)}
      />
    );
  }

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/session/new" element={<SessionFormPage />} />
        <Route path="/session/:id" element={<SessionDetailPage />} />
        <Route path="/session/:id/edit" element={<SessionFormPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/pyramid" element={<PyramidPage />} />
        <Route path="/locations" element={<LocationsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
    </Routes>
  );
}
