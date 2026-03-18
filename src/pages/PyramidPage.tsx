import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useDb } from "@/db/provider";
import {
  getGradePyramidData,
  type PyramidEntry,
} from "@/db/operations/pyramid";
import { sortGrades } from "@/grades/utils";
import { SPORT_SYSTEMS, BOULDER_SYSTEMS, type GradeSystem, type Grade } from "@/grades/tables";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BarChart3 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const COMPLETION_TYPES = [
  "onsight",
  "flash",
  "redpoint",
  "repeat",
  "attempt",
] as const;

const COMPLETION_COLORS: Record<string, string> = {
  onsight: "#22c55e",
  flash: "#3b82f6",
  redpoint: "#f59e0b",
  repeat: "#8b5cf6",
  attempt: "#ef4444",
};

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

function sortPyramidEntries(entries: PyramidEntry[]): PyramidEntry[] {
  const grades: (Grade & { count: number })[] = entries.map((e) => ({
    system: e.grade_system as GradeSystem,
    value: e.grade_value,
    count: e.count,
  }));

  // Group by system, sort each group, then flatten
  const systems = [...new Set(grades.map((g) => g.system))];
  const sorted: PyramidEntry[] = [];

  for (const sys of systems) {
    const group = grades.filter((g) => g.system === sys);
    const sortedGroup = sortGrades(group);
    sorted.push(
      ...sortedGroup.map((g) => ({
        grade_system: g.system,
        grade_value: g.value,
        count: (g as Grade & { count: number }).count,
      }))
    );
  }

  return sorted;
}

function isSportSystem(system: string): boolean {
  return SPORT_SYSTEMS.includes(system as GradeSystem);
}

function isBoulderSystem(system: string): boolean {
  return BOULDER_SYSTEMS.includes(system as GradeSystem);
}

export default function PyramidPage() {
  const { t } = useTranslation();
  const { db } = useDb();
  const [timeRange, setTimeRange] = useState("all");
  const [styleFilter, setStyleFilter] = useState("all");
  const [activeCompletionTypes, setActiveCompletionTypes] = useState<Set<string>>(
    new Set(COMPLETION_TYPES)
  );

  const toggleCompletion = (type: string) => {
    setActiveCompletionTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  };

  const data = useMemo(() => {
    if (!db) return { lead: [], boulder: [] };

    const filters = {
      dateFrom: getDateFrom(timeRange),
      style:
        styleFilter !== "all"
          ? (styleFilter as "lead" | "boulder" | "toprope")
          : undefined,
      completionTypes:
        activeCompletionTypes.size < COMPLETION_TYPES.length
          ? Array.from(activeCompletionTypes)
          : undefined,
    };

    const raw = getGradePyramidData(db, filters);
    const sorted = sortPyramidEntries(raw);

    if (styleFilter === "all") {
      return {
        lead: sorted.filter((e) => isSportSystem(e.grade_system)),
        boulder: sorted.filter((e) => isBoulderSystem(e.grade_system)),
      };
    }

    return {
      lead: sorted.filter((e) => isSportSystem(e.grade_system)),
      boulder: sorted.filter((e) => isBoulderSystem(e.grade_system)),
    };
  }, [db, timeRange, styleFilter, activeCompletionTypes]);

  if (!db) return null;

  const hasData = data.lead.length > 0 || data.boulder.length > 0;

  const renderChart = (entries: PyramidEntry[], title: string) => {
    if (entries.length === 0) return null;

    const chartData = entries.map((e) => ({
      grade: e.grade_value,
      count: e.count,
      system: e.grade_system,
    }));

    return (
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">{title}</h3>
          <ResponsiveContainer width="100%" height={Math.max(200, entries.length * 36)}>
            <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 30 }}>
              <XAxis type="number" allowDecimals={false} />
              <YAxis dataKey="grade" type="category" width={60} fontSize={12} />
              <Tooltip
                formatter={(value) => [String(value), t("session.climbs")]}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {chartData.map((_, index) => (
                  <Cell key={index} fill="#3b82f6" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">{t("pyramid.title")}</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-end">
        <div className="space-y-2">
          <Label>{t("pyramid.filters.timeRange")}</Label>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("history.filters.allTime")}</SelectItem>
              <SelectItem value="1m">{t("history.filters.lastMonth")}</SelectItem>
              <SelectItem value="3m">{t("history.filters.last3Months")}</SelectItem>
              <SelectItem value="6m">{t("history.filters.last6Months")}</SelectItem>
              <SelectItem value="1y">{t("history.filters.lastYear")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>{t("pyramid.filters.style")}</Label>
          <Select value={styleFilter} onValueChange={setStyleFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("pyramid.filters.allStyles")}</SelectItem>
              <SelectItem value="lead">{t("climb.styles.lead")}</SelectItem>
              <SelectItem value="boulder">{t("climb.styles.boulder")}</SelectItem>
              <SelectItem value="toprope">{t("climb.styles.toprope")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>{t("pyramid.filters.completionType")}</Label>
          <div className="flex flex-wrap gap-2">
            {COMPLETION_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => toggleCompletion(type)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  activeCompletionTypes.has(type)
                    ? "text-white border-transparent"
                    : "text-muted-foreground border-border bg-background"
                }`}
                style={
                  activeCompletionTypes.has(type)
                    ? { backgroundColor: COMPLETION_COLORS[type] }
                    : undefined
                }
              >
                {t(`climb.completionTypes.${type}`)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Charts */}
      {!hasData ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{t("pyramid.empty")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {renderChart(data.lead, styleFilter === "all" ? "Lead / Top Rope" : t(`climb.styles.${styleFilter}`))}
          {renderChart(data.boulder, styleFilter === "all" ? "Boulder" : "")}
        </div>
      )}
    </div>
  );
}
