import { intervalToDuration } from "date-fns";
import type { OrgBuzz } from "~/types/buzzs";

export const formatBuzzDuration = (
  startedAt?: string | null,
  endedAt?: string | null,
  status?: string
) => {
  if (!startedAt) return "";

  // The API sends a planned ended_at (start + 2 hours) for live buzzes,
  // so it can't be used as the duration until the buzz has really ended.
  if ((status || "").toLowerCase() === "active") {
    return "In progress";
  }

  const start = new Date(startedAt);
  const end = endedAt ? new Date(endedAt) : new Date();
  const duration = intervalToDuration({ start, end });

  const hours = duration.hours ?? 0;
  const minutes = duration.minutes ?? 0;

  if (hours > 0 && minutes > 0) {
    return `${hours} hour${hours === 1 ? "" : "s"} ${minutes} minute${minutes === 1 ? "" : "s"}`;
  }

  if (hours > 0) {
    return `${hours} hour${hours === 1 ? "" : "s"}`;
  }

  const totalMinutes = Math.max(minutes, 1);
  return `${totalMinutes} minute${totalMinutes === 1 ? "" : "s"}`;
};

export const getBuzzContextLabel = (buzz: OrgBuzz, channelName?: string) => {
  const type = (buzz.channel_type || buzz.buzz_type || "").toLowerCase();

  if (type.includes("dm") || type.includes("direct")) {
    return "From a direct message";
  }

  if (type.includes("group")) {
    return "From a group conversation";
  }

  if (channelName) {
    return `From #${channelName}`;
  }

  return "From a channel";
};

export const getBuzzTitle = (buzz: OrgBuzz, hostName: string) => {
  const others = Math.max((buzz.participant_count ?? 1) - 1, 0);

  if (others === 0) {
    return hostName;
  }

  if (others === 1) {
    return `${hostName} and 1 other`;
  }

  return `${hostName} and ${others} others`;
};

export const isBuzzActive = (buzz: OrgBuzz) =>
  (buzz.status || "").toLowerCase() === "active";
