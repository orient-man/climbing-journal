import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Home,
  PlusCircle,
  History,
  BarChart3,
  MapPin,
  User,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useDb } from "@/db/provider";
import { updateProfile, getProfile } from "@/db/operations/profile";

const navItems = [
  { to: "/", icon: Home, labelKey: "nav.dashboard" },
  { to: "/session/new", icon: PlusCircle, labelKey: "nav.logSession" },
  { to: "/history", icon: History, labelKey: "nav.history" },
  { to: "/pyramid", icon: BarChart3, labelKey: "nav.pyramid" },
  { to: "/locations", icon: MapPin, labelKey: "nav.locations" },
  { to: "/profile", icon: User, labelKey: "nav.profile" },
];

export default function AppNav() {
  const { t, i18n } = useTranslation();
  const { db, persist } = useDb();

  const toggleLanguage = async () => {
    const newLang = i18n.language === "pl" ? "en" : "pl";
    i18n.changeLanguage(newLang);
    if (db) {
      const profile = getProfile(db);
      if (profile) {
        updateProfile(db, { locale: newLang });
        await persist();
      }
    }
  };

  return (
    <nav className="border-b bg-background">
      <div className="mx-auto max-w-5xl px-4">
        <div className="flex h-14 items-center gap-1 overflow-x-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )
              }
            >
              <item.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{t(item.labelKey)}</span>
            </NavLink>
          ))}
          <div className="ml-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              className="flex items-center gap-1"
            >
              <Globe className="h-4 w-4" />
              <span className="text-xs font-medium uppercase">
                {i18n.language === "pl" ? "EN" : "PL"}
              </span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
