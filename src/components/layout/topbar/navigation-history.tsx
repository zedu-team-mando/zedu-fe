"use client";

import { useContext, useEffect, useReducer, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Hash,
  Lock,
  MessageSquare,
} from "lucide-react";
import { DataContext } from "~/store/GlobalState";
import { GetRequest } from "~/utils/new-request";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

type Entry = {
  path: string;
  name: string;
  kind: "channel" | "chat";
  private?: boolean;
};
type History = { entries: Entry[]; cursor: number; recent: Entry[] };
type Action =
  | { type: "visit"; entry: Entry; cursor?: number }
  | { type: "name"; entry: Entry };
const empty: History = { entries: [], cursor: -1, recent: [] };
const LIMIT = 20;

function conversation(
  path: string,
  org: string
): {
  id: string;
  kind: Entry["kind"];
  participantId?: string;
} | null {
  const parts = path.split("/");
  if (parts[1] !== org) return null;
  const section = parts[2];
  const scoped = section === "home" || section === "later";
  const [area, id, person, suffix] = parts.slice(scoped ? 3 : 2);
  const length = parts.length - (scoped ? 3 : 2);
  if (!id) return null;
  if (scoped && area === "channels" && length === 2)
    return { id, kind: "channel" };
  if (area === "people" && section === "home") {
    if (length === 3 && person === "dms") return { id, kind: "chat" };
    if (length === 4 && person && suffix === "dm")
      return { id, kind: "chat", participantId: person };
  }
  if (
    (area === "dm" || (!scoped && area === "people")) &&
    length === 3 &&
    person
  )
    return {
      id,
      kind: "chat",
      participantId: person === "dms" ? undefined : person,
    };
  if (section === "later" && area === "dms" && length === 2)
    return { id, kind: "chat" };
  return null;
}

function reducer(history: History, action: Action): History {
  const sameConversation = (item: Entry) =>
    item.kind === action.entry.kind &&
    conversation(item.path, item.path.split("/")[1])?.id ===
      conversation(action.entry.path, action.entry.path.split("/")[1])?.id;
  const entry =
    action.type === "visit"
      ? {
          ...history.recent.find(sameConversation),
          ...action.entry,
          name:
            history.recent.find(sameConversation)?.name || action.entry.name,
          private: history.recent.find(sameConversation)?.private,
        }
      : action.entry;
  if (action.type === "name") {
    const update = (item: Entry) =>
      sameConversation(item) ? { ...entry, path: item.path } : item;
    return {
      ...history,
      entries: history.entries.map(update),
      recent: history.recent.map(update),
    };
  }
  let entries = history.entries;
  let cursor = history.cursor;
  if (
    action.cursor !== undefined &&
    entries[action.cursor]?.path === entry.path
  ) {
    cursor = action.cursor;
  } else if (entries[cursor]?.path !== entry.path) {
    entries = [...entries.slice(0, cursor + 1), entry].slice(-100);
    cursor = entries.length - 1;
  }
  return {
    entries,
    cursor,
    recent: [
      entry,
      ...history.recent.filter((item) => !sameConversation(item)),
    ].slice(0, LIMIT),
  };
}

