"use client";

import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useDebounce } from "use-debounce";
import {
  Archive,
  Hash,
  Layers,
  Lock,
  Search,
  Shield,
  Unlock,
  Users,
} from "lucide-react";
import Image from "next/image";
import { DataContext } from "~/store/GlobalState";
import { ACTIONS } from "~/store/Actions";
import { GetRequest, PatchRequest, PutRequest } from "~/utils/new-request";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Switch } from "~/components/ui/switch";
import { Badge } from "~/components/ui/badge";
import { useRBAC } from "~/hooks/useRBAC";
import Loading from "~/components/ui/loading";
import { showSuccess } from "~/components/toast/sonner";
import images from "~/assets/images";

const CHANNEL_USERS_PAGE_SIZE = 20;

type ChannelDetail = {
  channels_id?: string;
  name?: string;
  description?: string;
  topic?: string;
  is_private?: boolean;
  archived?: boolean;
  isArchived?: boolean;
  is_restricted?: boolean;
  user_count?: number;
  owner_name?: string;
  created_at?: string;
  thread_count?: number;
};

function isArchivedChannel(channel?: ChannelDetail | null) {
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

const ChannelManagement = ({ channelId }: { channelId: string }) => {
  const { state, dispatch } = useContext(DataContext);
  const { hasPermission, status: rbacStatus } = useRBAC();
  const canManageChannels = hasPermission("manage:channels");

  const [detailLoading, setDetailLoading] = useState(true);
  const [channel, setChannel] = useState<ChannelDetail | null>(null);
  const [memberSearch, setMemberSearch] = useState("");
  const [debouncedMemberSearch] = useDebounce(memberSearch, 1500);
  const [membersPage, setMembersPage] = useState(1);
  const [membersHasMore, setMembersHasMore] = useState(false);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersLoadingMore, setMembersLoadingMore] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [togglingAll, setTogglingAll] = useState(false);
  const [togglingUserId, setTogglingUserId] = useState<string | null>(null);
  const [archiving, setArchiving] = useState(false);
  const [restrictOverride, setRestrictOverride] = useState<boolean | null>(
    null
  );

  const membersChannelRef = useRef<string | null>(null);
  const searchRequestRef = useRef(0);
  const memberQueryRef = useRef("");
  const membersScrollRef = useRef<HTMLDivElement>(null);
  const membersLoadingMoreRef = useRef(false);
  const baseMembersRef = useRef<{
    members: any[];
    page: number;
    hasMore: boolean;
  }>({ members: [], page: 1, hasMore: false });
  const loadMoreStateRef = useRef({
    membersLoading: false,
    membersHasMore: false,
    membersPage: 1,
    memberSearch: "",
    debouncedMemberSearch: "",
  });

  const syncChannel = (patch: Partial<ChannelDetail>) => {
    setChannel((prev) => (prev ? { ...prev, ...patch } : prev));
    if (
      String(state?.channelDetails?.channels_id || "") === String(channelId)
    ) {
      dispatch({
        type: ACTIONS.CHANNEL_DETAILS,
        payload: { ...state.channelDetails, ...patch },
      });
    }
  };

  useEffect(() => {
    if (!canManageChannels || !channelId) return;
    let cancelled = false;

    const load = async () => {
      setDetailLoading(true);
      const res = await GetRequest(`/channels/${channelId}`);
      if (cancelled) return;
      if (res?.status === 200 || res?.status === 201) {
        setChannel(res?.data?.data || null);
      }
      setDetailLoading(false);
    };

    setRestrictOverride(null);
    void load();
    return () => {
      cancelled = true;
    };
  }, [canManageChannels, channelId]);

  const fetchChannelUsers = useCallback(
    async (page: number, search: string, append: boolean) => {
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
    [channelId]
  );

  const restoreBaseMembers = () => {
    const base = baseMembersRef.current;
    setMembers(base.members);
    setMembersPage(base.page);
    setMembersHasMore(base.hasMore);
    setMembersLoading(false);
    setMembersLoadingMore(false);
  };

  const handleMemberSearch = (value: string) => {
    setMemberSearch(value);
    if (value.trim() || !memberQueryRef.current) return;
    memberQueryRef.current = "";
    searchRequestRef.current += 1;
    restoreBaseMembers();
  };

  useEffect(() => {
    if (!canManageChannels || !channelId) return;

    const channelChanged = membersChannelRef.current !== channelId;
    if (channelChanged) {
      membersChannelRef.current = channelId;
      memberQueryRef.current = "";
      baseMembersRef.current = { members: [], page: 1, hasMore: false };
      void fetchChannelUsers(1, "", false);
      return;
    }

    if (memberSearch.trim() !== debouncedMemberSearch.trim()) return;
    const query = debouncedMemberSearch.trim();
    if (!query) return;

    memberQueryRef.current = query;
    void fetchChannelUsers(1, query, false);
  }, [
    canManageChannels,
    channelId,
    debouncedMemberSearch,
    memberSearch,
    fetchChannelUsers,
  ]);

  loadMoreStateRef.current = {
    membersLoading,
    membersHasMore,
    membersPage,
    memberSearch,
    debouncedMemberSearch,
  };

  const loadMoreMembers = useCallback(() => {
    const current = loadMoreStateRef.current;
    if (
      membersLoadingMoreRef.current ||
      current.membersLoading ||
      !current.membersHasMore ||
      current.memberSearch.trim() !== current.debouncedMemberSearch.trim()
    ) {
      return;
    }

    membersLoadingMoreRef.current = true;
    void fetchChannelUsers(
      current.membersPage + 1,
      current.debouncedMemberSearch,
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

  const handleToggleRestrictAll = async (restricted: boolean) => {
    setTogglingAll(true);
    setRestrictOverride(restricted);
    syncChannel({ is_restricted: restricted });

    const res = await PatchRequest(
      `/channels/${channelId}/users/restrict-all`,
      { restricted }
    );
    if (res?.status === 200 || res?.status === 201) {
      showSuccess(
        restricted
          ? "Channel posting restricted for all members"
          : "Channel posting opened for all members"
      );
      const detail = await GetRequest(`/channels/${channelId}`);
      if (detail?.status === 200 || detail?.status === 201) {
        const data = detail?.data?.data;
        setChannel(data || null);
        setRestrictOverride(null);
        if (
          data &&
          String(state?.channelDetails?.channels_id || "") === String(channelId)
        ) {
          dispatch({ type: ACTIONS.CHANNEL_DETAILS, payload: data });
        }
      }
      dispatch({
        type: ACTIONS.CHANNEL_CALLBACK,
      });
    } else {
      setRestrictOverride(null);
      const detail = await GetRequest(`/channels/${channelId}`);
      if (detail?.status === 200 || detail?.status === 201) {
        setChannel(detail?.data?.data || null);
      }
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
    if (!userId) return;
    setTogglingUserId(userId);
    applyMemberRestriction(userId, restricted);
    const res = await PatchRequest(
      `/channels/${channelId}/users/${userId}/restrict`,
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
    if (!channel) return;
    const nextArchived = !isArchivedChannel(channel);
    setArchiving(true);
    const res = await PutRequest(`/channels/${channelId}/archive`, {
      archived: nextArchived,
    });
    if (res?.status === 200 || res?.status === 201) {
      showSuccess(nextArchived ? "Channel archived" : "Channel unarchived");
      syncChannel({ archived: nextArchived, isArchived: nextArchived });
      dispatch({
        type: ACTIONS.CHANNEL_CALLBACK,
      });
    }
    setArchiving(false);
  };

  if (
    rbacStatus === "loading" ||
    (canManageChannels && detailLoading && !channel)
  ) {
    return (
      <div className="flex justify-center py-24">
        <Loading color="#5757CD" height="36px" width="36px" />
      </div>
    );
  }

  if (!canManageChannels) {
    return (
      <div className="rounded-2xl border border-[#E6EAEF] dark:border-white/10 bg-[#F9FAFB] dark:bg-[#222529] p-10 text-center">
        <Layers className="mx-auto h-10 w-10 text-[#667085] mb-4" />
        <h2 className="text-lg font-bold text-[#101828] dark:text-zinc-100">
          Channel management unavailable
        </h2>
        <p className="text-sm text-[#667085] dark:text-zinc-400 mt-2">
          You don&apos;t have permission to manage this channel. Ask an
          administrator to grant the &quot;Manage channels&quot; permission.
        </p>
      </div>
    );
  }

  const channelRestricted = restrictOverride ?? channel?.is_restricted === true;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#E6EAEF] dark:border-white/10 bg-white dark:bg-[#222529] p-5">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          {channelRestricted ? (
            <Badge className="bg-rose-50 text-rose-700 hover:bg-rose-50 border-0">
              Posting restricted
            </Badge>
          ) : (
            <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-0">
              Open posting
            </Badge>
          )}
          <Badge variant="outline">
            {channel?.is_private ? "Private" : "Public"}
          </Badge>
          {isArchivedChannel(channel) && (
            <Badge variant="secondary">Archived</Badge>
          )}
        </div>
        <h2 className="text-2xl font-black text-[#101828] dark:text-zinc-100 flex items-center gap-2 capitalize">
          {channel?.is_private ? (
            <Lock className="h-5 w-5 shrink-0" />
          ) : (
            <Hash className="h-5 w-5 shrink-0" />
          )}
          {channel?.name || "Channel"}
        </h2>
        <p className="mt-1 text-sm text-[#667085] dark:text-zinc-400">
          {channel?.description ||
            channel?.topic ||
            "No description set for this channel."}
        </p>
        <div className="mt-3 flex flex-wrap gap-4 text-xs text-[#667085] dark:text-zinc-400">
          <span className="inline-flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            {channel?.user_count ?? 0}{" "}
            {(channel?.user_count ?? 0) === 1 ? "member" : "members"}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5" />
            Owner: {channel?.owner_name || "—"}
          </span>
        </div>
      </div>

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
                When enabled, only the channel owner, admins, and members you
                explicitly allow can send top-level messages.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {togglingAll && (
              <Loading color="#5757CD" height="18px" width="18px" />
            )}
            <Switch
              checked={channelRestricted}
              disabled={togglingAll}
              onCheckedChange={(checked) => handleToggleRestrictAll(checked)}
              className="data-[state=checked]:bg-[#5757CD] data-[state=unchecked]:bg-[#D0D5DD] dark:data-[state=unchecked]:bg-zinc-600"
            />
          </div>
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
          </div>
        </div>
        <div
          ref={membersScrollRef}
          onScroll={onMembersScroll}
          className="rounded-xl border border-[#E6EAEF] dark:border-white/10 divide-y divide-[#E6EAEF] dark:divide-white/10 max-h-[480px] overflow-y-auto bg-white dark:bg-[#222529]"
        >
          {membersLoading ? (
            <div className="flex justify-center py-10">
              <Loading color="#5757CD" />
            </div>
          ) : members.length === 0 ? (
            <p className="text-sm text-[#667085] text-center py-10">
              No members found.
            </p>
          ) : (
            members.map((member: any) => (
              <div
                key={memberKey(member)}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative h-9 w-9 rounded-lg overflow-hidden border border-[#E6EAEF] dark:border-white/10 shrink-0">
                    <Image
                      src={member?.profile?.avatar_url || images?.user}
                      alt=""
                      fill
                      className="object-cover"
                    />
                  </div>
                  <p className="text-sm font-semibold text-[#101828] dark:text-zinc-100 truncate">
                    @{member?.profile?.username}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {togglingUserId === member?.profile?.user_id && (
                    <Loading color="#5757CD" height="16px" width="16px" />
                  )}
                  <Switch
                    checked={!member?.restricted}
                    disabled={togglingUserId === member?.profile?.user_id}
                    onCheckedChange={(checked) =>
                      handleToggleUser(member?.profile?.user_id, !checked)
                    }
                    aria-label={`Allow @${member?.profile?.username} to post`}
                    className="data-[state=checked]:bg-[#5757CD] data-[state=unchecked]:bg-[#D0D5DD] dark:data-[state=unchecked]:bg-zinc-600"
                  />
                </div>
              </div>
            ))
          )}
          {!membersLoading && membersLoadingMore && (
            <div className="flex justify-center py-4">
              <Loading color="#5757CD" height="16px" width="16px" />
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-rose-200 dark:border-rose-500/30 bg-rose-50/50 dark:bg-rose-500/10 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-[#101828] dark:text-zinc-100">
              {isArchivedChannel(channel)
                ? "Unarchive channel"
                : "Archive channel"}
            </h3>
            <p className="text-sm text-[#667085] dark:text-zinc-400 mt-1 max-w-lg">
              Archiving hides the channel from active lists and blocks new
              messages until it is unarchived.
            </p>
          </div>
          <Button
            variant={isArchivedChannel(channel) ? "default" : "destructive"}
            disabled={archiving}
            onClick={handleArchiveToggle}
            className="gap-2"
          >
            {archiving ? (
              <Loading color="white" height="16px" width="16px" />
            ) : (
              <Archive className="h-4 w-4" />
            )}
            {isArchivedChannel(channel) ? "Unarchive" : "Archive channel"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChannelManagement;
