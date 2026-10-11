import { Button } from "~/components/ui/button";
import { UserPlusIcon, RobotIcon } from "~/svgs";
import { EditTopicDialog } from "./edit-topic-dialog";
import { DataContext } from "~/store/GlobalState";
import { useContext, useEffect, useRef, useState } from "react";
import Image from "next/image";
import images from "~/assets/images";
import { GetRequest, PostRequest } from "~/utils/new-request";
import { useParams } from "next/navigation";
import { ACTIONS } from "~/store/Actions";
import Loading from "~/components/ui/loading";
import { UnarchiveChannelDialog } from "./unarchive-channel";
import GlobalSearch from "../global-search";
import moment from "moment";
import { Checkbox } from "~/components/ui/checkbox";
import { Trash2, X } from "lucide-react";
import { useRBAC } from "~/hooks/useRBAC";
import { showSuccess } from "~/components/toast/sonner";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

export function AboutTabContainer({ setIsOpen }: any) {
  const [buttonLoading, setButtonLoading] = useState(false);

  const params = useParams();
  const id = params.id as string;
  const { state, dispatch } = useContext(DataContext);
  const { channelDetails } = state;

  const handleLeave = async () => {
    setButtonLoading(true);

    const res = await PostRequest(`/channels/${id}/leave`, {});
    if (res?.status === 200 || res?.status === 201) {
      dispatch({
        type: ACTIONS.CHANNEL_CALLBACK,
      });
      setIsOpen(false);
    }
    setButtonLoading(false);
  };

  //

  return (
    <div className="bg-white dark:bg-[#222529] text-[0.9375rem] divide-y divide-[#E6EAEF] border border-[#E6EAEF] rounded-[0.625rem] overflow-hidden">
      <div className="py-4 px-5 flex justify-between items-center">
        <div>
          <h3 className="font-bold text-[#101828]">Topic</h3>
          <p className="text-[#667085]">
            {channelDetails?.topic || "Add a topic"}
          </p>
        </div>

        <EditTopicDialog
          type="topic"
          className="text-primary-500 text-[0.8125rem] p-0 h-fit"
        >
          Edit
        </EditTopicDialog>
      </div>

      <div className="py-4 px-5 flex justify-between items-center">
        <div>
          <h3 className="font-bold text-[#101828]">Description</h3>
          <p className="text-[#667085]">
            {channelDetails?.description || "Add a description"}
          </p>
        </div>

        <EditTopicDialog
          type="description"
          className="text-primary-500 text-[0.8125rem] p-0 h-fit"
        >
          Edit
        </EditTopicDialog>
      </div>

      <div className="py-4 px-5 flex justify-between items-center">
        <div>
          <h3 className="font-bold text-[#101828]">Created by</h3>
          <p className="text-[0.9375rem] text-[#667085]">
            {channelDetails?.owner_name} on{" "}
            {moment(channelDetails?.created_at).format("ll")}
          </p>
        </div>
      </div>

      <div className="py-4 px-5 flex justify-between items-center">
        <UnarchiveChannelDialog>
          <Button className="flex items-center gap-2 text-[#D31103] font-bold p-0 h-fit">
            Archive channel for everyone
          </Button>
        </UnarchiveChannelDialog>
      </div>

      <div className="py-4 px-5 flex justify-between items-center">
        <Button
          onClick={handleLeave}
          className="flex items-center text-[#D31103] font-bold p-0 h-fit gap-2"
        >
          Leave channel
          {buttonLoading && <Loading color="red" height="15px" width="15px" />}
        </Button>
      </div>
    </div>
  );
}

const getChannelUserId = (item: any) =>
  item?.id ?? item?.user_id ?? item?.profile?.user_id ?? item?.profile?.id;

const CHANNEL_USERS_PAGE_SIZE = 20;

const mergeChannelUsers = (existing: any[], incoming: any[]) => {
  const seen = new Set(existing.map((user) => String(getChannelUserId(user))));
  const merged = [...existing];
  for (const user of incoming) {
    const id = String(getChannelUserId(user) ?? "");
    if (!id || seen.has(id)) continue;
    seen.add(id);
    merged.push(user);
  }
  return merged;
};

