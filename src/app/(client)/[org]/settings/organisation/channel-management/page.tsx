"use client";

import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useDebounce } from "use-debounce";
import {
  Archive,
  ArrowUpRight,
  Hash,
  Layers,
  Lock,
  MessageSquareOff,
  Search,
  Shield,
  Users,
  Unlock,
} from "lucide-react";
import Link from "next/link";
import SettingsLabel from "../../components/settings-label";
import { DataContext } from "~/store/GlobalState";
import { GetRequest, PatchRequest, PutRequest } from "~/utils/new-request";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Switch } from "~/components/ui/switch";
import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";
import { useRBAC } from "~/hooks/useRBAC";
import Loading from "~/components/ui/loading";
import { showSuccess } from "~/components/toast/sonner";
import images from "~/assets/images";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

const CHANNEL_USERS_PAGE_SIZE = 20;

type ChannelListItem = {
  channels_id?: string;
  id?: string;
  name: string;
  description?: string;
  topic?: string;
  is_private?: boolean;
  archived?: boolean;
  isArchived?: boolean;
  is_restricted?: boolean;
  restricted?: boolean;
  members_count?: number;
  user_count?: number;
  owner_id?: string;
  owner_name?: string;
  created_at?: string;
  thread_count?: number;
  users?: any[];
};

type FilterKey = "all" | "restricted" | "private" | "public" | "archived";

function resolveChannelId(channel: ChannelListItem) {
  return channel.channels_id || channel.id || "";
}

function isArchivedChannel(channel?: ChannelListItem) {
  return channel?.archived === true || channel?.isArchived === true;
}

function memberKey(member: any) {
  return String(
    member?.id || member?.profile?.user_id || member?.user_id || ""
  );
}

function mergeChannelMembers(current: any[], incoming: any[]) {
  const seen = new Set(current.map(memberKey));
  const next = [...current];
  for (const member of incoming) {
    const id = memberKey(member);
    if (!id || seen.has(id)) continue;
    seen.add(id);
    next.push(member);
  }
  return next;
}

