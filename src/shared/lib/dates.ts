// Calendar time for Flex PT (AD-13): weeks run Monday to Sunday in Europe/Oslo.
// Pure functions: the caller passes the moment, so nothing here reads the clock.

/** A calendar date in `YYYY-MM-DD` form. */
export type CalendarDate = string;

const TIME_ZONE = "Europe/Oslo";
const DAY_MS = 24 * 60 * 60 * 1000;
const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

const osloFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Returns the Europe/Oslo calendar date of a UTC moment. */
export function toOsloDate(moment: Date): CalendarDate {
  if (Number.isNaN(moment.getTime())) {
    throw new RangeError("Invalid moment");
  }
  const parts = osloFormatter.formatToParts(moment);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

/** Returns the Monday (`week_start`) of the week that contains the given calendar date. */
export function weekStart(date: CalendarDate): CalendarDate {
  const days = toDayNumber(date);
  // 1970-01-01 was a Thursday, so day 0 is three days after a Monday.
  const daysSinceMonday = (((days + 3) % 7) + 7) % 7;
  return fromDayNumber(days - daysSinceMonday);
}

/**
 * Returns the program week (counted from 1) that contains the moment.
 * Weeks are counted from the `week_start` of the program's start date, so a program
 * started mid-week is in week 2 from the following Monday.
 * Throws a RangeError if the moment lies before the program's first week.
 */
export function programWeek(moment: Date, programStart: CalendarDate): number {
  const first = toDayNumber(weekStart(programStart));
  const current = toDayNumber(weekStart(toOsloDate(moment)));
  if (current < first) {
    throw new RangeError("Moment is before the program's first week");
  }
  return (current - first) / 7 + 1;
}

function toDayNumber(date: CalendarDate): number {
  const match = DATE_PATTERN.exec(date);
  if (!match) {
    throw new RangeError(`Invalid calendar date: ${date}`);
  }
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const utc = Date.UTC(year, month - 1, day);
  if (fromDayNumber(utc / DAY_MS) !== date) {
    throw new RangeError(`Invalid calendar date: ${date}`);
  }
  return utc / DAY_MS;
}

function fromDayNumber(days: number): CalendarDate {
  return new Date(days * DAY_MS).toISOString().slice(0, 10);
}
