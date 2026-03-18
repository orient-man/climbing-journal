import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  type GradeSystem,
  getGradesForSystem,
  getSystemsForStyle,
} from "@/grades/tables";
import { useTranslation } from "react-i18next";

interface GradeSelectorProps {
  /** The climbing style — determines which grade systems are available */
  style: "lead" | "toprope" | "boulder";
  /** Currently selected grade system */
  system: GradeSystem | "";
  /** Currently selected grade value */
  value: string;
  /** Called when the grade system changes */
  onSystemChange: (system: GradeSystem) => void;
  /** Called when the grade value changes */
  onValueChange: (value: string) => void;
  /** Optional label */
  label?: string;
}

export default function GradeSelector({
  style,
  system,
  value,
  onSystemChange,
  onValueChange,
  label,
}: GradeSelectorProps) {
  const { t } = useTranslation();
  const availableSystems = getSystemsForStyle(style);
  const grades = system ? getGradesForSystem(system as GradeSystem) : [];

  return (
    <div className="flex gap-2 items-end">
      {label && (
        <Label className="text-sm text-muted-foreground mb-2">{label}</Label>
      )}
      <div className="flex-1">
        <Select
          value={system}
          onValueChange={(val) => {
            onSystemChange(val as GradeSystem);
            onValueChange(""); // Reset value when system changes
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t("grade.system")} />
          </SelectTrigger>
          <SelectContent>
            {availableSystems.map((sys) => (
              <SelectItem key={sys} value={sys}>
                {t(`grade.systems.${sys}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex-1">
        <Select
          value={value}
          onValueChange={onValueChange}
          disabled={!system}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t("grade.value")} />
          </SelectTrigger>
          <SelectContent>
            {grades.map((grade) => (
              <SelectItem key={grade} value={grade}>
                {grade}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
