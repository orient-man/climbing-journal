import { useTranslation } from "react-i18next";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDb } from "@/db/provider";
import { getSession } from "@/db/operations/sessions";
import { getLocation } from "@/db/operations/locations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, ArrowLeft } from "lucide-react";

export default function SessionDetailPage() {
  const { t } = useTranslation();
  const { db } = useDb();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  if (!db || !id) return null;

  const session = getSession(db, parseInt(id));
  if (!session) {
    navigate("/history");
    return null;
  }

  const location = session.location_id
    ? getLocation(db, session.location_id)
    : null;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/history">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">{t("session.title")}</h1>
        </div>
        <Button variant="outline" asChild>
          <Link to={`/session/${id}/edit`}>
            <Pencil className="h-4 w-4 mr-2" />
            {t("common.edit")}
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{session.date}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">{t("session.type")}: </span>
              <span className="font-medium">
                {t(`session.types.${session.type}`)}
              </span>
            </div>
            {location && (
              <div>
                <span className="text-muted-foreground">
                  {t("session.location")}:{" "}
                </span>
                <span className="font-medium">{location.name}</span>
              </div>
            )}
            {session.duration_minutes && (
              <div>
                <span className="text-muted-foreground">
                  {t("session.duration")}:{" "}
                </span>
                <span className="font-medium">{session.duration_minutes}</span>
              </div>
            )}
            {session.energy && (
              <div>
                <span className="text-muted-foreground">
                  {t("session.energy")}:{" "}
                </span>
                <span className="font-medium">{session.energy}/5</span>
              </div>
            )}
            {session.satisfaction && (
              <div>
                <span className="text-muted-foreground">
                  {t("session.satisfaction")}:{" "}
                </span>
                <span className="font-medium">{session.satisfaction}/5</span>
              </div>
            )}
          </div>
          {session.notes && (
            <div className="pt-2 border-t text-sm">
              <span className="text-muted-foreground">{t("session.notes")}: </span>
              <p className="mt-1">{session.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {t("session.climbs")} ({session.climbs.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {session.climbs.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              {t("session.noClimbs")}
            </p>
          ) : (
            <div className="space-y-3">
              {session.climbs.map((climb, i) => (
                <div key={climb.id ?? i} className="border rounded-lg p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">
                      {climb.route_name || `#${i + 1}`}
                    </div>
                    <div className="text-sm font-mono">
                      {climb.grade_value && (
                        <span>
                          {climb.grade_value}
                          {climb.grade_system && (
                            <span className="text-muted-foreground ml-1">
                              ({t(`grade.systems.${climb.grade_system}`)})
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-3 text-sm text-muted-foreground">
                    <span>{t(`climb.styles.${climb.style}`)}</span>
                    <span>{t(`climb.completionTypes.${climb.completion_type}`)}</span>
                    {climb.attempts && climb.attempts > 1 && (
                      <span>
                        {climb.attempts} {t("climb.attempts").toLowerCase()}
                      </span>
                    )}
                    {climb.perceived_difficulty && (
                      <span>
                        {t("climb.perceivedDifficulty").split(" (")[0]}: {climb.perceived_difficulty}/5
                      </span>
                    )}
                  </div>
                  {climb.notes && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {climb.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