function HistoryControls({
  storageKey,
  org,
}: {
  storageKey: string;
  org: string;
}) {
  const { state } = useContext(DataContext);
  const pathname = usePathname();
  const router = useRouter();
  const [historyOpen, setHistoryOpen] = useState(false);
  const pending = useRef<{ path: string; cursor?: number } | null>(null);
  const [history, dispatch] = useReducer(reducer, empty, () => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || "null");
      const valid = (entry: Entry) =>
        entry &&
        typeof entry.path === "string" &&
        typeof entry.name === "string" &&
        conversation(entry.path, org)?.kind === entry.kind;
      if (
        Array.isArray(saved?.entries) &&
        saved.entries.length <= 100 &&
        saved.entries.every(valid) &&
        Array.isArray(saved.recent) &&
        saved.recent.length <= LIMIT &&
        saved.recent.every(valid) &&
        Number.isInteger(saved.cursor) &&
        saved.cursor >= -1 &&
        saved.cursor < saved.entries.length
      ) {
        return saved as History;
      }
    } catch {
      /* Storage may be unavailable or contain invalid data. */
    }
    return empty;
  });
  const route = conversation(pathname, org);
  const kind = route?.kind;
  const id = route?.id;
  const participantId = route?.participantId;
  const current = history.entries[history.cursor]?.path === pathname;

  useEffect(() => {
    if (!kind) {
      pending.current = null;
      return;
    }
    const entry: Entry = {
      path: pathname,
      kind,
      name: kind === "channel" ? "Channel" : "Conversation",
    };
    const target = pending.current;
    pending.current = null;
    dispatch({
      type: "visit",
      entry,
      cursor: target?.path === pathname ? target.cursor : undefined,
    });
    // Record route changes; name updates must not create new visits.
  }, [pathname, kind]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(history));
    } catch {
      /* Keep in-memory navigation available. */
    }
  }, [history, storageKey]);

  const details = state.channelDetails;
  useEffect(() => {
    if (
      kind !== "channel" ||
      String(details?.channels_id ?? details?.id) !== id ||
      !details?.name
    )
      return;
    dispatch({
      type: "name",
      entry: {
        path: pathname,
        kind,
        name: details.name,
        private: Boolean(details.is_private),
      },
    });
  }, [pathname, kind, id, details]);

  const orgId = state.orgId;
  useEffect(() => {
    if (kind !== "chat" || !id || !orgId) return;
    let cancelled = false;
    async function resolveName() {
      try {
        const res = await GetRequest(
          `/organisations/${orgId}/dms/participants/${id}`
        );
        if (cancelled || (res?.status !== 200 && res?.status !== 201)) return;
        const people = res.data?.data?.participants;
        if (!Array.isArray(people)) return;
        const names = people
          .filter(
            (person: { user_id?: string; id?: string }) =>
              !participantId ||
              String(person.user_id ?? person.id) === participantId
          )
          .map((person: { username?: string }) => person.username)
          .filter(Boolean)
          .join(", ");
        if (names)
          dispatch({
            type: "name",
            entry: { path: pathname, kind: "chat", name: names },
          });
      } catch {
        /* A failed lookup must not prevent navigation. */
      }
    }
    void resolveName();
    return () => {
      cancelled = true;
    };
  }, [pathname, kind, id, orgId, participantId]);

  function navigate(entry: Entry | undefined, cursor?: number) {
    if (!entry || pending.current || entry.path === pathname) return;
    pending.current = { path: entry.path, cursor };
    router.push(entry.path);
  }
  // Away from a conversation, Back returns to the last conversation visited.
  const backIndex = current ? history.cursor - 1 : history.cursor;
  const back = history.entries[backIndex];
  const forward = current ? history.entries[history.cursor + 1] : undefined;
  const buttonClass =
    "h-8 w-8 shrink-0 text-white hover:bg-white/15 hover:text-white";

  return (
    <div
      className="flex shrink-0 items-center gap-0.5"
      aria-label="Conversation navigation"
    >
      <Button
        variant="ghost"
        size="icon"
        className={buttonClass}
        aria-label="Back in history"
        title="Back in history"
        disabled={!back}
        onClick={() => navigate(back, backIndex)}
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={buttonClass}
        aria-label="Forward in history"
        title="Forward in history"
        disabled={!forward}
        onClick={() => navigate(forward, history.cursor + 1)}
      >
        <ArrowRight className="h-4 w-4" />
      </Button>
      <DropdownMenu
        open={historyOpen}
        onOpenChange={(open) => {
          // Radix also requests dismissal on window blur; keep History visible.
          if (open || document.hasFocus()) setHistoryOpen(open);
        }}
      >
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={buttonClass}
            aria-label="History"
            title="History"
          >
            <Clock className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          onEscapeKeyDown={() => setHistoryOpen(false)}
          onPointerDownOutside={() => setHistoryOpen(false)}
          className="max-h-80 w-72 max-w-[calc(100vw-2rem)] overflow-y-auto"
        >
          <DropdownMenuLabel className="cursor-default select-none font-normal text-muted-foreground">
            Recent
          </DropdownMenuLabel>
          {history.recent.length === 0 && (
            <p className="px-2 py-3 text-sm text-muted-foreground">
              Visited channels and chats will appear here.
            </p>
          )}
          {history.recent.map((entry) => {
            const Icon =
              entry.kind === "chat"
                ? MessageSquare
                : entry.private
                  ? Lock
                  : Hash;
            return (
              <DropdownMenuItem
                key={entry.path}
                className="cursor-pointer hover:bg-blue-500 hover:text-white focus:bg-blue-500 focus:text-white"
                onSelect={() => {
                  setHistoryOpen(false);
                  navigate(entry);
                }}
                aria-current={entry.path === pathname ? "page" : undefined}
              >
                <Icon className="mr-2 h-4 w-4 shrink-0" />
                <span className="truncate" title={entry.name}>
                  {entry.name}
                </span>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default function NavigationHistory() {
  const { state } = useContext(DataContext);
  const userId = state.user?.user_id ?? state.user?.id;
  const org = state.orgSlug;
  if (!userId || !org) return null;
  const storageKey = `zedu-navigation-history:${userId}:${org}`;
  return <HistoryControls key={storageKey} storageKey={storageKey} org={org} />;
}
