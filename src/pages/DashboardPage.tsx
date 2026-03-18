import { useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { useDb } from "@/db/provider";
import { listSessions } from "@/db/operations/sessions";
import {
  shouldShowBackupReminder,
  isBackupReminderDismissed,
  dismissBackupReminder,
} from "@/db/export-import";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { formatDate } from "@/lib/date";
import {
  PlusCircle,
  Calendar,
  Mountain,
  TrendingUp,
} from "lucide-react";

export default function DashboardPage() {
  const { t, i18n } = useTranslation();
  const { db } = useDb();
  const navigate = useNavigate();

  useEffect(() => {
    if (shouldShowBackupReminder() && !isBackupReminderDismissed()) {
      dismissBackupReminder();
      toast({
        title: t("backup.reminderTitle"),
        description: t("backup.reminderMessage"),
        action: (
          <ToastAction
            altText={t("backup.exportNow")}
            onClick={() => navigate("/profile")}
          >
            {t("backup.exportNow")}
          </ToastAction>
        ),
      });
    }
  }, [t, navigate]);

  const stats = useMemo(() => {
    if (!db) return null;

    const sessions = listSessions(db);
    const totalSessions = sessions.length;
    const totalClimbs = sessions.reduce((sum, s) => sum + s.climb_count, 0);

    // Find the highest grade across all sessions
    let maxGrade: string | null = null;
    for (const s of sessions) {
      if (s.highest_grade_value) {
        // Simple approach: just show the first non-null highest grade found
        // A more sophisticated approach would compare across systems
        if (!maxGrade) maxGrade = s.highest_grade_value;
      }
    }

    const recent = sessions.slice(0, 5);

    return { totalSessions, totalClimbs, maxGrade, recent };
  }, [db]);

  if (!db || !stats) return null;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("dashboard.title")}</h1>
        <Button asChild>
          <Link to="/session/new">
            <PlusCircle className="h-4 w-4 mr-2" />
            {t("dashboard.logNew")}
          </Link>
        </Button>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <Calendar className="h-8 w-8 mx-auto mb-2 text-primary" />
            <div className="text-3xl font-bold">{stats.totalSessions}</div>
            <div className="text-sm text-muted-foreground">
              {t("dashboard.totalSessions")}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Mountain className="h-8 w-8 mx-auto mb-2 text-primary" />
            <div className="text-3xl font-bold">{stats.totalClimbs}</div>
            <div className="text-sm text-muted-foreground">
              {t("dashboard.totalClimbs")}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
            <div className="text-3xl font-bold font-mono">
              {stats.maxGrade ?? "—"}
            </div>
            <div className="text-sm text-muted-foreground">
              {t("dashboard.maxGrade")}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent sessions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t("dashboard.recentSessions")}</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/history">{t("nav.history")}</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {stats.recent.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              {t("history.empty")}
            </p>
          ) : (
            <div className="space-y-2">
              {stats.recent.map((session) => (
                <Link
                  key={session.id}
                  to={`/session/${session.id}`}
                  className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-accent transition-colors"
                >
                  <div>
                    <span className="font-medium">
                      {formatDate(session.date, i18n.language)}
                    </span>
                    <span className="ml-2 text-sm text-muted-foreground">
                      {t(`session.types.${session.type}`)}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {session.climb_count} {t("session.climbs").toLowerCase()}
                    {session.highest_grade_value && (
                      <span className="ml-2 font-mono">
                        {session.highest_grade_value}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
