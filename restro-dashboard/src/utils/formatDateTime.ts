import { parseISO, format } from "date-fns";
export function formatDateTime(
  input: string | Date | undefined | null,
): string {
  if (input === undefined || input === null) return "";
  const date = typeof input === "string" ? parseISO(input) : input;
  const time = format(date, "HH:mm");
  const dayMonth = format(date, "dd/MM");
  return `${time} ${dayMonth}`;
}