export function PeopleTabContainer({ setIsOpen }: any) {
  const { state, dispatch } = useContext(DataContext);
  const { channelDetails } = state;
  const params = useParams();
  const channelId = (channelDetails?.id || params.id) as string;
  const { hasPermission } = useRBAC();
  const canRemovePeople = hasPermission("remove:people");
  const [users, setUsers] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const loadMoreSentinelRef = useRef<HTMLDivElement>(null);

  const applyUsersPage = (
    incoming: any[],
    pagination: any,
    replace: boolean
  ) => {
    const currentPage = Number(pagination?.current_page) || 1;
    const totalPages = Number(pagination?.total_pages) || 1;

    setUsers((prev) =>
      replace ? incoming : mergeChannelUsers(prev, incoming)
    );
    if (replace) setFilteredData(incoming);
    setPage(currentPage);
    setHasMore(currentPage < totalPages && incoming.length > 0);
  };

  useEffect(() => {
    if (!channelId) return;

    let cancelled = false;

    const loadUsers = async () => {
      setLoading(true);
      setLoadMoreError(false);
      const res = await GetRequest(
        `/channels/${channelId}/users?page=1&limit=${CHANNEL_USERS_PAGE_SIZE}`
      );
      if (cancelled) return;

      if (res?.status === 200 || res?.status === 201) {
        applyUsersPage(res?.data?.data || [], res?.data?.pagination, true);
      } else {
        setUsers([]);
        setHasMore(false);
      }
      setLoading(false);
    };

    loadUsers();

    return () => {
      cancelled = true;
    };
  }, [channelId]);

  const loadMore = async () => {
    if (!channelId || loading || loadingMore || !hasMore) return;

    setLoadingMore(true);
    setLoadMoreError(false);
    const nextPage = page + 1;
    const res = await GetRequest(
      `/channels/${channelId}/users?page=${nextPage}&limit=${CHANNEL_USERS_PAGE_SIZE}`
    );

    if (res?.status === 200 || res?.status === 201) {
      applyUsersPage(res?.data?.data || [], res?.data?.pagination, false);
    } else {
      setLoadMoreError(true);
    }
    setLoadingMore(false);
  };

  // Search filters only the loaded members, so pause auto-loading while a
  // search is active to avoid paging through the whole channel.
  const isFiltering = filteredData.length !== users.length;
  const canAutoLoad =
    !loading && hasMore && !loadingMore && !loadMoreError && !isFiltering;

  useEffect(() => {
    const root = scrollContainerRef.current;
    const sentinel = loadMoreSentinelRef.current;
    if (!canAutoLoad || !root || !sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) loadMore();
      },
      { root, rootMargin: "0px 0px 120px 0px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canAutoLoad, page]);

  const handleOpenUserProfile = (item: any) => {
    const profile = item?.profile ?? item;
    const userId = getChannelUserId(item);
    if (!userId) return;

    dispatch({
      type: ACTIONS.USER_DATA,
      payload: {
        ...profile,
        user_id: userId,
        username: profile?.username ?? item?.username,
        avatar_url: profile?.avatar_url ?? item?.avatar_url,
        default_avatar_url:
          profile?.default_avatar_url ?? item?.default_avatar_url,
        email: profile?.email ?? item?.email,
        title: profile?.title ?? item?.title,
        phone: profile?.phone ?? item?.phone,
        timezone: profile?.timezone ?? item?.timezone,
        full_name: profile?.full_name ?? item?.full_name,
        is_deactivated: profile?.is_deactivated ?? item?.is_deactivated,
      },
    });
    dispatch({ type: ACTIONS.HOVER_PROFILE, payload: true });
    setIsOpen?.(false);
  };

  const selectedUsers = users.filter((user: any) =>
    selectedIds.includes(String(getChannelUserId(user)))
  );
  const selectedCount = selectedIds.length;
  const selectedNames = selectedUsers
    .map((user: any) => `@${user?.profile?.username || "user"}`)
    .filter(Boolean);

  const toggleSelected = (userId: string, checked: boolean) => {
    setSelectedIds((prev) => {
      if (checked) {
        return prev.includes(userId) ? prev : [...prev, userId];
      }
      return prev.filter((id) => id !== userId);
    });
  };

  const handleRemoveSelected = async () => {
    if (!canRemovePeople || selectedIds.length === 0 || !channelId) return;

    setRemoving(true);
    const res = await PostRequest("/channels/remove-multiple", {
      channel_id: channelId,
      user_ids: selectedIds,
    });

    if (res?.status === 200 || res?.status === 201) {
      const remainingUsers = users.filter(
        (user: any) => !selectedIds.includes(String(getChannelUserId(user)))
      );
      setUsers(remainingUsers);
      dispatch({
        type: ACTIONS.CHANNEL_DETAILS,
        payload: { ...channelDetails, users: remainingUsers },
      });
      dispatch({
        type: ACTIONS.CHANNEL_CALLBACK,
      });
      showSuccess(res?.data?.message || "People removed from channel");
      setSelectedIds([]);
      setConfirmOpen(false);
    }

    setRemoving(false);
  };

  return (
    <div>
      {/* SEARCH INPUT */}
      <GlobalSearch
        data={users}
        placeholder="Find a user"
        onSearchResults={setFilteredData}
      />

      <div className="flex items-center justify-between gap-2">
        <Button
          onClick={() =>
            dispatch({ type: ACTIONS.CHANNEL_INVITE, payload: true })
          }
          className="h-fit p-0 py-3 gap-2 font-semibold text-[#101828] dark:text-zinc-100 text-[0.9375rem]"
        >
          <div className="w-8 aspect-square rounded-full bg-[#E6F1FF] dark:bg-[#1A3F66] flex justify-center items-center">
            <UserPlusIcon />
          </div>
          Add people
        </Button>

        {canRemovePeople && selectedCount > 0 && (
          <Button
            variant="ghost"
            onClick={() => setConfirmOpen(true)}
            className="h-fit p-0 py-3 gap-1.5 font-semibold text-[#D31103] dark:text-red-400 text-[0.9375rem] hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-[#D31103] dark:hover:text-red-300"
            aria-label="Remove selected people from channel"
          >
            <Trash2 size={16} />
            Remove {selectedCount > 1 ? `(${selectedCount})` : ""}
          </Button>
        )}
      </div>

      {/* USERS DISPLAYED */}
      <div ref={scrollContainerRef} className="max-h-[300px] overflow-auto">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loading color="#5757CD" />
          </div>
        ) : (
          filteredData?.map((item: any) => {
            const userId = String(getChannelUserId(item) ?? "");
            const isSelected = userId ? selectedIds.includes(userId) : false;

            return (
              <div
                key={userId || item?.profile?.username}
                role="button"
                tabIndex={0}
                onClick={() => handleOpenUserProfile(item)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleOpenUserProfile(item);
                  }
                }}
                className="flex justify-start items-center gap-2.5 py-3 cursor-pointer rounded-md hover:bg-gray-50 dark:hover:bg-white/5"
              >
                {canRemovePeople && userId && (
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) =>
                      toggleSelected(userId, checked === true)
                    }
                    onClick={(e) => e.stopPropagation()}
                    className="border-[#ADADEA] dark:border-zinc-500"
                    aria-label={`Select @${item?.profile?.username}`}
                  />
                )}

                <figure className="relative aspect-square w-[2.25rem] rounded-[0.4375rem]">
                  <Image
                    src={item?.profile?.avatar_url || images?.user}
                    alt=""
                    fill
                    className="border border-[#E6EAEF] dark:border-white/15 rounded"
                  />
                  <span
                    className={`absolute z-50 -bottom-1 -right-1 inline-block w-[0.625rem] aspect-square border-[1.5px] border-white dark:border-[#222529] rounded-full ${
                      item?.profile?.online ? "bg-[#00AD51]" : "bg-[#F97316]"
                    }`}
                  ></span>
                </figure>

                <div className="flex items-center gap-2">
                  <p className="font-medium text-[#101828] dark:text-zinc-100 text-[0.9375rem]">
                    @{item?.profile?.username}
                  </p>
                  <span className="inline-block bg-[#E6EAEF] dark:bg-zinc-600 w-[0.375rem] aspect-square rounded-full"></span>
                  <p className="text-[#475467] dark:text-zinc-400 text-[0.8125rem]">
                    {item?.profile?.username}
                  </p>
                </div>
              </div>
            );
          })
        )}

        {!loading && hasMore && (
          <div
            ref={loadMoreSentinelRef}
            className="flex flex-col items-center gap-2 py-3"
          >
            {loadingMore ? (
              <Loading color="#5757CD" height="16px" width="16px" />
            ) : (
              (loadMoreError || isFiltering) && (
                <>
                  {loadMoreError && (
                    <p className="text-[0.8125rem] text-[#667085] dark:text-zinc-400">
                      Couldn&apos;t load more members.
                    </p>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={loadMore}
                    className="h-8 px-3 text-[0.8125rem]"
                  >
                    {loadMoreError ? "Retry" : "Load more"}
                  </Button>
                </>
              )
            )}
          </div>
        )}
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent
          onClick={(e) => e.stopPropagation()}
          className="p-0 gap-0 bg-background dark:bg-[#222529]"
        >
          <DialogHeader className="py-4 px-6 border-b border-[#E6EAEF] dark:border-white/10">
            <DialogTitle className="font-black text-[1.375rem] text-[#1D2939] dark:text-zinc-100">
              Remove from channel?
            </DialogTitle>
          </DialogHeader>

          <DialogClose className="absolute right-5 top-4 text-[#344054] dark:text-zinc-300 p-1 border border-input dark:border-white/15 rounded-[0.3125rem]">
            <X className="size-5 text-[#344054] dark:text-zinc-300" />
          </DialogClose>

          <DialogDescription
            asChild
            className="text-sm text-[#344054] dark:text-zinc-300 space-y-3 p-5"
          >
            <div>
              {selectedCount === 1 ? (
                <p>
                  Are you sure you want to remove{" "}
                  <span className="font-semibold text-[#101828] dark:text-zinc-100">
                    {selectedNames[0]}
                  </span>{" "}
                  from #{channelDetails?.name}? They will lose access to this
                  channel until they are added again.
                </p>
              ) : (
                <p>
                  Are you sure you want to remove{" "}
                  <span className="font-semibold text-[#101828] dark:text-zinc-100">
                    {selectedCount} people
                  </span>{" "}
                  from #{channelDetails?.name}? They will lose access to this
                  channel until they are added again.
                </p>
              )}
              {selectedCount > 1 && selectedNames.length > 0 && (
                <p className="text-[#667085] dark:text-zinc-400">
                  {selectedNames.join(", ")}
                </p>
              )}
            </div>
          </DialogDescription>

          <DialogFooter className="flex justify-end space-x-2 p-5">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              onClick={handleRemoveSelected}
              disabled={removing}
              variant="destructive"
            >
              Remove {removing && <Loading />}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function AgentsTabContainer() {
  const { state, dispatch } = useContext(DataContext);
  const { channelAgents } = state;
  const [filteredData, setFilteredData] = useState(channelAgents);

  //

  return (
    <div>
      {/* SEARCH INPUT */}
      <GlobalSearch
        data={channelAgents}
        placeholder="Find an agent"
        onSearchResults={setFilteredData}
      />

      <Button
        onClick={() => dispatch({ type: ACTIONS.AGENT_MODAL, payload: true })}
        className="h-fit p-0 py-3 gap-2 font-semibold text-[#101828] text-[0.9375rem]"
      >
        <div className="w-8 aspect-square rounded-full bg-[#F2F4F7] flex justify-center items-center">
          <RobotIcon />
        </div>
        Add agents
      </Button>

      {/* AGENTS DISPLAYED */}
      <div className="max-h-[300px] overflow-auto">
        {filteredData?.map((item: any, index: number) => {
          return (
            <div key={index} className="flex items-center gap-2.5 py-3">
              <div className="size-8 rounded border border-[#E6EAEF] flex items-center justify-center bg-green-100 relative overflow-hidden">
                <Image
                  src={item?.app_logo || images?.bot}
                  alt={item?.app_name}
                  width={20}
                  height={20}
                  className="size-8 rounded"
                />
              </div>

              <p className="font-semibold text-[#101828] text-[0.9375rem]">
                @{item?.app_name}
              </p>
            </div>
          );
        })}

        {filteredData?.length === 0 && (
          <p className="text-center text-gray-500 my-10 text-sm">
            No available agent
          </p>
        )}
      </div>
    </div>
  );
}

export function TabsTabContainer() {
  return (
    <div className="flex flex-col items-center justify-center h-full py-10 text-center">
      <h2 className="text-lg font-semibold text-gray-800">🚧 Coming Soon</h2>
      <p className="mt-2 text-sm text-gray-500 max-w-sm">
        This feature is currently under development. Please check back later!
      </p>
    </div>
  );
}
