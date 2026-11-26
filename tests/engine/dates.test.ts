import { describe, expect, it } from "vitest";

import { addDays, isoWeekday, programWeek, toOsloDate, weekStart } from "@/shared/lib/dates";

describe("toOsloDate and weekStart", () => {
  it("handles an ordinary weekday", () => {
    const date = toOsloDate(new Date("2026-11-25T10:00:00Z"));
    expect(date).toBe("2026-11-25");
    expect(weekStart(date)).toBe("2026-11-23");
  });

  it("moves to Monday when Sunday night UTC is already Monday in Oslo", () => {
    const date = toOsloDate(new Date("2026-11-29T23:30:00Z"));
    expect(date).toBe("2026-11-30");
    expect(weekStart(date)).toBe("2026-11-30");
  });

  it("keeps Sunday in the week that started the Monday before", () => {
    const date = toOsloDate(new Date("2026-11-29T22:30:00Z"));
    expect(date).toBe("2026-11-29");
    expect(weekStart(date)).toBe("2026-11-23");
  });

  it.each([
    // Spring forward: 29 March 2026, 02:00 CET becomes 03:00 CEST.
    ["2026-03-29T00:30:00Z", "2026-03-29", "2026-03-23"],
    ["2026-03-28T23:30:00Z", "2026-03-29", "2026-03-23"],
    // After the change Oslo is UTC+2, so 22:30Z on Sunday is already Monday.
    ["2026-03-29T22:30:00Z", "2026-03-30", "2026-03-30"],
    // Fall back: 25 October 2026, 03:00 CEST becomes 02:00 CET.
    ["2026-10-25T00:30:00Z", "2026-10-25", "2026-10-19"],
    ["2026-10-24T22:30:00Z", "2026-10-25", "2026-10-19"],
    // After the change Oslo is UTC+1 again, so 22:30Z on Sunday is still Sunday.
    ["2026-10-25T22:30:00Z", "2026-10-25", "2026-10-19"],
  ])("gives the right Oslo date across a DST change (%s)", (moment, date, monday) => {
    expect(toOsloDate(new Date(moment))).toBe(date);
    expect(weekStart(date)).toBe(monday);
  });

  it("rejects invalid input", () => {
    expect(() => toOsloDate(new Date("not a date"))).toThrow(RangeError);
    expect(() => weekStart("2026-02-30")).toThrow(RangeError);
    expect(() => weekStart("25.11.2026")).toThrow(RangeError);
  });
});

describe("programWeek", () => {
  it("is week 1 in the week the program starts", () => {
    expect(programWeek(new Date("2026-11-25T10:00:00Z"), "2026-11-23")).toBe(1);
  });

  it("counts a mid-week start from that week's Monday", () => {
    expect(programWeek(new Date("2026-11-29T22:30:00Z"), "2026-11-26")).toBe(1);
    expect(programWeek(new Date("2026-11-30T10:00:00Z"), "2026-11-26")).toBe(2);
  });

  it("counts whole weeks across a DST change", () => {
    expect(programWeek(new Date("2026-10-26T08:00:00Z"), "2026-10-19")).toBe(2);
    expect(programWeek(new Date("2026-12-28T08:00:00Z"), "2026-11-23")).toBe(6);
  });

  it("allows the first week before the start day itself", () => {
    expect(programWeek(new Date("2026-11-23T08:00:00Z"), "2026-11-26")).toBe(1);
  });

  it("throws when the moment is before the program's first week", () => {
    expect(() => programWeek(new Date("2026-11-22T12:00:00Z"), "2026-11-26")).toThrow(RangeError);
  });
});

describe("addDays and isoWeekday", () => {
  it("adds days across month, year and leap-day boundaries", () => {
    expect(addDays("2026-11-30", 1)).toBe("2026-12-01");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2028-02-28", 1)).toBe("2028-02-29");
    expect(addDays("2026-11-23", -1)).toBe("2026-11-22");
    expect(addDays("2026-11-23", 0)).toBe("2026-11-23");
  });

  it("numbers weekdays from Monday = 1 to Sunday = 7", () => {
    expect(isoWeekday("2026-11-23")).toBe(1);
    expect(isoWeekday("2026-11-25")).toBe(3);
    expect(isoWeekday("2026-11-29")).toBe(7);
    expect(isoWeekday("1970-01-01")).toBe(4);
  });

  it("agrees with weekStart: Monday is weekday 1", () => {
    expect(isoWeekday(weekStart("2026-11-29"))).toBe(1);
  });

  it("rejects an invalid date", () => {
    expect(() => addDays("2026-02-30", 1)).toThrow(RangeError);
  });
});
