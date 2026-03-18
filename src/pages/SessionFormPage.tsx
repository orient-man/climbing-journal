import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { useDb } from "@/db/provider";
import {
  createSession,
  getSession,
  updateSession,
  type ClimbInput,
} from "@/db/operations/sessions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import LocationSelector from "@/components/LocationSelector";
import ClimbEntryForm, {
  type ClimbFormData,
  EMPTY_CLIMB,
} from "@/components/ClimbEntryForm";
import { Plus } from "lucide-react";

export default function SessionFormPage() {
  const { t } = useTranslation();
  const { db, persist } = useDb();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [locationId, setLocationId] = useState("");
  const [type, setType] = useState("lead");
  const [duration, setDuration] = useState("");
  const [energy, setEnergy] = useState("");
  const [satisfaction, setSatisfaction] = useState("");
  const [notes, setNotes] = useState("");
  const [climbs, setClimbs] = useState<ClimbFormData[]>([]);
  const [loaded, setLoaded] = useState(!isEdit);

  useEffect(() => {
    if (!isEdit || !db) return;
    const session = getSession(db, parseInt(id));
    if (!session) {
      navigate("/history");
      return;
    }
    setDate(session.date);
    setLocationId(session.location_id ? String(session.location_id) : "");
    setType(session.type);
    setDuration(session.duration_minutes ? String(session.duration_minutes) : "");
    setEnergy(session.energy ? String(session.energy) : "");
    setSatisfaction(session.satisfaction ? String(session.satisfaction) : "");
    setNotes(session.notes ?? "");
    setClimbs(
      session.climbs.map((c) => ({
        route_name: c.route_name ?? "",
        grade_system: c.grade_system ?? "",
        grade_value: c.grade_value ?? "",
        style: c.style,
        completion_type: c.completion_type,
        attempts: String(c.attempts ?? 1),
        perceived_difficulty: c.perceived_difficulty
          ? String(c.perceived_difficulty)
          : "",
        notes: c.notes ?? "",
      }))
    );
    setLoaded(true);
  }, [isEdit, id, db, navigate]);

  if (!db || !loaded) return null;

  const addClimb = () => {
    setClimbs((prev) => [...prev, { ...EMPTY_CLIMB, style: type === "boulder" ? "boulder" : "lead" }]);
  };

  const updateClimb = (index: number, data: ClimbFormData) => {
    setClimbs((prev) => prev.map((c, i) => (i === index ? data : c)));
  };

  const removeClimb = (index: number) => {
    setClimbs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const sessionData = {
      date,
      location_id: locationId ? parseInt(locationId) : null,
      type,
      duration_minutes: duration ? parseInt(duration) : null,
      energy: energy ? parseInt(energy) : null,
      satisfaction: satisfaction ? parseInt(satisfaction) : null,
      notes: notes || null,
    };

    const climbInputs: ClimbInput[] = climbs.map((c, i) => ({
      route_name: c.route_name || undefined,
      grade_system: c.grade_system || undefined,
      grade_value: c.grade_value || undefined,
      style: c.style,
      completion_type: c.completion_type,
      attempts: c.attempts ? parseInt(c.attempts) : 1,
      perceived_difficulty: c.perceived_difficulty
        ? parseInt(c.perceived_difficulty)
        : undefined,
      notes: c.notes || undefined,
      sort_order: i,
    }));

    if (isEdit) {
      updateSession(db, parseInt(id), sessionData, climbInputs);
      await persist();
      toast({ title: t("common.save") });
      navigate(`/session/${id}`);
    } else {
      const newId = createSession(db, sessionData, climbInputs);
      await persist();
      toast({ title: t("common.save") });
      navigate(`/session/${newId}`);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">
        {isEdit ? t("common.edit") : t("nav.logSession")}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("session.title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("session.date")}</Label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>{t("session.type")}</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lead">
                      {t("session.types.lead")}
                    </SelectItem>
                    <SelectItem value="boulder">
                      {t("session.types.boulder")}
                    </SelectItem>
                    <SelectItem value="toprope">
                      {t("session.types.toprope")}
                    </SelectItem>
                    <SelectItem value="mixed">
                      {t("session.types.mixed")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t("session.location")}</Label>
              <LocationSelector value={locationId} onChange={setLocationId} />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>{t("session.duration")}</Label>
                <Input
                  type="number"
                  min="0"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="120"
                />
              </div>
              <div className="space-y-2">
                <Label>{t("session.energy")}</Label>
                <Input
                  type="number"
                  min="1"
                  max="5"
                  value={energy}
                  onChange={(e) => setEnergy(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("session.satisfaction")}</Label>
                <Input
                  type="number"
                  min="1"
                  max="5"
                  value={satisfaction}
                  onChange={(e) => setSatisfaction(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t("session.notes")}</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t("session.notes")}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{t("session.climbs")}</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addClimb}>
                <Plus className="h-4 w-4 mr-2" />
                {t("session.addClimb")}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {climbs.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                {t("session.noClimbs")}
              </p>
            ) : (
              climbs.map((climb, i) => (
                <ClimbEntryForm
                  key={i}
                  index={i}
                  data={climb}
                  onChange={(data) => updateClimb(i, data)}
                  onRemove={() => removeClimb(i)}
                />
              ))
            )}
          </CardContent>
        </Card>

        <Button type="submit" className="w-full" size="lg">
          {t("common.save")}
        </Button>
      </form>
    </div>
  );
}
