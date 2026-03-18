import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import GradeSelector from "@/components/GradeSelector";
import HelpPopover from "@/components/HelpPopover";
import type { GradeSystem } from "@/grades/tables";
import { Trash2, GripVertical } from "lucide-react";

export interface ClimbFormData {
  route_name: string;
  grade_system: string;
  grade_value: string;
  style: string;
  completion_type: string;
  attempts: string;
  perceived_difficulty: string;
  notes: string;
}

export const EMPTY_CLIMB: ClimbFormData = {
  route_name: "",
  grade_system: "",
  grade_value: "",
  style: "lead",
  completion_type: "redpoint",
  attempts: "1",
  perceived_difficulty: "",
  notes: "",
};

interface ClimbEntryFormProps {
  index: number;
  data: ClimbFormData;
  onChange: (data: ClimbFormData) => void;
  onRemove: () => void;
}

export default function ClimbEntryForm({
  index,
  data,
  onChange,
  onRemove,
}: ClimbEntryFormProps) {
  const { t } = useTranslation();

  const set =
    (field: keyof ClimbFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange({ ...data, [field]: e.target.value });

  const gradeStyle =
    data.style === "boulder" ? "boulder" : ("lead" as "lead" | "boulder");

  return (
    <div className="border rounded-lg p-4 space-y-4 relative">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <GripVertical className="h-4 w-4" />
          {t("session.climbs")} #{index + 1}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="h-8 w-8"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t("climb.routeName")}</Label>
          <Input
            value={data.route_name}
            onChange={set("route_name")}
            placeholder={t("climb.routeName")}
          />
        </div>
        <div className="space-y-2">
          <Label className="flex items-center gap-1">
            {t("climb.style")}
            <HelpPopover
              items={[
                { term: t("climb.styles.lead"), description: t("help.styles.lead") },
                { term: t("climb.styles.boulder"), description: t("help.styles.boulder") },
                { term: t("climb.styles.toprope"), description: t("help.styles.toprope") },
              ]}
            />
          </Label>
          <Select
            value={data.style}
            onValueChange={(v) =>
              onChange({ ...data, style: v, grade_system: "", grade_value: "" })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lead">{t("climb.styles.lead")}</SelectItem>
              <SelectItem value="boulder">
                {t("climb.styles.boulder")}
              </SelectItem>
              <SelectItem value="toprope">
                {t("climb.styles.toprope")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-1">
          {t("climb.grade")}
          <HelpPopover
            items={[
              { term: t("grade.systems.french"), description: t("help.gradeSystems.french") },
              { term: t("grade.systems.yds"), description: t("help.gradeSystems.yds") },
              { term: t("grade.systems.vscale"), description: t("help.gradeSystems.vscale") },
              { term: t("grade.systems.font"), description: t("help.gradeSystems.font") },
            ]}
          />
        </Label>
        <GradeSelector
          style={gradeStyle}
          system={data.grade_system as GradeSystem | ""}
          value={data.grade_value}
          onSystemChange={(s) => onChange({ ...data, grade_system: s, grade_value: "" })}
          onValueChange={(v) => onChange({ ...data, grade_value: v })}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-1">
            {t("climb.completionType")}
            <HelpPopover
              items={[
                { term: t("climb.completionTypes.onsight"), description: t("help.completionTypes.onsight") },
                { term: t("climb.completionTypes.flash"), description: t("help.completionTypes.flash") },
                { term: t("climb.completionTypes.redpoint"), description: t("help.completionTypes.redpoint") },
                { term: t("climb.completionTypes.repeat"), description: t("help.completionTypes.repeat") },
                { term: t("climb.completionTypes.attempt"), description: t("help.completionTypes.attempt") },
              ]}
            />
          </Label>
          <Select
            value={data.completion_type}
            onValueChange={(v) => onChange({ ...data, completion_type: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="onsight">
                {t("climb.completionTypes.onsight")}
              </SelectItem>
              <SelectItem value="flash">
                {t("climb.completionTypes.flash")}
              </SelectItem>
              <SelectItem value="redpoint">
                {t("climb.completionTypes.redpoint")}
              </SelectItem>
              <SelectItem value="repeat">
                {t("climb.completionTypes.repeat")}
              </SelectItem>
              <SelectItem value="attempt">
                {t("climb.completionTypes.attempt")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>{t("climb.attempts")}</Label>
          <Input
            type="number"
            min="1"
            value={data.attempts}
            onChange={set("attempts")}
          />
        </div>
        <div className="space-y-2">
          <Label>{t("climb.perceivedDifficulty")}</Label>
          <Input
            type="number"
            min="1"
            max="5"
            value={data.perceived_difficulty}
            onChange={set("perceived_difficulty")}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>{t("climb.notes")}</Label>
        <Textarea
          value={data.notes}
          onChange={set("notes")}
          placeholder={t("climb.notes")}
          rows={2}
        />
      </div>
    </div>
  );
}
