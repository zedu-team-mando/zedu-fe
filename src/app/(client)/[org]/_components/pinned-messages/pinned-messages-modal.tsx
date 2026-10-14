"use client";

import { useContext, useEffect, useRef, useState } from "react";
import { ArrowUpRight, Pin, PinOff, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "~/components/ui/dialog";
import Loading from "~/components/ui/loading";
import UserAvatar from "~/components/layout/user-avatar";
import MessageItem from "../ChannelMessage/message-item";
import { AppleEmojiText } from "~/app/(client)/[org]/_components/apple-emoji/apple-emoji-text";
import ReplyCard from "../reply-card";
import { DataContext } from "~/store/GlobalState";
import { ACTIONS } from "~/store/Actions";
import { DeleteSavedMessage, GetRequest } from "~/utils/new-request";
import { showError } from "~/components/toast/sonner";
import {
  applyMessageHighlightClasses,
  clearMessageHighlight,
  MESSAGE_HIGHLIGHT_DURATION_MS,
  removeMessageHighlightClasses,
  setMessageHighlight,
} from "~/utils/message-highlight";
import { cn } from "~/lib/utils";
import {
  normalizePins,
  pinKind,
  resolvePinnedMessages,
  type PinScope,
  type ResolvedPin,
} from "./resolve-pinned-messages";

type PinnedMessagesModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  channelId: string;
  scope: PinScope;
};

const formatStamp = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const time = date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  if (date.toDateString() === new Date().toDateString()) return time;

  const day = date.toLocaleDateString([], { month: "short", day: "numeric" });
  return `${day}, ${time}`;
};

const formatPinDate = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const pinCaption = (
  message: Record<string, any> | null,
  pinnedAt: string,
  currentEmail?: string
) => {
  const details = message?.pinned_details;
  const pinnedBy =
    details?.email && currentEmail && details.email === currentEmail
      ? "you"
      : details?.username;
  const when = formatPinDate(pinnedAt);

  if (pinnedBy && when) return `Pinned by ${pinnedBy} · ${when}`;
  if (pinnedBy) return `Pinned by ${pinnedBy}`;
  if (when) return `Pinned ${when}`;
  return "Pinned message";
};

const isPreviewTarget = (target: EventTarget | null) => {
  if (!(target instanceof Element)) return false;
  return Boolean(target.closest("[data-message-preview]"));
};

const scrollPinnedMessageIntoView = (elementIds: string[]) => {
  for (const id of elementIds) {
    const element = document.getElementById(id);
    if (!element) continue;

    element.scrollIntoView({ behavior: "auto", block: "center" });
    applyMessageHighlightClasses(element);
    window.setTimeout(() => {
      removeMessageHighlightClasses(element);
    }, MESSAGE_HIGHLIGHT_DURATION_MS);

    return true;
  }

  return false;
};

