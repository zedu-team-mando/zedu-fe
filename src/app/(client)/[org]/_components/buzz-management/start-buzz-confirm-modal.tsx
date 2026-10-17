"use client";

import { Dialog, DialogContent, DialogTitle } from "~/components/ui/dialog";
import { Bell, Hash, Lock, Video, X } from "lucide-react";
import Loading from "~/components/ui/loading";
import { cn } from "~/lib/utils";

export type StartBuzzConfirmVariant = "channel" | "group_chat" | "direct_chat";

export type StartBuzzConfirmModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
  variant: StartBuzzConfirmVariant;
  displayName: string;
  memberCount?: number;
  isPrivate?: boolean;
};

const STEPS: Record<StartBuzzConfirmVariant, [string, string, string]> = {
  channel: [
    "Opens a live video Buzz session",
    "Notifies every member of this channel",
    "Anyone can join from the chat header",
  ],
  group_chat: [
    "Opens a live video Buzz session",
    "Notifies everyone in this chat",
    "Anyone in the chat can join from the header",
  ],
  direct_chat: [
    "Opens a live video Buzz session",
    "Notifies the other person in this chat",
    "They can join from the chat header",
  ],
};

function getCopy(variant: StartBuzzConfirmVariant, displayName: string) {
  const safeName = displayName.trim() || "this chat";

  if (variant === "channel") {
    const channelRef = safeName.startsWith("#") ? safeName : `#${safeName}`;
    return {
      title: "Start a Buzz for everyone?",
      intro: `You are about to start a Buzz in ${channelRef}. This will notify the whole channel. Do you want to proceed?`,
      notice: "Everyone who can access this chat may see and join the Buzz.",
    };
  }

  if (variant === "group_chat") {
    return {
      title: "Start a Buzz for everyone?",
      intro: `You are about to start a Buzz in ${safeName}. This will notify everyone in this chat. Do you want to proceed?`,
      notice: "Everyone who can access this chat may see and join the Buzz.",
    };
  }

  return {
    title: "Start a Buzz?",
    intro: `You are about to start a Buzz with ${safeName}. They will be notified. Do you want to proceed?`,
    notice: "They can see and join the Buzz from this conversation.",
  };
}

export function StartBuzzConfirmModal({
  open,
  onOpenChange,
  onConfirm,
  loading = false,
  variant,
  displayName,
  memberCount,
  isPrivate = false,
}: StartBuzzConfirmModalProps) {
  const copy = getCopy(variant, displayName);
  const steps = STEPS[variant];
  const showMemberCount =
    typeof memberCount === "number" &&
    memberCount > 0 &&
    variant !== "direct_chat";

  const chipLabel =
    variant === "channel"
      ? `${displayName.startsWith("#") ? displayName : `#${displayName}`}${
          showMemberCount
            ? ` · ${memberCount} ${memberCount === 1 ? "member" : "members"}`
            : ""
        }`
      : showMemberCount
        ? `${displayName} · ${memberCount} ${memberCount === 1 ? "member" : "members"}`
        : displayName;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[420px] gap-0 overflow-hidden border-[#E6EAEF] bg-white p-0 dark:border-white/15 dark:bg-[#222529] sm:rounded-2xl"
        aria-describedby={undefined}
      >
        <div className="relative px-6 pt-6 pb-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 rounded-md p-1 text-[#667085] hover:bg-[#F2F4F7] hover:text-[#344054] dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-zinc-100"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>

          <div className="flex size-11 items-center justify-center rounded-full bg-[#F4F3FF] text-[#5757CD] dark:bg-[#5757CD]/20 dark:text-[#A5A5F0]">
            <Video className="size-5" strokeWidth={2} />
          </div>

          <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-[#5757CD] dark:text-[#A5A5F0]">
            Buzz
          </p>
          <DialogTitle className="mt-1 pr-8 text-left text-xl font-bold text-[#101828] dark:text-zinc-100">
            {copy.title}
          </DialogTitle>

          <div className="mt-3 inline-flex max-w-full items-center gap-1.5 rounded-full bg-[#F2F4F7] px-3 py-1.5 text-sm font-medium text-[#344054] dark:bg-zinc-700/80 dark:text-zinc-200">
            {variant === "channel" &&
              (isPrivate ? (
                <Lock className="size-3.5 shrink-0 text-[#5757CD]" />
              ) : (
                <Hash className="size-3.5 shrink-0 text-[#5757CD]" />
              ))}
            <span className="truncate">{chipLabel}</span>
          </div>
        </div>

        <div className="space-y-4 px-6 pb-6 pt-2">
          <p className="text-sm leading-relaxed text-[#667085] dark:text-zinc-400">
            {copy.intro}
          </p>

          <ol className="space-y-3">
            {steps.map((step, index) => (
              <li
                key={step}
                className="flex gap-3 text-sm text-[#344054] dark:text-zinc-300"
              >
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#F2F4F7] text-xs font-semibold text-[#667085] dark:bg-zinc-700 dark:text-zinc-400">
                  {index + 1}
                </span>
                <span className="pt-0.5 leading-snug">{step}</span>
              </li>
            ))}
          </ol>

          <div className="flex gap-3 rounded-xl bg-[#F4F3FF] px-4 py-3 dark:bg-[#5757CD]/15 dark:ring-1 dark:ring-[#5757CD]/25">
            <Bell className="mt-0.5 size-4 shrink-0 text-[#5757CD] dark:text-[#A5A5F0]" />
            <p className="text-sm leading-snug text-[#475467] dark:text-zinc-300">
              {copy.notice}
            </p>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              disabled={loading}
              onClick={() => onOpenChange(false)}
              className={cn(
                "h-11 flex-1 rounded-xl bg-[#F2F4F7] text-sm font-semibold text-[#344054]",
                "hover:bg-[#E4E7EC] disabled:opacity-50",
                "dark:bg-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-600"
              )}
            >
              Not now
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => void onConfirm()}
              className={cn(
                "inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#5757CD] text-sm font-semibold text-white",
                "hover:bg-[#4A4AAF] disabled:opacity-50"
              )}
            >
              {loading ? (
                <Loading color="white" height="18px" width="18px" />
              ) : (
                <>
                  <Video className="size-4" />
                  Start Buzz
                </>
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default StartBuzzConfirmModal;
