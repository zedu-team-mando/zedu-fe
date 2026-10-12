"use client";

import { useState, useRef, useContext, useCallback, useMemo } from "react";
import * as Popover from "@radix-ui/react-popover";
import { PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { DataContext } from "~/store/GlobalState";
import UserHoverCardContent from "./mention";
import { useRouter } from "next/navigation";
import { orgSlugFromPathname } from "~/lib/reserved-paths";

interface GlobalMentionProps {
  id: string;
  trigger: "@" | "#";
  label: string;
  item: any;
  currentUser?: any;
}

const normalizeMentionValue = (value?: string | null) =>
  (value ?? "").trim().toLowerCase();

const isCurrentUserMention = (id: string, label: string, currentUser?: any) => {
  if (!currentUser) return false;

  if (id && String(id) === String(currentUser.id)) {
    return true;
  }

  const normalizedLabel = normalizeMentionValue(label);
  if (!normalizedLabel) return false;

  return [currentUser.username, currentUser.name, currentUser.email].some(
    (value) => normalizeMentionValue(value) === normalizedLabel
  );
};

const isChannelMention = (trigger: "@" | "#", id: string, label: string) => {
  if (trigger === "#") return true;

  const normalizedLabel = normalizeMentionValue(label);
  return id === "channel" || normalizedLabel === "channel";
};

const isUserMention = (trigger: "@" | "#", id: string, label: string) =>
  trigger === "@" && !isChannelMention(trigger, id, label);

const isBroadcastChannelMention = (
  trigger: "@" | "#",
  id: string,
  label: string
) =>
  trigger === "@" &&
  (id === "channel" || normalizeMentionValue(label) === "channel");

const resolveChannelId = (
  id: string,
  label: string,
  channels: { channels_id?: string; name?: string; channel_slug?: string }[]
) => {
  const normalizedLabel = normalizeMentionValue(label);
  if (!normalizedLabel) return null;

  if (id && id !== "channel") {
    const byId = channels.find((channel) => channel.channels_id === id);
    if (byId?.channels_id) return byId.channels_id;
  }

  const byName = channels.find((channel) => {
    const name = normalizeMentionValue(channel.name);
    const slug = normalizeMentionValue(channel.channel_slug);
    return name === normalizedLabel || slug === normalizedLabel;
  });

  return byName?.channels_id ?? null;
};

export default function GlobalMention({
  id,
  trigger,
  label,
  item,
  currentUser,
}: GlobalMentionProps) {
  const { state } = useContext(DataContext);
  const router = useRouter();
  const loggedInUser = currentUser ?? state?.user;
  const orgSlug =
    state?.orgSlug ||
    (typeof window !== "undefined"
      ? orgSlugFromPathname(window.location.pathname)
      : "");

  const channelDirectory = useMemo(() => {
    const merged = [...(state?.channels ?? []), ...(state?.allChannels ?? [])];
    const seen = new Set<string>();
    return merged.filter((channel: any) => {
      const channelId = channel?.channels_id;
      if (!channelId || seen.has(channelId)) return false;
      seen.add(channelId);
      return true;
    });
  }, [state?.channels, state?.allChannels]);
  const isSelfMention =
    trigger === "@" && isCurrentUserMention(id, label, loggedInUser);
  const showUserCard = isUserMention(trigger, id, label);

  const [open, setOpen] = useState(false);
  const openTimer = useRef<NodeJS.Timeout | null>(null);
  const closeTimer = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    openTimer.current = setTimeout(() => setOpen(true), 400);
  };

  const handleMouseLeave = () => {
    if (openTimer.current) clearTimeout(openTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), 250);
  };

  const isChannel = isChannelMention(trigger, id, label);
  const isNavigableChannelMention =
    trigger === "#" && !isBroadcastChannelMention(trigger, id, label);

  const navigateToChannel = useCallback(() => {
    const channelId = resolveChannelId(id, label, channelDirectory);
    if (!channelId || !orgSlug) return;

    localStorage.setItem("channelId", channelId);
    localStorage.setItem("channelName", label);

    router.push(`/${orgSlug}/home/channels/${channelId}`);
  }, [channelDirectory, id, label, orgSlug, router]);

  const handleChannelClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    navigateToChannel();
  };

  const handleChannelKeyDown = (event: React.KeyboardEvent) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    event.stopPropagation();
    navigateToChannel();
  };

  const isSystemMessage = item?.type === "system";

  const mentionClassName = isSystemMessage
    ? "text-[#6B7280] bg-[#EEF0F3] hover:bg-[#E4E7EC] dark:bg-white/10 dark:hover:bg-white/15 px-1 rounded cursor-pointer transition-colors font-medium inline-flex items-center mx-[1px]"
    : isChannel
      ? "text-[#9A6700] bg-[#FFF3B0] hover:bg-[#FFE566] dark:text-[#F5D90A] dark:bg-[#4A3F00] dark:hover:bg-[#5C4E00] px-1 rounded cursor-pointer transition-colors font-medium inline-flex items-center mx-[1px]"
      : isSelfMention
        ? "text-[#1264a3] bg-[#fff3b0] hover:bg-[#ffe566] dark:text-[#F5D90A] dark:bg-[#4A3F00] dark:hover:bg-[#5C4E00] px-1 rounded cursor-pointer transition-colors font-medium inline-flex items-center mx-[1px]"
        : "text-[#1264a3] bg-[#e8f0fe] hover:bg-[#d0e2ff] dark:text-[#6CB6FF] dark:bg-[#1A3F66] dark:hover:bg-[#245380] px-1 rounded cursor-pointer transition-colors font-medium inline-flex items-center mx-[1px]";

  if (!showUserCard) {
    return (
      <span
        className={mentionClassName}
        role={isNavigableChannelMention ? "link" : undefined}
        tabIndex={isNavigableChannelMention ? 0 : undefined}
        onClick={isNavigableChannelMention ? handleChannelClick : undefined}
        onKeyDown={isNavigableChannelMention ? handleChannelKeyDown : undefined}
      >
        {trigger}
        {label}
      </span>
    );
  }

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <span
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={mentionClassName}
        >
          {trigger}
          {label}
        </span>
      </PopoverTrigger>

      <PopoverContent
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        sideOffset={5}
        side="top"
        align="start"
        className="z-[100] rounded-xl border border-gray-200 bg-white shadow-xl p-0 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        <UserHoverCardContent userId={id} />
      </PopoverContent>
    </Popover.Root>
  );
}
