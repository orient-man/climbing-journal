import { describe, it, expect } from "vitest";
import {
  compareGrades,
  sortGrades,
  formatGrade,
  getGradeIndex,
} from "./utils";
import type { Grade } from "./tables";

describe("grade utilities", () => {
  describe("getGradeIndex", () => {
    it("returns the correct index for French grades", () => {
      expect(getGradeIndex("french", "6a")).toBe(12);
      expect(getGradeIndex("french", "6a+")).toBe(13);
      expect(getGradeIndex("french", "6b")).toBe(14);
    });

    it("returns the correct index for YDS grades", () => {
      expect(getGradeIndex("yds", "5.10a")).toBe(5);
      expect(getGradeIndex("yds", "5.12a")).toBe(13);
    });

    it("returns the correct index for V-scale grades", () => {
      expect(getGradeIndex("vscale", "V0")).toBe(0);
      expect(getGradeIndex("vscale", "V1")).toBe(1);
      expect(getGradeIndex("vscale", "V10")).toBe(10);
    });

    it("returns the correct index for Font grades", () => {
      expect(getGradeIndex("font", "6a")).toBe(4);
      expect(getGradeIndex("font", "7a")).toBe(10);
    });

    it("returns -1 for unknown grades", () => {
      expect(getGradeIndex("french", "unknown")).toBe(-1);
    });
  });

  describe("compareGrades", () => {
    it("returns negative when first grade is lower (French)", () => {
      const a: Grade = { system: "french", value: "6a" };
      const b: Grade = { system: "french", value: "6b" };
      expect(compareGrades(a, b)).toBeLessThan(0);
    });

    it("returns positive when first grade is higher (French)", () => {
      const a: Grade = { system: "french", value: "7a" };
      const b: Grade = { system: "french", value: "6c+" };
      expect(compareGrades(a, b)).toBeGreaterThan(0);
    });

    it("returns 0 for equal grades", () => {
      const a: Grade = { system: "french", value: "6a+" };
      const b: Grade = { system: "french", value: "6a+" };
      expect(compareGrades(a, b)).toBe(0);
    });

    it("handles edge cases like 6a+ vs 6b (French)", () => {
      const a: Grade = { system: "french", value: "6a+" };
      const b: Grade = { system: "french", value: "6b" };
      expect(compareGrades(a, b)).toBeLessThan(0);
    });

    it("works with V-scale grades (V0 vs V1)", () => {
      const a: Grade = { system: "vscale", value: "V0" };
      const b: Grade = { system: "vscale", value: "V1" };
      expect(compareGrades(a, b)).toBeLessThan(0);
    });

    it("works with YDS grades", () => {
      const a: Grade = { system: "yds", value: "5.10a" };
      const b: Grade = { system: "yds", value: "5.11a" };
      expect(compareGrades(a, b)).toBeLessThan(0);
    });

    it("works with Font grades", () => {
      const a: Grade = { system: "font", value: "6a" };
      const b: Grade = { system: "font", value: "7a" };
      expect(compareGrades(a, b)).toBeLessThan(0);
    });

    it("returns 0 when comparing grades from different systems", () => {
      const a: Grade = { system: "french", value: "6a" };
      const b: Grade = { system: "yds", value: "5.10a" };
      expect(compareGrades(a, b)).toBe(0);
    });
  });

  describe("sortGrades", () => {
    it("sorts French grades in ascending order", () => {
      const grades: Grade[] = [
        { system: "french", value: "7a" },
        { system: "french", value: "6a" },
        { system: "french", value: "6c+" },
        { system: "french", value: "6a+" },
      ];
      const sorted = sortGrades(grades);
      expect(sorted.map((g) => g.value)).toEqual(["6a", "6a+", "6c+", "7a"]);
    });

    it("sorts V-scale grades in ascending order", () => {
      const grades: Grade[] = [
        { system: "vscale", value: "V5" },
        { system: "vscale", value: "V1" },
        { system: "vscale", value: "V10" },
        { system: "vscale", value: "V3" },
      ];
      const sorted = sortGrades(grades);
      expect(sorted.map((g) => g.value)).toEqual(["V1", "V3", "V5", "V10"]);
    });

    it("does not mutate the original array", () => {
      const grades: Grade[] = [
        { system: "french", value: "7a" },
        { system: "french", value: "6a" },
      ];
      sortGrades(grades);
      expect(grades[0].value).toBe("7a");
    });
  });

  describe("formatGrade", () => {
    it("formats a French grade", () => {
      expect(formatGrade({ system: "french", value: "6a+" })).toBe("6a+");
    });

    it("formats a YDS grade", () => {
      expect(formatGrade({ system: "yds", value: "5.12a" })).toBe("5.12a");
    });

    it("formats a V-scale grade", () => {
      expect(formatGrade({ system: "vscale", value: "V5" })).toBe("V5");
    });

    it("formats a Font grade", () => {
      expect(formatGrade({ system: "font", value: "7a+" })).toBe("7a+");
    });

    it("returns empty string for null/undefined grade", () => {
      expect(formatGrade(null)).toBe("");
      expect(formatGrade(undefined)).toBe("");
    });
  });
});