const PinnedMessagesModal = ({
  open,
  onOpenChange,
  channelId,
  scope,
}: PinnedMessagesModalProps) => {
  const { state, dispatch } = useContext(DataContext);
  const [pins, setPins] = useState<ResolvedPin[]>([]);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [unpinningId, setUnpinningId] = useState<string | null>(null);
  const knownMessagesRef = useRef<any[]>([]);
  const primaryMessages = scope === "chat" ? state?.chats : state?.messages;
  const secondaryMessages = scope === "chat" ? state?.messages : state?.chats;

  knownMessagesRef.current = [
    ...(Array.isArray(primaryMessages) ? primaryMessages : []),
    ...(Array.isArray(state?.replies) ? state.replies : []),
    ...(Array.isArray(secondaryMessages) ? secondaryMessages : []),
  ];

  const conversationName =
    scope === "channel"
      ? state?.channelName || state?.channelDetails?.name || "this channel"
      : "this conversation";

  useEffect(() => {
    if (!open || !channelId) return;

    let cancelled = false;

    const load = async () => {
      setPins([]);
      setLoading(true);
      setFailed(false);

      const res = await GetRequest(`/channels/pin/${channelId}`);

      if (cancelled) return;

      if (!(res?.status === 200 || res?.status === 201)) {
        setFailed(true);
        setLoading(false);
        return;
      }

      const resolved = await resolvePinnedMessages({
        records: normalizePins(res?.data?.data),
        knownMessages: knownMessagesRef.current,
        scope,
        channelId,
      });

      if (cancelled) return;

      setPins(resolved);
      setLoading(false);
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [open, channelId, scope]);

  const openThread = (message: Record<string, any>) => {
    dispatch({ type: ACTIONS.THREAD, payload: message });
    dispatch({
      type: ACTIONS.REPLIES,
      payload: {
        newThreads: message.preview_reply,
        newPage: 1,
        parentReactions: message.reactions,
      },
    });
    dispatch({ type: ACTIONS.REPLY, payload: true });
    dispatch({ type: ACTIONS.LOAD_THREAD, payload: !state.loadThread });
    onOpenChange(false);
  };

  const jumpToMessage = (pin: ResolvedPin) => {
    if (!pin.message) return;

    const target = pinKind(pin.message, pin.pinId);
    const threadId = target.threadId || pin.pinId;
    const isReply = target.kind === "message";
    const elementIds = isReply
      ? [`reply-${target.id}`, `thread-${threadId}`]
      : [`thread-${threadId}`, `thread-${pin.pinId}`];

    if (isReply) {
      const lists = [
        ...(Array.isArray(state?.messages) ? state.messages : []),
        ...(Array.isArray(state?.chats) ? state.chats : []),
      ];
      const parent = lists.find(
        (item: any) => String(item?.thread_id) === threadId
      );

      if (parent) openThread(parent);
    }

    onOpenChange(false);
    clearMessageHighlight();

    let found = false;
    const delays = [0, 80, 200, 360];

    delays.forEach((delay, index) => {
      window.setTimeout(() => {
        if (scrollPinnedMessageIntoView(elementIds)) {
          found = true;
          return;
        }

        if (found || index !== delays.length - 1) return;

        const highlightId = isReply ? String(target.id) : threadId;
        setMessageHighlight(highlightId);
        dispatch({ type: ACTIONS.DATA_ID, payload: null });
        window.setTimeout(() => {
          dispatch({ type: ACTIONS.DATA_ID, payload: highlightId });
        }, 0);
      }, delay);
    });
  };

  const unpin = async (pin: ResolvedPin) => {
    if (!channelId || unpinningId) return;

    setUnpinningId(pin.pinId);

    const target = pinKind(pin.message, pin.pinId);
    const threadUrl = `/channels/pin/${channelId}/thread/${target.id}`;
    const messageUrl = `/channels/pin/${channelId}/message/${target.id}`;

    let res =
      target.kind === "message"
        ? await DeleteSavedMessage(messageUrl)
        : await DeleteSavedMessage(threadUrl);

    if (!(res?.status === 200 || res?.status === 201) && !pin.message) {
      res = await DeleteSavedMessage(
        target.kind === "message" ? threadUrl : messageUrl
      );
    }

    if (!(res?.status === 200 || res?.status === 201)) {
      showError("Could not unpin this message");
      setUnpinningId(null);
      return;
    }

    const pinAction =
      scope === "chat" ? ACTIONS.UPDATE_DM_PIN : ACTIONS.UPDATE_CHANNEL_PIN;

    dispatch({
      type: pinAction,
      payload: {
        threadId: target.threadId,
        is_pin: false,
        details: null,
      },
    });

    if (target.kind === "message") {
      dispatch({
        type: ACTIONS.UPDATE_REPLY_PIN,
        payload: {
          threadId: target.id,
          is_pin: false,
          details: null,
        },
      });
    }

    setPins((current) => current.filter((item) => item.pinId !== pin.pinId));
    setUnpinningId(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex max-h-[85vh] w-[92vw] max-w-[760px] flex-col gap-0 overflow-hidden p-0 sm:max-w-[760px]"
        onInteractOutside={(event) => {
          if (isPreviewTarget(event.target)) event.preventDefault();
        }}
        onPointerDownOutside={(event) => {
          if (isPreviewTarget(event.target)) event.preventDefault();
        }}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#E6EAEF] px-5 py-4">
          <div className="min-w-0">
            <DialogTitle className="text-lg font-semibold text-[#101828]">
              Pinned messages
            </DialogTitle>
            <p className="mt-1 truncate text-sm text-[#667085]">
              {conversationName}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-md p-1 text-[#344054] hover:bg-[#F6F7F9]"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto bg-[#F9FAFB] px-4 py-4 sm:px-5">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loading />
            </div>
          ) : failed ? (
            <div className="rounded-[10px] border border-[#E6EAEF] bg-white px-4 py-10 text-center">
              <p className="text-[15px] font-semibold text-[#101828]">
                Pinned messages could not be loaded
              </p>
            </div>
          ) : pins.length === 0 ? (
            <div className="rounded-[10px] border border-[#E6EAEF] bg-white px-4 py-12 text-center">
              <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-[#F2F4F7]">
                <Pin className="size-5 text-[#667085]" />
              </div>
              <p className="text-[15px] font-semibold text-[#101828]">
                No pinned messages
              </p>
              <p className="mx-auto mt-1 max-w-sm text-sm text-[#667085]">
                Messages pinned in {conversationName} will show up here.
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {pins.map((pin) => (
                <PinnedMessageCard
                  key={pin.pinId}
                  pin={pin}
                  caption={pinCaption(
                    pin.message,
                    pin.pinnedAt,
                    state?.user?.email
                  )}
                  unpinning={unpinningId === pin.pinId}
                  onJump={() => jumpToMessage(pin)}
                  onUnpin={() => unpin(pin)}
                  onOpenThread={openThread}
                />
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

function PinnedMessageCard({
  pin,
  caption,
  unpinning,
  onJump,
  onUnpin,
  onOpenThread,
}: {
  pin: ResolvedPin;
  caption: string;
  unpinning: boolean;
  onJump: () => void;
  onUnpin: () => void;
  onOpenThread: (message: Record<string, any>) => void;
}) {
  const message = pin.message;
  const messageText =
    typeof message?.message === "string" ? message.message : "";
  const hasMedia = Array.isArray(message?.media) && message.media.length > 0;
  const hasBody = Boolean(message) && (messageText.length > 0 || hasMedia);

  return (
    <li className="overflow-hidden rounded-[10px] border border-[#E6EAEF] bg-white">
      {message && hasBody ? (
        <div className="flex items-start gap-3 px-4 pt-4">
          <UserAvatar
            item={message}
            size="sm"
            alt={message.username || "avatar"}
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-3">
              <span className="truncate text-[15px] font-bold text-[#1D2939]">
                {message.username || message.email || "Unknown"}
              </span>
              <span className="shrink-0 text-xs text-[#98A2B3]">
                {formatStamp(message.created_at)}
              </span>
            </div>

            <div className="mt-1 min-w-0">
              <MessageItem
                item={{
                  ...message,
                  message: messageText,
                  type: message.type || "message",
                }}
              />
              {message.edited ? (
                <span className="text-[11px] text-[#98A2B3]">(edited)</span>
              ) : null}
            </div>

            {Array.isArray(message.reactions) &&
            message.reactions.length > 0 ? (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {message.reactions.map((emoji: any, index: number) => (
                  <span
                    key={emoji?.reaction_id || index}
                    className="flex h-[27px] items-center rounded-2xl border border-blue-400 bg-primary-50 px-3 text-[13px] text-blue-100"
                  >
                    <AppleEmojiText text={emoji?.reaction} />{" "}
                    {emoji?.reaction_count}
                  </span>
                ))}
              </div>
            ) : null}

            {message.message_count > 0 ? (
              <ReplyCard
                users={Array.isArray(message.messages) ? message.messages : []}
                totalReplies={message.message_count}
                lastReplyTime={message.last_reply || message.created_at}
                handleReply={() => onOpenThread(message)}
              />
            ) : null}
          </div>
        </div>
      ) : (
        <div className="px-4 pt-4">
          <p className="text-[15px] font-semibold text-[#101828]">
            Message unavailable
          </p>
          <p className="mt-1 text-sm text-[#667085]">
            This message is still pinned, but its contents could not be loaded.
          </p>
        </div>
      )}

      <div className="mt-3 flex items-center justify-between gap-3 border-t border-[#E6EAEF] bg-[#F9FAFB] px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2 text-[13px] text-[#667085]">
          <Pin className="size-3.5 shrink-0 text-[#667085]" />
          <span className="truncate">{caption}</span>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={onJump}
            disabled={!message}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[13px] font-medium text-[#344054] hover:bg-[#F6F7F9]",
              !message && "cursor-not-allowed opacity-40"
            )}
          >
            <ArrowUpRight className="size-3.5" />
            Jump
          </button>
          <button
            type="button"
            onClick={onUnpin}
            disabled={unpinning}
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[13px] font-medium text-[#344054] hover:bg-[#F6F7F9] disabled:opacity-50"
          >
            <PinOff className="size-3.5" />
            {unpinning ? "Unpinning" : "Unpin"}
          </button>
        </div>
      </div>
    </li>
  );
}

export default PinnedMessagesModal;
