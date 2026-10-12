"use client";

import { useState, useRef, useEffect, useContext } from "react";
import {
  Hash,
  Lock,
  X,
  ChevronDown,
  Check,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import CreateChannelDialog from "../../chat-nav/create-channel-dialog";
import { DataContext } from "~/store/GlobalState";
import { ACTIONS } from "~/store/Actions";
import { useRouter } from "next/navigation";
import { search } from "~/utils/filter";
import { Channel } from "~/types/channel";
import { PostRequest } from "~/utils/new-request";
import Loading from "~/components/ui/loading";

/**
 * Directories → Channels tab: lists the organisation's channels with search,
 * filters and sorting, and lets the user open or join a channel.
 */
export default function ChannelsTab() {
  const { state, dispatch } = useContext(DataContext);
  const { allChannels, channelloading, orgSlug } = state;
  const router = useRouter();

  // The all-channels list can lag behind the user's own channel list, so
  // treat a channel as joined if either source says the user is a member.
  const joinedChannelIds = new Set(
    (Array.isArray(state?.channels) ? state.channels : []).map(
      (item: Channel) => item?.channels_id
    )
  );
  const isJoined = (channel: Channel) =>
    channel.access === true || joinedChannelIds.has(channel.channels_id);

  const [showBanner, setShowBanner] = useState(true);
  const [filter, setFilter] = useState("All channels");
  const [channelType, setChannelType] = useState("All channel type");
  const [sortOrder, setSortOrder] = useState("A to Z");
  const [searchInput, setSearchInput] = useState("");
  const [buttonLoading, setButtonloading] = useState(false);

  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filterRef = useRef<HTMLDivElement>(null);
  const typeRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node)
      )
        setShowFilterMenu(false);
      if (typeRef.current && !typeRef.current.contains(event.target as Node))
        setShowTypeMenu(false);
      if (sortRef.current && !sortRef.current.contains(event.target as Node))
        setShowSortMenu(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchInput, filter, channelType]);

  if (channelloading) {
    return (
      <div className="border border-gray-200 rounded-lg divide-y divide-gray-100 m-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-4 flex flex-col gap-2 animate-pulse">
            <div className="h-5 bg-gray-200 rounded w-1/4" />
            <div className="h-4 bg-gray-100 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  const filteredChannels = search(allChannels, searchInput);

  const processedData = filteredChannels
    ?.filter((channel: Channel) => {
      let matchesStatus = true;
      if (filter === "My channels") matchesStatus = isJoined(channel);
      else if (filter === "Other channels") matchesStatus = !isJoined(channel);
      else if (filter === "Archived channels")
        matchesStatus = channel.isArchived === true;

      let matchesType = true;
      if (channelType === "Public channels")
        matchesType = channel.is_private === false;
      else if (channelType === "Private channels")
        matchesType = channel.is_private === true;

      return matchesStatus && matchesType;
    })
    .sort((a: Channel, b: Channel) => {
      if (sortOrder === "A to Z") return a.name.localeCompare(b.name);
      if (sortOrder === "Z to A") return b.name.localeCompare(a.name);
      return 0;
    });

  const totalItems = processedData?.length || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = processedData?.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const selectChannel = (item: any) => {
    dispatch({
      type: ACTIONS.MESSAGES,
      payload: { newThreads: [], newPage: 1 },
    });
    dispatch({
      type: ACTIONS.MESSAGES,
      payload: { newThreads: item?.preview_thread || [], newPage: 1 },
    });
    localStorage.setItem("channelId", item?.channels_id);
    localStorage.setItem("channelName", item?.name);
    dispatch({ type: ACTIONS.CHANNEL_NAME, payload: item?.name || "" });
    router.push(`/${orgSlug}/home/channels/${item.channels_id}`);
  };

  // join channels
  const handleJoin = async (id: string) => {
    setButtonloading(true);

    const channel = allChannels?.find(
      (item: Channel) => item.channels_id === id
    );
    if (channel?.name) {
      localStorage.setItem("channelName", channel.name);
      dispatch({ type: ACTIONS.CHANNEL_NAME, payload: channel.name });
    }

    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const res = await PostRequest(`/channels/${id}/join`, {
      username: user?.username,
    });
    const alreadyMember = String(res?.response?.data?.message ?? "")
      .toLowerCase()
      .includes("already in channel");
    if (res?.status === 200 || res?.status === 201 || alreadyMember) {
      router.push(`/${orgSlug}/home/channels/${id}`);
    } else {
      setButtonloading(false);
    }
  };

  return (
    <div className="p-5 h-[78vh] overflow-y-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 group">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search
              size={18}
              className="text-gray-400 group-focus-within:text-black dark:group-focus-within:text-zinc-100"
            />
          </div>
          <input
            type="text"
            placeholder="Search for channels"
            className="w-full pl-10 pr-4 py-1.5 border border-gray-300 dark:border-white/15 rounded bg-white dark:bg-[#222529] text-[#1d1c1d] dark:text-zinc-100 placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus:border-[#1264a3] focus:ring-1 focus:ring-blue-100 dark:focus:ring-blue-900/40 focus:outline-none text-[15px]"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <CreateChannelDialog />
      </div>

      {showBanner && (
        <div className="relative bg-[#e8f5fa] dark:bg-[#1A3F66]/40 rounded-lg p-4 md:p-8 mb-6 border border-[#c5e5f3] dark:border-[#1A3F66]">
          <button
            onClick={() => setShowBanner(false)}
            className="absolute top-4 right-4 text-gray-500 dark:text-zinc-400 hover:text-black dark:hover:text-zinc-100 transition-colors"
          >
            <X size={20} />
          </button>
          <div className="max-w-2xl">
            <h2 className="text-lg md:text-[28px] font-black leading-tight mb-3 text-[#1d1c1d] dark:text-zinc-100">
              Organize your team’s conversations
            </h2>
            <p className="text-[15px] text-[#454245] dark:text-zinc-300 leading-relaxed mb-6">
              Channels are spaces for gathering all the right people, messages,
              files and tools. Organize them by any project, group, initiative
              or topic of your choosing.
            </p>
            <CreateChannelDialog />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex gap-2">
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className="flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-[#222529] border border-gray-300 dark:border-white/15 rounded text-[13px] font-medium text-[#1d1c1d] dark:text-zinc-100 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
            >
              {filter} <ChevronDown size={14} />
            </button>
            {showFilterMenu && (
              <div className="absolute left-0 mt-1 w-48 bg-white dark:bg-[#222529] border border-gray-200 dark:border-white/15 rounded-md shadow-xl z-50 py-1 text-[#1d1c1d] dark:text-zinc-100">
                {[
                  "All channels",
                  "My channels",
                  "Other channels",
                  "Archived channels",
                ].map((item) => (
                  <button
                    key={item}
                    onClick={() => {
                      setFilter(item);
                      setShowFilterMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-[13px] hover:bg-[#1264a3] hover:text-white flex items-center justify-between"
                  >
                    {item}
                    {filter === item && <Check size={14} />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative" ref={typeRef}>
            <button
              onClick={() => setShowTypeMenu(!showTypeMenu)}
              className="flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-[#222529] border border-gray-300 dark:border-white/15 rounded text-[13px] font-medium text-[#1d1c1d] dark:text-zinc-100 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
            >
              {channelType} <ChevronDown size={14} />
            </button>
            {showTypeMenu && (
              <div className="absolute left-0 mt-1 w-48 bg-white dark:bg-[#222529] border border-gray-200 dark:border-white/15 rounded-md shadow-xl z-50 py-1 text-[#1d1c1d] dark:text-zinc-100">
                {[
                  "All channel type",
                  "Public channels",
                  "Private channels",
                ].map((item) => (
                  <button
                    key={item}
                    onClick={() => {
                      setChannelType(item);
                      setShowTypeMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-[13px] hover:bg-[#1264a3] hover:text-white flex items-center justify-between"
                  >
                    {item}
                    {channelType === item && <Check size={14} />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="relative" ref={sortRef}>
          <button
            onClick={() => setShowSortMenu(!showSortMenu)}
            className="flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-[#222529] border border-gray-300 dark:border-white/15 rounded text-[13px] font-medium text-[#1d1c1d] dark:text-zinc-100 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
          >
            {sortOrder} <ChevronDown size={14} />
          </button>
          {showSortMenu && (
            <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-[#222529] border border-gray-200 dark:border-white/15 rounded-md shadow-xl z-50 py-1 text-[#1d1c1d] dark:text-zinc-100">
              {["A to Z", "Z to A"].map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    setSortOrder(item);
                    setShowSortMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-[13px] hover:bg-[#1264a3] hover:text-white flex items-center justify-between"
                >
                  {item}
                  {sortOrder === item && <Check size={14} />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="border border-gray-200 dark:border-white/10 rounded-lg overflow-hidden divide-y divide-gray-200 dark:divide-white/10">
        {paginatedData && paginatedData.length > 0 ? (
          paginatedData.map((channel: Channel, index: number) => (
            <div
              key={index}
              className="group flex flex-col p-4 hover:bg-[#f8f8f8] dark:hover:bg-white/5 cursor-pointer"
            >
              <div className="flex items-center justify-between flex-wrap gap-5">
                <div className="flex flex-col">
                  <div
                    className="flex items-center gap-1.5 text-[15px] text-[#1d1c1d] dark:text-zinc-100"
                    onClick={() => selectChannel(channel)}
                  >
                    {channel.is_private ? (
                      <Lock size={15} />
                    ) : (
                      <span className="font-black text-[18px]">#</span>
                    )}
                    <span
                      className={`font-black ${channel.isArchived ? "text-gray-400 italic" : ""}`}
                    >
                      {channel.name} {channel.isArchived && "(Archived)"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {isJoined(channel) && (
                      <span className="text-[13px] text-[#007a5a] dark:text-emerald-400 font-bold">
                        ✓ Joined
                      </span>
                    )}
                    <span className="text-[13px] text-gray-500 dark:text-zinc-400">
                      {channel.members_count} members
                    </span>
                    {channel.description && (
                      <>
                        <span className="text-gray-300 dark:text-zinc-600 text-[10px]">
                          •
                        </span>
                        <span className="text-[13px] text-gray-500 dark:text-zinc-400 truncate max-w-[400px]">
                          {channel.description}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => selectChannel(channel)}
                    className="px-4 py-1.5 bg-white dark:bg-[#222529] border border-gray-300 dark:border-white/15 rounded font-bold text-[14px] text-[#1d1c1d] dark:text-zinc-100 hover:shadow-sm dark:hover:bg-white/5"
                  >
                    Open in Home
                  </button>
                  {!isJoined(channel) && !channel.isArchived && (
                    <button
                      onClick={() => handleJoin(channel.channels_id)}
                      className="flex items-center gap-1 px-4 py-1.5 bg-white dark:bg-[#222529] border border-gray-300 dark:border-white/15 rounded font-bold text-[14px] text-[#1d1c1d] dark:text-zinc-100 hover:shadow-sm dark:hover:bg-white/5"
                    >
                      {buttonLoading && (
                        <Loading color="black" height="15px" width="15px" />
                      )}{" "}
                      Join
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-20 text-center text-gray-500 dark:text-zinc-400 italic">
            No channels found matching these criteria.
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2 py-4 border-t border-gray-100 dark:border-white/10 mt-2">
          <span className="text-[13px] text-gray-500 dark:text-zinc-400">
            Showing{" "}
            <span className="font-medium text-black dark:text-zinc-100">
              {startIndex + 1}
            </span>{" "}
            to{" "}
            <span className="font-medium text-black dark:text-zinc-100">
              {Math.min(startIndex + itemsPerPage, totalItems)}
            </span>{" "}
            of{" "}
            <span className="font-medium text-black dark:text-zinc-100">
              {totalItems}
            </span>{" "}
            channels
          </span>
          <div className="flex gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className="p-1.5 border border-gray-300 dark:border-white/15 rounded text-[#1d1c1d] dark:text-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="p-1.5 border border-gray-300 dark:border-white/15 rounded text-[#1d1c1d] dark:text-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