const OrganisationChannelManagementPage = () => {
  const { state } = useContext(DataContext);
  const { orgSlug } = state;
  const { hasPermission, status: rbacStatus } = useRBAC();
  const canManageChannels = hasPermission("manage:channels");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(
    null
  );
  const [channels, setChannels] = useState<ChannelListItem[]>([]);
  const [channelsLoading, setChannelsLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<ChannelListItem | null>(
    null
  );
  const [memberSearch, setMemberSearch] = useState("");
  const [debouncedMemberSearch] = useDebounce(memberSearch, 1500);
  const [membersPage, setMembersPage] = useState(1);
  const [membersHasMore, setMembersHasMore] = useState(false);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersLoadingMore, setMembersLoadingMore] = useState(false);
  const membersChannelRef = useRef<string | null>(null);
  const searchRequestRef = useRef(0);
  const memberQueryRef = useRef("");
  const membersScrollRef = useRef<HTMLDivElement>(null);
  const membersLoadingMoreRef = useRef(false);
  const loadMoreStateRef = useRef({
    selectedChannelId: null as string | null,
    membersLoading: false,
    membersHasMore: false,
    membersPage: 1,
    memberSearch: "",
    debouncedMemberSearch: "",
  });
  const baseMembersRef = useRef<{
    members: any[];
    page: number;
    hasMore: boolean;
  }>({ members: [], page: 1, hasMore: false });
  const [togglingAll, setTogglingAll] = useState(false);
  const [togglingUserId, setTogglingUserId] = useState<string | null>(null);
  const [archiving, setArchiving] = useState(false);
  const [restrictOverride, setRestrictOverride] = useState<boolean | null>(
    null
  );
  const [members, setMembers] = useState<any[]>([]);

  const loadChannels = useCallback(async () => {
    const orgId = localStorage.getItem("orgId") || "";
    if (!orgId) return;
    setChannelsLoading(true);
    try {
      const res = await GetRequest(
        `/organisations/${orgId}/channels?limit=200`
      );
      if (res?.status === 200 || res?.status === 201) {
        setChannels(res?.data?.data || []);
      }
    } finally {
      setChannelsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (canManageChannels) loadChannels();
  }, [canManageChannels, loadChannels]);

  const loadChannelDetail = useCallback(async (channelId: string) => {
    setDetailLoading(true);
    try {
      const res = await GetRequest(`/channels/${channelId}`);
      if (res?.status === 200 || res?.status === 201) {
        setSelectedDetail(res?.data?.data || null);
      }
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!selectedChannelId) {
      setSelectedDetail(null);
      setMembers([]);
      setMembersHasMore(false);
      return;
    }
    setRestrictOverride(null);
    loadChannelDetail(selectedChannelId);
  }, [selectedChannelId, loadChannelDetail]);

  useEffect(() => {
    setMemberSearch("");
    setMembersPage(1);
  }, [selectedChannelId]);

  const restoreBaseMembers = () => {
    const base = baseMembersRef.current;
    setMembers(base.members);
    setMembersPage(base.page);
    setMembersHasMore(base.hasMore);
    setMembersLoading(false);
    setMembersLoadingMore(false);
  };

  const fetchChannelUsers = useCallback(
    async (
      channelId: string,
      page: number,
      search: string,
      append: boolean
    ) => {
      const trimmed = search.trim();
      const searchRequestId = trimmed ? ++searchRequestRef.current : 0;
      if (append) setMembersLoadingMore(true);
      else setMembersLoading(true);

      const params = new URLSearchParams({
        page: String(page),
        limit: String(CHANNEL_USERS_PAGE_SIZE),
      });
      if (trimmed) params.set("search", trimmed);

      const res = await GetRequest(
        `/channels/${channelId}/users?${params.toString()}`
      );
      if (trimmed && searchRequestId !== searchRequestRef.current) return;

      if (res?.status === 200 || res?.status === 201) {
        const incoming = res?.data?.data || [];
        const pagination = res?.data?.pagination;
        const currentPage = Number(pagination?.current_page) || page;
        const totalPages = Number(pagination?.total_pages) || 1;
        const hasMore = currentPage < totalPages && incoming.length > 0;

        if (!trimmed) {
          const baseMembers = append
            ? mergeChannelMembers(baseMembersRef.current.members, incoming)
            : incoming;
          baseMembersRef.current = {
            members: baseMembers,
            page: currentPage,
            hasMore,
          };
          if (!memberQueryRef.current) {
            setMembers(baseMembers);
            setMembersPage(currentPage);
            setMembersHasMore(hasMore);
          }
        } else {
          setMembers((prev) =>
            append ? mergeChannelMembers(prev, incoming) : incoming
          );
          setMembersPage(currentPage);
          setMembersHasMore(hasMore);
        }
      } else if (!append && (!trimmed ? !memberQueryRef.current : true)) {
        setMembers([]);
        setMembersHasMore(false);
      }

      if (!trimmed ? !memberQueryRef.current : true) {
        setMembersLoading(false);
        setMembersLoadingMore(false);
      }
    },
    []
  );

  const handleMemberSearch = (value: string) => {
    setMemberSearch(value);
    if (value.trim() || !memberQueryRef.current) return;
    memberQueryRef.current = "";
    searchRequestRef.current += 1;
    restoreBaseMembers();
  };

  useEffect(() => {
    if (!selectedChannelId) return;

    const channelChanged = membersChannelRef.current !== selectedChannelId;
    if (channelChanged) {
      membersChannelRef.current = selectedChannelId;
      memberQueryRef.current = "";
      baseMembersRef.current = { members: [], page: 1, hasMore: false };
      fetchChannelUsers(selectedChannelId, 1, "", false);
      return;
    }

    if (memberSearch.trim() !== debouncedMemberSearch.trim()) return;

    const query = debouncedMemberSearch.trim();
    if (!query) return;

    memberQueryRef.current = query;
    fetchChannelUsers(selectedChannelId, 1, query, false);
  }, [
    selectedChannelId,
    debouncedMemberSearch,
    memberSearch,
    fetchChannelUsers,
  ]);

  loadMoreStateRef.current = {
    selectedChannelId,
    membersLoading,
    membersHasMore,
    membersPage,
    memberSearch,
    debouncedMemberSearch,
  };

  const loadMoreMembers = useCallback(() => {
    const state = loadMoreStateRef.current;
    if (
      membersLoadingMoreRef.current ||
      !state.selectedChannelId ||
      state.membersLoading ||
      !state.membersHasMore ||
      state.memberSearch.trim() !== state.debouncedMemberSearch.trim()
    ) {
      return;
    }

    membersLoadingMoreRef.current = true;
    void fetchChannelUsers(
      state.selectedChannelId,
      state.membersPage + 1,
      state.debouncedMemberSearch,
      true
    ).finally(() => {
      membersLoadingMoreRef.current = false;
    });
  }, [fetchChannelUsers]);

  const onMembersScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const el = event.currentTarget;
    if (el.scrollHeight - el.scrollTop - el.clientHeight > 160) return;
    loadMoreMembers();
  };

  useEffect(() => {
    const el = membersScrollRef.current;
    if (!el || membersLoading || !membersHasMore) return;
    if (el.scrollHeight - el.scrollTop - el.clientHeight > 160) return;
    loadMoreMembers();
  }, [
    members.length,
    membersHasMore,
    membersLoading,
    membersLoadingMore,
    loadMoreMembers,
  ]);

  const filteredChannels = useMemo(() => {
    const q = search.trim().toLowerCase();
    return channels.filter((c) => {
      const matchesSearch = !q || c.name?.toLowerCase().includes(q);
      if (!matchesSearch) return false;
      if (filter === "restricted") return c.is_restricted === true;
      if (filter === "private") return c.is_private === true;
      if (filter === "public") return c.is_private !== true;
      if (filter === "archived") return isArchivedChannel(c);
      return true;
    });
  }, [channels, search, filter]);

  useEffect(() => {
    if (selectedChannelId) return;
    const first = filteredChannels[0];
    if (first) setSelectedChannelId(resolveChannelId(first));
  }, [filteredChannels, selectedChannelId]);

  const stats = useMemo(() => {
    const total = channels.length;
    const restricted = channels.filter((c) => c.is_restricted === true).length;
    const privateCount = channels.filter((c) => c.is_private).length;
    const archived = channels.filter((c) => isArchivedChannel(c)).length;
    return { total, restricted, privateCount, archived };
  }, [channels]);

  const syncChannelInList = (
    channelId: string,
    patch: Partial<ChannelListItem>
  ) => {
    setChannels((prev) =>
      prev.map((c) =>
        resolveChannelId(c) === channelId ? { ...c, ...patch } : c
      )
    );
    setSelectedDetail((prev) =>
      prev && resolveChannelId(prev) === channelId
        ? { ...prev, ...patch }
        : prev
    );
  };

  const handleToggleRestrictAll = async (restricted: boolean) => {
    if (!selectedChannelId) return;
    setTogglingAll(true);
    setRestrictOverride(restricted);
    syncChannelInList(selectedChannelId, {
      is_restricted: restricted,
    });

    const res = await PatchRequest(
      `/channels/${selectedChannelId}/users/restrict-all`,
      { restricted }
    );
    if (res?.status === 200 || res?.status === 201) {
      showSuccess(
        restricted
          ? "Channel posting restricted for all members"
          : "Channel posting opened for all members"
      );
      const detail = await GetRequest(`/channels/${selectedChannelId}`);
      if (detail?.status === 200 || detail?.status === 201) {
        const data = detail?.data?.data;
        setSelectedDetail(data || null);
        setRestrictOverride(null);
        if (data) {
          syncChannelInList(selectedChannelId, {
            is_restricted: data.is_restricted === true,
          });
        }
      }
      await loadChannels();
    } else {
      setRestrictOverride(null);
      await loadChannelDetail(selectedChannelId);
    }
    setTogglingAll(false);
  };

  const applyMemberRestriction = (userId: string, restricted: boolean) => {
    setMembers((prev) =>
      prev.map((member) => {
        const id = member?.profile?.user_id || member?.user_id;
        if (String(id) !== String(userId)) return member;
        return { ...member, restricted, is_restricted: restricted };
      })
    );
  };

  const handleToggleUser = async (userId: string, restricted: boolean) => {
    if (!selectedChannelId || !userId) return;
    setTogglingUserId(userId);
    applyMemberRestriction(userId, restricted);
    const res = await PatchRequest(
      `/channels/${selectedChannelId}/users/${userId}/restrict`,
      { restricted }
    );
    if (res?.status === 200 || res?.status === 201) {
      showSuccess(
        restricted ? "User can no longer post" : "User is allowed to post"
      );
    } else {
      applyMemberRestriction(userId, !restricted);
    }
    setTogglingUserId(null);
  };

  const handleArchiveToggle = async () => {
    if (!selectedChannelId || !selectedDetail) return;
    const nextArchived = !isArchivedChannel(selectedDetail);
    setArchiving(true);
    const res = await PutRequest(`/channels/${selectedChannelId}/archive`, {
      archived: nextArchived,
    });
    if (res?.status === 200 || res?.status === 201) {
      showSuccess(nextArchived ? "Channel archived" : "Channel unarchived");
      syncChannelInList(selectedChannelId, {
        archived: nextArchived,
        isArchived: nextArchived,
      });
    }
    setArchiving(false);
  };

  if (rbacStatus === "loading") {
    return (
      <div className="flex justify-center py-24">
        <Loading color="#5757CD" height="36px" width="36px" />
      </div>
    );
  }

  if (!canManageChannels) {
    return (
      <div>
        <SettingsLabel />
        <div className="p-4 lg:px-8">
          <div className="rounded-2xl border border-[#E6EAEF] dark:border-white/10 bg-[#F9FAFB] dark:bg-[#222529] p-10 text-center max-w-lg">
            <Layers className="mx-auto h-10 w-10 text-[#667085] mb-4" />
            <h2 className="text-lg font-bold text-[#101828] dark:text-zinc-100">
              Channel Management unavailable
            </h2>
            <p className="text-sm text-[#667085] dark:text-zinc-400 mt-2">
              You don&apos;t have permission to manage channels. Ask an
              administrator to grant the &quot;Manage channels&quot; permission.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const channelRestricted =
    restrictOverride ?? selectedDetail?.is_restricted === true;
  const selectedFromList = channels.find(
    (c) => resolveChannelId(c) === selectedChannelId
  );

  return (
    <div className="pb-16">
      <SettingsLabel />
      <div className="p-4 lg:px-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-[#101828] dark:text-zinc-100">
              Channel Management
            </h1>
            <p className="text-sm text-[#667085] dark:text-zinc-400 mt-1 max-w-2xl">
              Control posting permissions, member access, and channel lifecycle
              across your organisation — similar to Slack workspace channel
              admin tools.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
          {[
            {
              label: "Total channels",
              value: stats.total,
              icon: Hash,
              tone: "bg-[#EEF4FF] text-[#5757CD]",
            },
            {
              label: "Posting restricted",
              value: stats.restricted,
              icon: MessageSquareOff,
              tone: "bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300",
            },
            {
              label: "Private",
              value: stats.privateCount,
              icon: Lock,
              tone: "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
            },
            {
              label: "Archived",
              value: stats.archived,
              icon: Archive,
              tone: "bg-zinc-100 text-zinc-600 dark:bg-white/10 dark:text-zinc-300",
            },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-2xl border border-[#E6EAEF] dark:border-white/10 bg-white dark:bg-[#222529] p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-[#667085] dark:text-zinc-400">
                  {card.label}
                </p>
                <span
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg",
                    card.tone
                  )}
                >
                  <card.icon className="h-4 w-4" />
                </span>
              </div>
              <p className="mt-3 text-2xl font-black text-[#101828] dark:text-zinc-100">
                {card.value}
              </p>
            </div>
          ))}
        </div>

        <div className="flex flex-col xl:flex-row gap-6 min-h-[720px]">
          <aside className="xl:w-[340px] shrink-0 flex flex-col min-h-[640px] rounded-2xl border border-[#E6EAEF] dark:border-white/10 bg-white dark:bg-[#222529] shadow-sm overflow-hidden">
            <div className="p-4 border-b border-[#E6EAEF] dark:border-white/10 bg-[#F9FAFB] dark:bg-[#1A1D21] shrink-0 space-y-3">
              <h2 className="text-sm font-bold text-[#101828] dark:text-zinc-100">
                Channels
              </h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#667085]" />
                <Input
                  placeholder="Search channels..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 border-[#D0D5DD] dark:border-white/15 bg-white dark:bg-[#222529]"
                />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(
                  [
                    ["all", "All"],
                    ["restricted", "Restricted"],
                    ["public", "Public"],
                    ["private", "Private"],
                    ["archived", "Archived"],
                  ] as const
                ).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setFilter(key)}
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors",
                      filter === key
                        ? "bg-[#5757CD] text-white"
                        : "bg-white dark:bg-white/5 text-[#667085] dark:text-zinc-400 border border-[#E6EAEF] dark:border-white/10"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto p-2">
              {channelsLoading ? (
                <div className="flex justify-center py-12">
                  <Loading color="#5757CD" height="24px" width="24px" />
                </div>
              ) : filteredChannels.length === 0 ? (
                <p className="text-sm text-[#667085] text-center py-8 px-4">
                  No channels found.
                </p>
              ) : (
                <ul className="space-y-1">
                  {filteredChannels.map((channel) => {
                    const id = resolveChannelId(channel);
                    const selected = id === selectedChannelId;
                    const restricted = channel.is_restricted === true;
                    return (
                      <li key={id}>
                        <button
                          type="button"
                          onClick={() => setSelectedChannelId(id)}
                          className={cn(
                            "w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all",
                            selected
                              ? "bg-[#5757CD] text-white shadow-md"
                              : "hover:bg-[#F2F4F7] dark:hover:bg-white/5 text-[#344054] dark:text-zinc-200"
                          )}
                        >
                          <span
                            className={cn(
                              "flex h-8 w-8 items-center justify-center rounded-lg shrink-0",
                              selected
                                ? "bg-white/20"
                                : "bg-[#EEF4FF] dark:bg-[#5757CD]/20 text-[#5757CD]"
                            )}
                          >
                            {channel.is_private ? (
                              <Lock className="h-4 w-4" />
                            ) : (
                              <Hash className="h-4 w-4" />
                            )}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold capitalize">
                              {channel.name}
                            </span>
                            <span
                              className={cn(
                                "block text-[11px] mt-0.5",
                                selected
                                  ? "text-white/80"
                                  : "text-[#98A2B3] dark:text-zinc-500"
                              )}
                            >
                              {channel.members_count ?? channel.user_count ?? 0}{" "}
                              members
                              {restricted ? " · Restricted" : ""}
                              {isArchivedChannel(channel) ? " · Archived" : ""}
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </aside>

          <main className="flex-1 min-w-0">
            {!selectedChannelId ? (
              <div className="h-full min-h-[400px] flex items-center justify-center rounded-2xl border border-dashed border-[#D0D5DD] dark:border-white/15 bg-[#F9FAFB] dark:bg-[#1A1D21]">
                <p className="text-sm text-[#667085] dark:text-zinc-400">
                  Select a channel to manage posting permissions.
                </p>
              </div>
            ) : detailLoading && !selectedDetail ? (
              <div className="h-full min-h-[400px] flex items-center justify-center rounded-2xl border border-[#E6EAEF] dark:border-white/10 bg-white dark:bg-[#222529]">
                <Loading color="#5757CD" height="32px" width="32px" />
              </div>
            ) : (
              <div className="rounded-2xl border border-[#E6EAEF] dark:border-white/10 bg-white dark:bg-[#222529] shadow-sm overflow-hidden">
                <div className="border-b border-[#E6EAEF] dark:border-white/10 bg-gradient-to-r from-[#F8F7FF] via-white to-[#F0F9FF] dark:from-[#1A1D21] dark:via-[#222529] dark:to-[#1A1D21] p-5 lg:p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        {channelRestricted ? (
                          <Badge className="bg-rose-50 text-rose-700 hover:bg-rose-50 border-0 dark:bg-rose-500/15 dark:text-rose-300">
                            Posting restricted
                          </Badge>
                        ) : (
                          <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-0 dark:bg-emerald-500/15 dark:text-emerald-300">
                            Open posting
                          </Badge>
                        )}
                        {selectedDetail?.is_private ? (
                          <Badge
                            variant="outline"
                            className="dark:border-white/15"
                          >
                            Private
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="dark:border-white/15"
                          >
                            Public
                          </Badge>
                        )}
                        {isArchivedChannel(selectedDetail || undefined) && (
                          <Badge variant="secondary">Archived</Badge>
                        )}
                      </div>
                      <h2 className="text-2xl font-black text-[#101828] dark:text-zinc-100 flex items-center gap-2">
                        {selectedDetail?.is_private ? (
                          <Lock className="h-5 w-5 shrink-0" />
                        ) : (
                          <Hash className="h-5 w-5 shrink-0" />
                        )}
                        <span className="truncate capitalize">
                          {selectedDetail?.name || selectedFromList?.name}
                        </span>
                      </h2>
                      <p className="mt-1 text-sm text-[#667085] dark:text-zinc-400 line-clamp-2">
                        {selectedDetail?.description ||
                          selectedDetail?.topic ||
                          "No description set for this channel."}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-4 text-xs text-[#667085] dark:text-zinc-400">
                        <span className="inline-flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5" />
                          {selectedDetail?.user_count ?? 0} members
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Shield className="h-3.5 w-3.5" />
                          Owner: {selectedDetail?.owner_name || "—"}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 shrink-0">
                      <Button variant="outline" size="sm" asChild>
                        <Link
                          href={`/${orgSlug}/home/channels/${selectedChannelId}`}
                        >
                          Open channel
                          <ArrowUpRight className="h-4 w-4 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>

                <Tabs defaultValue="posting" className="w-full">
                  <div className="px-5 lg:px-6 border-b border-[#E6EAEF] dark:border-white/10 overflow-x-auto">
                    <TabsList className="h-auto bg-transparent p-0 gap-6 justify-start">
                      {[
                        ["posting", "Posting permissions"],
                        ["members", "Members"],
                        ["overview", "Overview"],
                        ["lifecycle", "Lifecycle"],
                      ].map(([value, label]) => (
                        <TabsTrigger
                          key={value}
                          value={value}
                          className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#5757CD] data-[state=active]:shadow-none bg-transparent px-0 py-3 text-sm font-semibold"
                        >
                          {label}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </div>

                  <TabsContent
                    value="posting"
                    className="p-5 lg:p-6 m-0 space-y-6"
                  >
                    <div className="rounded-2xl border border-[#E6EAEF] dark:border-white/10 p-5 bg-[#F9FAFB] dark:bg-[#1A1D21]">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white dark:bg-[#222529] border border-[#E6EAEF] dark:border-white/10 shrink-0">
                            {channelRestricted ? (
                              <Lock className="h-5 w-5 text-rose-500" />
                            ) : (
                              <Unlock className="h-5 w-5 text-emerald-600" />
                            )}
                          </div>
                          <div>
                            <h3 className="text-base font-bold text-[#101828] dark:text-zinc-100">
                              Restrict chats for everyone
                            </h3>
                            <p className="text-sm text-[#667085] dark:text-zinc-400 mt-0.5 max-w-xl">
                              When enabled, only the channel owner, admins, and
                              members you explicitly allow can send top-level
                              messages. Everyone else sees: &quot;Only admins
                              can send messages in this channel.&quot;
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          {togglingAll && (
                            <Loading
                              color="#5757CD"
                              height="18px"
                              width="18px"
                            />
                          )}
                          <Switch
                            checked={channelRestricted}
                            disabled={togglingAll}
                            onCheckedChange={(checked) =>
                              handleToggleRestrictAll(checked)
                            }
                            className="data-[state=checked]:bg-[#5757CD] data-[state=unchecked]:bg-[#D0D5DD] dark:data-[state=unchecked]:bg-zinc-600"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-3">
                      <div className="rounded-xl border border-[#E6EAEF] dark:border-white/10 p-4">
                        <p className="text-xs text-[#667085] dark:text-zinc-400">
                          Mode
                        </p>
                        <p className="text-sm font-bold text-[#101828] dark:text-zinc-100 mt-2">
                          {channelRestricted ? "Allowlist" : "Open + blocklist"}
                        </p>
                      </div>
                    </div>

                    <div>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                        <div>
                          <h3 className="text-sm font-bold text-[#101828] dark:text-zinc-100">
                            Per-member posting access
                          </h3>
                          <p className="text-xs text-[#667085] dark:text-zinc-400 mt-0.5">
                            {channelRestricted
                              ? "Allow specific people to post while the channel is locked."
                              : "Restrict specific people from posting without locking the whole channel."}
                          </p>
                        </div>
                        <div className="relative w-full sm:w-64">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#667085]" />
                          <Input
                            placeholder="Find a member..."
                            value={memberSearch}
                            onChange={(e) => handleMemberSearch(e.target.value)}
                            className="pl-8 pr-8 h-9 text-sm"
                          />
                          {membersLoading && memberSearch.trim() && (
                            <span className="absolute right-3 top-1/2 -translate-y-1/2">
                              <Loading
                                color="#5757CD"
                                height="16px"
                                width="16px"
                              />
                            </span>
                          )}
                        </div>
                      </div>

                      <div
                        ref={membersScrollRef}
                        onScroll={onMembersScroll}
                        className="rounded-xl border border-[#E6EAEF] dark:border-white/10 divide-y divide-[#E6EAEF] dark:divide-white/10 h-[70vh] min-h-[560px] overflow-y-auto"
                      >
                        {membersLoading ? (
                          <div className="flex justify-center py-10">
                            <Loading color="#5757CD" />
                          </div>
                        ) : members.length === 0 ? (
                          <p className="text-sm text-[#667085] dark:text-zinc-400 text-center py-10">
                            No members found.
                          </p>
                        ) : (
                          members.map((member: any) => {
                            return (
                              <div
                                key={
                                  member?.id ||
                                  member?.profile?.user_id ||
                                  member?.user_id
                                }
                                className="flex items-center justify-between gap-3 px-4 py-3"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="relative h-9 w-9 rounded-lg overflow-hidden border border-[#E6EAEF] dark:border-white/10 shrink-0">
                                    <Image
                                      src={
                                        member?.profile?.avatar_url ||
                                        images?.user
                                      }
                                      alt=""
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-sm font-semibold text-[#101828] dark:text-zinc-100 truncate">
                                      @{member?.profile?.username}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  {togglingUserId ===
                                    member?.profile?.user_id && (
                                    <Loading
                                      color="#5757CD"
                                      height="16px"
                                      width="16px"
                                    />
                                  )}
                                  <Switch
                                    checked={!member?.restricted}
                                    disabled={
                                      togglingUserId ===
                                      member?.profile?.user_id
                                    }
                                    onCheckedChange={(checked) =>
                                      handleToggleUser(
                                        member?.profile?.user_id,
                                        !checked
                                      )
                                    }
                                    aria-label={`Allow @${member?.profile?.username} to post`}
                                    className="data-[state=checked]:bg-[#5757CD] data-[state=unchecked]:bg-[#D0D5DD] dark:data-[state=unchecked]:bg-zinc-600"
                                  />
                                </div>
                              </div>
                            );
                          })
                        )}
                        {!membersLoading && membersLoadingMore && (
                          <div className="flex justify-center py-4">
                            <Loading
                              color="#5757CD"
                              height="16px"
                              width="16px"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="members" className="p-5 lg:p-6 m-0">
                    <div className="rounded-2xl border border-[#E6EAEF] dark:border-white/10 p-5 space-y-3">
                      <h3 className="text-sm font-bold text-[#101828] dark:text-zinc-100">
                        Membership snapshot
                      </h3>
                      <p className="text-sm text-[#667085] dark:text-zinc-400">
                        Manage invites and removals from the channel itself. Use
                        Posting permissions to control who can write.
                      </p>
                      <div className="grid sm:grid-cols-2 gap-3 pt-2">
                        <div className="rounded-xl bg-[#F9FAFB] dark:bg-[#1A1D21] p-4">
                          <p className="text-xs text-[#667085]">
                            Total members
                          </p>
                          <p className="text-2xl font-black mt-1 text-[#101828] dark:text-zinc-100">
                            {members?.length ?? 0}
                          </p>
                        </div>
                        <div className="rounded-xl bg-[#F9FAFB] dark:bg-[#1A1D21] p-4">
                          <p className="text-xs text-[#667085]">Visibility</p>
                          <p className="text-sm font-bold mt-2 text-[#101828] dark:text-zinc-100">
                            {selectedDetail?.is_private
                              ? "Private — invite only"
                              : "Public — discoverable in Directories"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent
                    value="overview"
                    className="p-5 lg:p-6 m-0 space-y-4"
                  >
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="rounded-2xl border border-[#E6EAEF] dark:border-white/10 p-5">
                        <h3 className="text-sm font-bold text-[#101828] dark:text-zinc-100 mb-3">
                          Channel details
                        </h3>
                        <dl className="space-y-3 text-sm">
                          <div className="flex justify-between gap-4">
                            <dt className="text-[#667085]">Topic</dt>
                            <dd className="text-right text-[#101828] dark:text-zinc-100 font-medium">
                              {selectedDetail?.topic || "—"}
                            </dd>
                          </div>
                          <div className="flex justify-between gap-4">
                            <dt className="text-[#667085]">Threads</dt>
                            <dd className="text-right text-[#101828] dark:text-zinc-100 font-medium">
                              {selectedDetail?.thread_count ?? "—"}
                            </dd>
                          </div>
                          <div className="flex justify-between gap-4">
                            <dt className="text-[#667085]">Created</dt>
                            <dd className="text-right text-[#101828] dark:text-zinc-100 font-medium">
                              {selectedDetail?.created_at
                                ? new Date(
                                    selectedDetail.created_at
                                  ).toLocaleDateString()
                                : "—"}
                            </dd>
                          </div>
                        </dl>
                      </div>
                      <div className="rounded-2xl border border-[#E6EAEF] dark:border-white/10 p-5 bg-[#F8F7FF] dark:bg-[#1A1D21]">
                        <h3 className="text-sm font-bold text-[#101828] dark:text-zinc-100 mb-2">
                          Workspace checklist
                        </h3>
                        <ul className="space-y-2 text-sm text-[#475467] dark:text-zinc-300">
                          <li>• Posting permissions (implemented)</li>
                          <li>• Member allow / restrict list (implemented)</li>
                          <li>• Archive / unarchive lifecycle (implemented)</li>
                          <li>• Default channels for new joiners</li>
                          <li>• Naming guidelines &amp; required prefixes</li>
                          <li>• Who can create public / private channels</li>
                          <li>• Retention &amp; export policies</li>
                          <li>• External / guest posting rules</li>
                        </ul>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="lifecycle" className="p-5 lg:p-6 m-0">
                    <div className="rounded-2xl border border-rose-200 dark:border-rose-500/30 bg-rose-50/50 dark:bg-rose-500/10 p-5">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                          <h3 className="text-sm font-bold text-[#101828] dark:text-zinc-100">
                            {isArchivedChannel(selectedDetail || undefined)
                              ? "Unarchive channel"
                              : "Archive channel"}
                          </h3>
                          <p className="text-sm text-[#667085] dark:text-zinc-400 mt-1 max-w-lg">
                            Archiving hides the channel from active lists and
                            blocks new messages for everyone until unarchived.
                          </p>
                        </div>
                        <Button
                          variant={
                            isArchivedChannel(selectedDetail || undefined)
                              ? "default"
                              : "destructive"
                          }
                          disabled={archiving}
                          onClick={handleArchiveToggle}
                          className="gap-2"
                        >
                          {archiving && (
                            <Loading color="white" height="16px" width="16px" />
                          )}
                          {isArchivedChannel(selectedDetail || undefined)
                            ? "Unarchive"
                            : "Archive channel"}
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default OrganisationChannelManagementPage;
