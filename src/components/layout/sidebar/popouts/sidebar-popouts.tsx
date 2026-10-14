"use client";

import {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { stripHtmlTags } from "~/utils/utils";
import { DataContext } from "~/store/GlobalState";
import { PostRequest } from "~/utils/new-request";
import { showError } from "~/components/toast/sonner";
import UserAvatar, {
  type UserAvatarItem,
} from "~/components/layout/user-avatar";

type Preview = "dms" | "people";
type PreviewItem = UserAvatarItem & {
  id?: string | number;
  user_id?: string | number;
  participant_id?: string | number;
  channel_id?: string | number;
  channels_id?: string | number;
  username?: string;
  name?: string;
  full_name?: string;
  email?: string;
  role?: string;
  job_title?: string;
  online?: boolean;
  entity_type?: string;
  participants?: (UserAvatarItem & {
    full_name?: string;
    username?: string;
    online?: boolean;
  })[];
  preview_message?: string;
  preview_thread?: { message?: string }[];
};

export default function SidebarPopouts() {
  const { state } = useContext(DataContext);
  const router = useRouter();
  const [active, setActive] = useState<Preview | null>(null);
  const card = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLElement | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipFocus = useRef(false);

  const positionCard = useCallback(() => {
    const element = trigger.current;
    const previewCard = card.current;
    if (!element || !previewCard) return;

    const triggerRect = element.getBoundingClientRect();
    const iconRect = element.firstElementChild?.getBoundingClientRect();
    const railRect = element
      .closest<HTMLElement>("[data-sidebar-rail]")
      ?.getBoundingClientRect();
    const left = Math.min(
      (railRect?.right ?? triggerRect.right) + 8,
      window.innerWidth - 8
    );
    previewCard.style.left = `${left}px`;
    previewCard.style.width = `${Math.min(358, window.innerWidth - left - 8)}px`;
    const height = previewCard.getBoundingClientRect().height;
    previewCard.style.top = `${Math.min(
      Math.max(iconRect?.top ?? triggerRect.top, 8),
      Math.max(8, window.innerHeight - height - 8)
    )}px`;
  }, []);

  const cancelClose = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  }, []);
  const scheduleClose = useCallback(() => {
    cancelClose();
    timer.current = setTimeout(() => {
      setActive(null);
      timer.current = null;
    }, 125);
  }, [cancelClose]);
  const open = useCallback(
    (element: HTMLElement) => {
      const preview = element.dataset.sidebarPreview as Preview;
      if (preview !== "dms" && preview !== "people") return;
      cancelClose();
      trigger.current = element;
      setActive(preview);
    },
    [cancelClose]
  );

  useEffect(() => {
    const previewTrigger = (target: EventTarget | null) =>
      target instanceof Element
        ? (target.closest("[data-sidebar-preview]") as HTMLElement | null)
        : null;
    const inCard = (target: EventTarget | null) =>
      target instanceof Node && !!card.current?.contains(target);
    const enter = (target: EventTarget | null) => {
      const element = previewTrigger(target);
      if (element) open(element);
      else if (inCard(target)) cancelClose();
      else if (active) scheduleClose();
    };
    const leave = (target: EventTarget | null, next: EventTarget | null) => {
      if (previewTrigger(target) || inCard(target)) {
        const nextTrigger = previewTrigger(next);
        if (nextTrigger) open(nextTrigger);
        else if (inCard(next)) cancelClose();
        else scheduleClose();
      }
    };
    const pointerOver = (event: PointerEvent) => enter(event.target);
    const pointerOut = (event: PointerEvent) =>
      leave(event.target, event.relatedTarget);
    const focusIn = (event: FocusEvent) => {
      if (skipFocus.current && previewTrigger(event.target)) {
        skipFocus.current = false;
        return;
      }
      enter(event.target);
    };
    const focusOut = (event: FocusEvent) =>
      leave(event.target, event.relatedTarget);
    const keyDown = (event: KeyboardEvent) => {
      const rows = card.current?.querySelectorAll<HTMLElement>(
        "[data-sidebar-popout-row]"
      );
      if (event.key === "Tab" && rows?.length && trigger.current) {
        if (event.target === trigger.current && !event.shiftKey) {
          event.preventDefault();
          rows[0].focus();
          return;
        }
        if (event.target === rows[0] && event.shiftKey) {
          event.preventDefault();
          trigger.current.focus();
          return;
        }
        if (event.target === rows[rows.length - 1] && !event.shiftKey) {
          event.preventDefault();
          const focusable = Array.from(
            document.querySelectorAll<HTMLElement>(
              'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
            )
          ).filter(
            (element) =>
              !card.current?.contains(element) &&
              element.getClientRects().length > 0
          );
          const triggerIndex = focusable.indexOf(trigger.current);
          setActive(null);
          cancelClose();
          (focusable[triggerIndex + 1] ?? trigger.current).focus();
          return;
        }
      }
      if (event.key !== "Escape" || !active) return;
      event.preventDefault();
      setActive(null);
      cancelClose();
      skipFocus.current = !!trigger.current;
      trigger.current?.focus();
    };
    document.addEventListener("pointerover", pointerOver);
    document.addEventListener("pointerout", pointerOut);
    document.addEventListener("focusin", focusIn);
    document.addEventListener("focusout", focusOut);
    document.addEventListener("keydown", keyDown);
    return () => {
      document.removeEventListener("pointerover", pointerOver);
      document.removeEventListener("pointerout", pointerOut);
      document.removeEventListener("focusin", focusIn);
      document.removeEventListener("focusout", focusOut);
      document.removeEventListener("keydown", keyDown);
      cancelClose();
    };
  }, [active, cancelClose, open, scheduleClose]);

  useLayoutEffect(() => {
    if (!active) return;
    positionCard();
    window.addEventListener("resize", positionCard);
    window.addEventListener("scroll", positionCard, true);
    return () => {
      window.removeEventListener("resize", positionCard);
      window.removeEventListener("scroll", positionCard, true);
    };
  }, [active, positionCard]);

  const close = () => {
    cancelClose();
    setActive(null);
  };
  const openChat = async (person: PreviewItem) => {
    const orgId = localStorage.getItem("orgId");
    if (!orgId) {
      showError("Couldn't open chat. Please try again.");
      return;
    }
    try {
      const response = await PostRequest(`/organisations/${orgId}/dms`, {
        chat_type: person.entity_type,
        participant_id: person.id ?? person.user_id ?? person.participant_id,
      });
      const channelId = response?.data?.data?.channel_id;
      const participantId = response?.data?.data?.participant_id;
      if (
        (response?.status === 200 || response?.status === 201) &&
        channelId &&
        participantId
      ) {
        router.push(`/${state.orgSlug}/people/${channelId}/${participantId}`);
        close();
      } else {
        showError("Couldn't open chat. Please try again.");
      }
    } catch {
      showError("Couldn't open chat. Please try again.");
    }
  };

  if (!active || typeof document === "undefined") return null;
  const dms: PreviewItem[] = Array.isArray(state.dms) ? state.dms : [];
  const people: PreviewItem[] = Array.isArray(state.orgMembers)
    ? state.orgMembers
    : [];
  const items = (active === "dms" ? dms : people).slice(0, 4);
  return createPortal(
    <div
      ref={card}
      data-sidebar-popout
      className="fixed left-0 top-0 z-[60] w-[358px] max-w-[calc(100vw-16px)] overflow-y-auto rounded-xl bg-white p-5 text-[#182230] shadow-[0_12px_32px_rgba(0,0,0,0.22)] dark:border dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
      style={{ maxHeight: "calc(100dvh - 16px)" }}
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[15px] font-semibold">
          {active === "dms" ? "Direct messages" : "People"}
        </h2>
        {active === "dms" && (
          <span className="text-xs text-[#5959A8] dark:text-zinc-400">
            Recent
          </span>
        )}
      </div>
      <div className="flex flex-col gap-3">
        {items.length
          ? items.map((item, index) => {
              const name =
                active === "dms"
                  ? item.username ||
                    item.participants?.[0]?.full_name ||
                    item.participants?.[0]?.username ||
                    "Direct message"
                  : item.name ||
                    item.full_name ||
                    item.username ||
                    item.email ||
                    "Organisation member";
              const description =
                active === "dms"
                  ? stripHtmlTags(
                      String(
                        item.preview_message ||
                          item.preview_thread?.[0]?.message ||
                          "No recent message"
                      )
                    )
                  : item.role || item.job_title || "Organisation member";
              const contents = (
                <>
                  <UserAvatar
                    item={item}
                    size="sm"
                    alt={name}
                    className="size-9 rounded-[9px]"
                    imageClassName="rounded-[9px]"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-semibold">
                      {name}
                    </span>
                    <span className="block truncate text-xs text-[#5959A8] dark:text-zinc-400">
                      {description}
                    </span>
                  </span>
                  {active === "people" && (
                    <span className="shrink-0 text-xs text-[#5959A8] dark:text-zinc-400">
                      {item.online ? "Active" : "Away"}
                    </span>
                  )}
                </>
              );
              const key =
                item.channel_id ??
                item.channels_id ??
                item.id ??
                item.user_id ??
                `${name}-${index}`;
              return active === "dms" ? (
                <Link
                  key={key}
                  data-sidebar-popout-row
                  href={
                    item.channel_id || item.channels_id
                      ? `/${state.orgSlug}/dm/${item.channel_id ?? item.channels_id}/dms`
                      : `/${state.orgSlug}/dm`
                  }
                  onClick={close}
                  aria-label={`${name}: ${description}`}
                  className="flex min-w-0 items-center gap-3 dark:hover:bg-zinc-800"
                >
                  {contents}
                </Link>
              ) : (
                <button
                  key={key}
                  data-sidebar-popout-row
                  type="button"
                  onClick={() => void openChat(item)}
                  aria-label={`${name}: ${description}`}
                  className="flex min-w-0 cursor-pointer items-center gap-3 text-left dark:hover:bg-zinc-800"
                >
                  {contents}
                </button>
              );
            })
          : (active === "dms" || Array.isArray(state.orgMembers)) && (
              <p className="text-sm text-[#667085] dark:text-zinc-400">
                {active === "dms"
                  ? "No recent conversations"
                  : "No people to show"}
              </p>
            )}
      </div>
    </div>,
    document.body
  );
}
