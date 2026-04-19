import { format, formatDistanceToNowStrict } from "date-fns";

export function formatRelativeTime(value: string | null) {
  if (!value) {
    return "Open-ended";
  }

  return formatDistanceToNowStrict(new Date(value), { addSuffix: true });
}

export function formatAbsoluteTime(value: string | null) {
  if (!value) {
    return "Still open";
  }

  return format(new Date(value), "MMM d, yyyy 'at' HH:mm");
}

export function formatCompactTime(value: string | null) {
  if (!value) {
    return "In progress";
  }

  return format(new Date(value), "MMM d · HH:mm");
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatDelta(value: number) {
  if (value === 0) {
    return "0";
  }

  return value > 0 ? `+${value}` : `${value}`;
}

export function titleCase(value: string) {
  return value
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .replace(/\b\w/g, (token) => token.toUpperCase());
}
