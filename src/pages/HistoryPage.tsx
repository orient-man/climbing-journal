import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useDb } from "@/db/provider";
import { listSessions, deleteSession } from "@/db/operations/sessions";
import { listLocations } from "@/db/operations/locations";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { formatDate } from "@/lib/date";
import { Calendar, Clock, Mountain, Trash2 } from "lucide-react";

function getDateFrom(range: string): string | undefined {
  if (range === "all") return undefined;
  const now = new Date();
  const months: Record<string, number> = {
    "1m": 1,
    "3m": 3,
    "6m": 6,
    "1y": 12,
  };
  const m = months[range];
  if (!m) return undefined;
  now.setMonth(now.getMonth() - m);
  return now.toISOString().split("T")[0];
}

export default function HistoryPage() {
  const { t, i18n } = useTranslation();
  const { db, persist } = useDb();
  const [dateRange, setDateRange] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [, setRefresh] = useState(0);

  const forceRefresh = useCallback(() => setRefresh((n) => n + 1), []);

  if (!db) return null;

  const locations = listLocations(db);

  const sessions = listSessions(db, {
    dateFrom: getDateFrom(dateRange),
    locationId: locationFilter !== "all" ? parseInt(locationFilter) : undefined,
    type: typeFilter !== "all" ? typeFilter : undefined,
  });

  const handleDelete = async () => {
    if (deleteTargetId === null) return;
    deleteSession(db, deleteTargetId);
    await persist();
    setDeleteTargetId(null);
    forceRefresh();
    toast({ title: t("common.delete") });
  };

  const getLocationName = (locId: number | null | undefined) => {
    if (!locId) return null;
    const loc = locations.find((l) => l.id === locId);
    return loc?.name ?? null;
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">{t("history.title")}</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder={t("history.filters.dateRange")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("history.filters.allTime")}</SelectItem>
            <SelectItem value="1m">{t("history.filters.lastMonth")}</SelectItem>
            <SelectItem value="3m">
              {t("history.filters.last3Months")}
            </SelectItem>
            <SelectItem value="6m">
              {t("history.filters.last6Months")}
            </SelectItem>
            <SelectItem value="1y">{t("history.filters.lastYear")}</SelectItem>
          </SelectContent>
        </Select>

        <Select value={locationFilter} onValueChange={setLocationFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t("history.filters.location")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              {t("history.filters.allLocations")}
            </SelectItem>
            {locations.map((loc) => (
              <SelectItem key={loc.id} value={String(loc.id)}>
                {loc.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder={t("history.filters.type")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("history.filters.allTypes")}</SelectItem>
            <SelectItem value="lead">{t("session.types.lead")}</SelectItem>
            <SelectItem value="boulder">
              {t("session.types.boulder")}
            </SelectItem>
            <SelectItem value="toprope">
              {t("session.types.toprope")}
            </SelectItem>
            <SelectItem value="mixed">{t("session.types.mixed")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Session list */}
      {sessions.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <Mountain className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{t("history.empty")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {sessions.map((session) => {
            const locName = getLocationName(session.location_id);
            return (
              <Card key={session.id} className="hover:bg-accent/50 transition-colors">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <Link
                      to={`/session/${session.id}`}
                      className="flex-1 space-y-1"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{formatDate(session.date, i18n.language)}</span>
                        <span className="text-sm px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          {t(`session.types.${session.type}`)}
                        </span>
                      </div>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        {locName && (
                          <span className="flex items-center gap-1">
                            <Mountain className="h-3 w-3" />
                            {locName}
                          </span>
                        )}
                        {session.duration_minutes && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {session.duration_minutes} {t("common.min")}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {session.climb_count}{" "}
                          {t("session.climbs").toLowerCase()}
                        </span>
                        {session.highest_grade_value && (
                          <span className="font-mono">
                            {t("session.maxGrade")}: {session.highest_grade_value}
                          </span>
                        )}
                      </div>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteTargetId(session.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Delete confirmation */}
      <Dialog
        open={deleteTargetId !== null}
        onOpenChange={(open) => !open && setDeleteTargetId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("common.delete")}</DialogTitle>
            <DialogDescription>{t("session.deleteConfirm")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTargetId(null)}>
              {t("common.cancel")}
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              {t("common.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
