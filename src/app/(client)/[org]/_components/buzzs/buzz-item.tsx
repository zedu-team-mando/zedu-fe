"use client";

import Link from "next/link";
import { useContext, useMemo, useState } from "react";
import {
  Copy,
  ExternalLink,
  Headphones,
  MoreVertical,
  Radio,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import FallbackImage from "~/components/layout/fallback-image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { DataContext } from "~/store/GlobalState";
import { showInfo } from "~/components/toast/sonner";
import type { OrgBuzz } from "~/types/buzzs";
import { cn } from "~/lib/utils";
import { openBuzzInNewTab } from "~/lib/buzz/open-buzz-tab";
import {
  formatBuzzDuration,
  getBuzzContextLabel,
  getBuzzTitle,
  isBuzzActive,
} from "./buzz-utils";
import { useBuzzHost } from "./use-buzz-host";

interface BuzzItemProps {
  buzz: OrgBuzz;
}

export const BuzzItem = ({ buzz }: BuzzItemProps) => {
  const { state } = useContext(DataContext);
  const { orgSlug, channels } = state;
  const [joinLoading, setJoinLoading] = useState(false);

  const host = useBuzzHost(buzz.host_id);
  const hostName =
    host?.name || host?.username || host?.email?.split("@")[0] || "Someone";

  const channel = channels?.find(
    (item: { channels_id?: string }) => item.channels_id === buzz.channel_id
  );
  const channelName = channel?.name || channel?.channel_slug;

  const active = isBuzzActive(buzz);
  const title = getBuzzTitle(buzz, hostName);
  const contextLabel = getBuzzContextLabel(buzz, channelName);
  const duration = formatBuzzDuration(
    buzz.started_at || buzz.created_at,
    buzz.ended_at,
    buzz.status
  );
  const relativeTime = formatDistanceToNow(
    new Date(buzz.started_at || buzz.created_at),
    { addSuffix: true }
  );

  const avatarStack = useMemo(() => {
    const stack = [host].filter(Boolean);
    return stack.slice(0, 3);
  }, [host]);

  const handleJoin = () => {
    const buzzId = buzz.buzz_code || buzz.buzz_id;
    if (!buzzId || !orgSlug) return;

    setJoinLoading(true);
    openBuzzInNewTab(orgSlug, buzzId);
    setJoinLoading(false);
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(buzz.buzz_code || buzz.buzz_id);
      showInfo("Buzz code copied");
    } catch {
      // ignore clipboard errors
    }
  };

  const channelHref =
    channelName && orgSlug
      ? `/${orgSlug}/home/channels/${buzz.channel_id}`
      : null;

  return (
    <div
      className={cn(
        "group flex items-center gap-4 border-b border-[#E6EAEF] px-5 py-4 transition-colors last:border-b-0 hover:bg-[#F9FAFB]",
        active && "bg-[#F6FFFA]/40 hover:bg-[#F6FFFA]/70"
      )}
    >
      <div
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-lg border",
          active
            ? "border-[#ABEFC6] bg-[#ECFDF3] text-[#067647]"
            : "border-[#E6EAEF] bg-[#F2F4F7] text-[#667085]"
        )}
      >
        <Headphones className="size-5" strokeWidth={1.75} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-[15px] font-bold text-[#1D2939]">
            {title}
          </p>
          {active && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#ECFDF3] px-2 py-0.5 text-[11px] font-semibold text-[#067647]">
              <Radio className="size-3" />
              Live
            </span>
          )}
        </div>

        <p className="mt-0.5 truncate text-[13px] text-[#667085]">
          {relativeTime}
          {duration ? ` · ${duration}` : ""}
          {contextLabel ? ` · ${contextLabel}` : ""}
        </p>

        {buzz.buzz_code && (
          <p className="mt-1 text-xs text-[#98A2B3]">{buzz.buzz_code}</p>
        )}
      </div>

      <div className="hidden items-center sm:flex">
        <div className="flex -space-x-2">
          {avatarStack.map((member: any, index) => (
            <FallbackImage
              key={member?.id ?? index}
              src={member?.avatar_url || member?.default_avatar_url}
              alt={member?.name || member?.username || "Participant"}
              width={28}
              height={28}
              className="size-7 rounded-full border-2 border-white object-cover"
            />
          ))}
          {buzz.participant_count > avatarStack.length && (
            <div className="flex size-7 items-center justify-center rounded-full border-2 border-white bg-[#F2F4F7] text-[11px] font-semibold text-[#667085]">
              +{buzz.participant_count - avatarStack.length}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {active && (
          <button
            type="button"
            onClick={handleJoin}
            disabled={joinLoading}
            className="rounded-md border border-[#1264A3] bg-white px-3 py-1.5 text-sm font-semibold text-[#1264A3] transition hover:bg-[#F0F7FC] disabled:opacity-60"
          >
            {joinLoading ? "Joining..." : "Join"}
          </button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="rounded-md p-1.5 text-[#667085] opacity-0 transition hover:bg-[#F2F4F7] group-hover:opacity-100 data-[state=open]:opacity-100"
              aria-label="Buzz options"
            >
              <MoreVertical className="size-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {active && (
              <DropdownMenuItem onClick={handleJoin} disabled={joinLoading}>
                Join buzz
              </DropdownMenuItem>
            )}
            {channelHref && (
              <DropdownMenuItem asChild>
                <Link href={channelHref} className="flex items-center gap-2">
                  <ExternalLink className="size-4" />
                  Open channel
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={handleCopyCode}>
              <Copy className="mr-2 size-4" />
              Copy buzz code
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
