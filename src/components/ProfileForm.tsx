import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import GradeSelector from "@/components/GradeSelector";
import type { GradeSystem } from "@/grades/tables";

export interface ProfileFormData {
  display_name: string;
  birth_year: string;
  climbing_since: string;
  current_lead_grade_system: string;
  current_lead_grade_value: string;
  current_boulder_grade_system: string;
  current_boulder_grade_value: string;
  goal_grade_system: string;
  goal_grade_value: string;
  other_activities: string;
  known_injuries: string;
  locale: string;
}

interface ProfileFormProps {
  initial?: Partial<ProfileFormData>;
  onSubmit: (data: ProfileFormData) => void;
  submitLabel?: string;
}

const EMPTY: ProfileFormData = {
  display_name: "",
  birth_year: "",
  climbing_since: "",
  current_lead_grade_system: "",
  current_lead_grade_value: "",
  current_boulder_grade_system: "",
  current_boulder_grade_value: "",
  goal_grade_system: "",
  goal_grade_value: "",
  other_activities: "",
  known_injuries: "",
  locale: "pl",
};

export default function ProfileForm({
  initial,
  onSubmit,
  submitLabel,
}: ProfileFormProps) {
  const { t } = useTranslation();
  const [form, setForm] = useState<ProfileFormData>({ ...EMPTY, ...initial });

  const set = (field: keyof ProfileFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="display_name">{t("profile.displayName")}</Label>
        <Input
          id="display_name"
          value={form.display_name}
          onChange={set("display_name")}
          placeholder={t("profile.displayName")}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="birth_year">{t("profile.birthYear")}</Label>
          <Input
            id="birth_year"
            type="number"
            value={form.birth_year}
            onChange={set("birth_year")}
            placeholder="1990"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="climbing_since">{t("profile.climbingSince")}</Label>
          <Input
            id="climbing_since"
            type="number"
            value={form.climbing_since}
            onChange={set("climbing_since")}
            placeholder="2020"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>{t("profile.currentLeadGrade")}</Label>
        <GradeSelector
          style="lead"
          system={form.current_lead_grade_system as GradeSystem | ""}
          value={form.current_lead_grade_value}
          onSystemChange={(s) =>
            setForm((f) => ({ ...f, current_lead_grade_system: s }))
          }
          onValueChange={(v) =>
            setForm((f) => ({ ...f, current_lead_grade_value: v }))
          }
        />
      </div>

      <div className="space-y-2">
        <Label>{t("profile.currentBoulderGrade")}</Label>
        <GradeSelector
          style="boulder"
          system={form.current_boulder_grade_system as GradeSystem | ""}
          value={form.current_boulder_grade_value}
          onSystemChange={(s) =>
            setForm((f) => ({ ...f, current_boulder_grade_system: s }))
          }
          onValueChange={(v) =>
            setForm((f) => ({ ...f, current_boulder_grade_value: v }))
          }
        />
      </div>

      <div className="space-y-2">
        <Label>{t("profile.goalGrade")}</Label>
        <GradeSelector
          style="lead"
          system={form.goal_grade_system as GradeSystem | ""}
          value={form.goal_grade_value}
          onSystemChange={(s) =>
            setForm((f) => ({ ...f, goal_grade_system: s }))
          }
          onValueChange={(v) =>
            setForm((f) => ({ ...f, goal_grade_value: v }))
          }
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="other_activities">{t("profile.otherActivities")}</Label>
        <Textarea
          id="other_activities"
          value={form.other_activities}
          onChange={set("other_activities")}
          placeholder={t("profile.otherActivities")}
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="known_injuries">{t("profile.knownInjuries")}</Label>
        <Textarea
          id="known_injuries"
          value={form.known_injuries}
          onChange={set("known_injuries")}
          placeholder={t("profile.knownInjuries")}
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label>{t("profile.locale")}</Label>
        <Select
          value={form.locale}
          onValueChange={(v) => setForm((f) => ({ ...f, locale: v }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pl">Polski</SelectItem>
            <SelectItem value="en">English</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full">
        {submitLabel ?? t("common.save")}
      </Button>
    </form>
  );
}
