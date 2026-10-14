"use client";

import { Search, X, Loader2, PlusIcon } from "lucide-react";
import { useContext, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import InfiniteScroll from "react-infinite-scroll-component";

import { ACTIONS } from "~/store/Actions";
import { DataContext } from "~/store/GlobalState";
import UserAvatar from "~/components/layout/user-avatar";
import { Input } from "~/components/ui/input";
import OrganisationMenu from "~/app/(client)/[org]/_components/org-dropdown";
// import { PencilIcon } from "~/svgs";
import { PostRequest } from "~/utils/new-request";
import { cn } from "~/lib/utils";
import { formatCount } from "~/utils/utils";
import { useOrganisationUsers } from "~/hooks/useOrganisationUsers";
import { isUserDeactivated } from "~/utils/user-deactivation";

export default function PeopleNav({
  resizerRef,
  sidebarWidth,
  sidebarRef,
}: any) {
  const { state, dispatch } = useContext(DataContext);
  const [searchInput, setSearchInput] = useState("");
  const memberRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const params = useParams();
  const id2 = params.id2 as string;
  const router = useRouter();
  const { orgSlug } = state;

  const orgId =
    typeof window !== "undefined" ? localStorage.getItem("orgId") || "" : "";
  const { hasMore, loadMore, users, loading } = useOrganisationUsers(orgId, {
    search: searchInput,
  });

  useEffect(() => {
    const savedScroll = sessionStorage.getItem("sidebar-scroll");
    if (sidebarRef.current && savedScroll) {
      sidebarRef.current.scrollTop = parseInt(savedScroll, 10);
    }
  }, [sidebarRef]);

  const handleScroll = () => {
    if (sidebarRef.current) {
      sessionStorage.setItem(
        "sidebar-scroll",
        sidebarRef.current.scrollTop.toString()
      );
    }
  };

  const handleRoute = async (data: any) => {
    const orgId = localStorage.getItem("orgId") || "";

    const payload = {
      chat_type: data?.entity_type,
      participant_id: data?.id,
    };

    const res = await PostRequest(`/organisations/${orgId}/dms`, payload);

    if (res?.status === 200 || res?.status === 201) {
      router.push(
        `/${orgSlug}/people/${res?.data?.data?.channel_id}/${res?.data?.data?.participant_id}`
      );
    }
  };

  const handleNewChat = () => {
    router.push(`/${orgSlug}/home/people/new-chat`);
  };

  const searchData = (users as any[]) || [];

  useEffect(() => {
    if (id2 && memberRefs.current[id2]) {
      memberRefs.current[id2]?.scrollIntoView({
        behavior: "auto",
        block: "start",
      });
    }
  }, [id2, searchData]);

  return (
    <>
      <div
        ref={sidebarRef}
        style={{ width: `${sidebarWidth}px` }}
        className={`fixed top-[60px] lg:rounded-tl-[8px] lg:rounded-bl-[8px] bottom-[60px] left-0 lg:left-[85px] h-[100dvh] bg-blue-300 lg:translate-x-0  ${state?.openSidebar ? "translate-x-[85px]" : "-translate-x-full "}
      pt-4 flex flex-col gap-4 sm:w-[350px] transition-transform duration-300 ease-in-out z-30`}
      >
        <div className="flex items-center justify-between px-3 ">
          <div className="flex items-center gap-[5px] md:justify-between w-full">
            <OrganisationMenu name="People" />

            <button type="button" onClick={handleNewChat}>
              <PlusIcon color="white" size={20} strokeWidth={2} />
            </button>
          </div>
        </div>

        <div className="relative h-fit w-full px-3">
          <Input
            type="text"
            placeholder="Find a conversation"
            className="h-10 pl-8 pr-8 bg-[#4A4AAF] border-[#5F5FE1] text-white placeholder:text-white/80"
            onChange={(e) => setSearchInput(e.target.value)}
            value={searchInput}
          />

          <div className="absolute top-[12px] left-6">
            <Search color="#FFFFFF" size={16} />
          </div>

          {searchInput && (
            <button
              type="button"
              className="absolute top-[12px] right-5 text-white"
              onClick={() => setSearchInput("")}
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div
          id="scrollableDiv"
          className="overflow-auto [&::-webkit-scrollbar]:hidden text-blue-50 cursor-pointer"
          onScroll={handleScroll}
          onClick={() =>
            dispatch({ type: ACTIONS.OPEN_SIDEBAR, payload: false })
          }
        >
          <InfiniteScroll
            dataLength={searchData?.length || 0}
            next={loadMore}
            hasMore={hasMore}
            loader={
              <div className="flex justify-center p-4">
                <Loader2 className="animate-spin text-white/70" size={20} />
              </div>
            }
            scrollableTarget="scrollableDiv"
          >
            <div className="flex flex-col">
              {searchData?.map((dm: any, index: number) => {
                return (
                  <div key={dm?.id}>
                    <div
                      ref={(el) => {
                        memberRefs.current[dm?.id] = el;
                      }}
                      onClick={() => handleRoute(dm)}
                      className={`flex items-center gap-3 px-3 py-4 hover:bg-[#4B4BB4] ${dm?.id === id2 ? "bg-[#4B4BB4]" : ""}`}
                    >
                      <div className="relative bg-white rounded-[7px]">
                        <UserAvatar item={dm} size="2xs" alt="colleague" />

                        {!isUserDeactivated(dm) && (
                          <span
                            className={`absolute -right-1 -bottom-1 ${dm?.online ? "bg-[#00AD51]" : "bg-[#F97316]"} w-[8px] h-[8px] rounded-full border border-white`}
                          />
                        )}
                      </div>

                      <div className="-mt-1">
                        <span className="text-[15px] font-semibold text-white break-words max-w-[300px] line-clamp-2">
                          {dm?.name}
                        </span>
                      </div>

                      {dm.thread_count > 0 && (
                        <div
                          className={cn(
                            `absolute right-3 flex items-center justify-center rounded-full bg-blue-200 hover:bg-blue-500 text-white tracking-[-0.5%] font-bold text-right text-[10px] px-2`
                          )}
                        >
                          {formatCount(dm?.thread_count || 0)}
                        </div>
                      )}
                    </div>

                    {index !== searchData.length - 1 && (
                      <hr className="border-[#5F5FE1]" />
                    )}
                  </div>
                );
              })}

              {searchData?.length === 0 && !loading && (
                <p className="self-center mt-10">No available member</p>
              )}
            </div>
          </InfiniteScroll>
        </div>
      </div>

      <div
        ref={resizerRef}
        style={{ left: `${sidebarWidth + 85}px` }}
        className="fixed top-[60px] bottom-[10px] w-1.5 cursor-ew-resize opacity-100 transition-opacity duration-300 z-50 hover:opacity-100"
      />
    </>
  );
}
