"use client";
import { useContext, useEffect, useState } from "react";
import { DataContext } from "~/store/GlobalState";
import { ACTIONS } from "~/store/Actions";
import { useParams, usePathname, useRouter } from "next/navigation";
import { ChevronRight, PlusIcon } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { ChatBubbleIcon, DropdownIcon, HeadphoneIcon } from "~/svgs";
import { ChannelCard } from "~/app/(client)/[org]/_components/ChannelCard";
import { cn } from "~/lib/utils";
import { PeopleHomeCard } from "~/app/(client)/[org]/_components/people-card";
import Link from "next/link";
import InviteModal from "~/app/(client)/[org]/_components/invite-modal";
import ChannelInviteModal from "~/app/(client)/[org]/_components/invite-modal/channel";
import OrganisationMenu from "~/app/(client)/[org]/_components/org-dropdown";
import Tooltips from "~/app/(client)/[org]/_components/tooltip";
import { formatCount } from "~/utils/utils";
// import AddColleagueDialog from "~/app/(client)/[org]/_components/colleagues/add-colleagues-modal";
// import { ColleaguesCard } from "~/app/(client)/[org]/_components/colleagues/card";

export default function ChannelNav({
  resizerRef,
  sidebarWidth,
  sidebarRef,
}: any) {
  const { state, dispatch } = useContext(DataContext);
  const router = useRouter();
  const params = useParams();
  const { orgSlug } = state;
  const pathname = usePathname();
  const onChannelPage = pathname.includes("/channels/");
  const routeChannelId = onChannelPage ? String(params.id || "") : "";
  const [pendingChannelId, setPendingChannelId] = useState<string | null>(null);

  useEffect(() => {
    if (pendingChannelId && pendingChannelId === routeChannelId) {
      setPendingChannelId(null);
    }
  }, [pendingChannelId, routeChannelId]);

  const selectedChannelId = onChannelPage
    ? pendingChannelId || routeChannelId
    : "";

  useEffect(() => {
    const savedScroll = sessionStorage.getItem("sidebar-scroll");
    if (sidebarRef && savedScroll) {
      sidebarRef.current.scrollTop = parseInt(savedScroll, 10);
    }
  }, []);

  const handleScroll = () => {
    if (sidebarRef) {
      sessionStorage.setItem(
        "sidebar-scroll",
        sidebarRef.current.scrollTop.toString()
      );
    }
  };

  const [openAccordions, setOpenAccordions] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("openAccordions");
      return saved
        ? JSON.parse(saved)
        : ["channels", "workflows", "agents", "people"];
    }
    return ["channels", "workflows", "agents", "people"];
  });

  const handleAccordionChanges = (values: string[]) => {
    setOpenAccordions(values);
    if (typeof window !== "undefined") {
      localStorage.setItem("openAccordions", JSON.stringify(values));
    }
  };

  const handleNewChat = () => {
    router.push(`/${orgSlug}/home/people/new-chat`);
  };

  const handleClose = () => {
    dispatch({ type: ACTIONS.OPEN_SIDEBAR, payload: false });
  };

  const channelsReady = Array.isArray(state?.channels);
  const homeDmsReady = Array.isArray(state?.homeDms);
  const threadsReady = Array.isArray(state?.threadMentions);
  const unseenThreadCount = state?.unseenThreadCount ?? 0;
  const showThreadsBadge = unseenThreadCount > 0;

  const sortedChannels = channelsReady
    ? state.channels.slice().sort((a: any, b: any) => {
        const nameA = (a?.name || a?.channel_slug || "").toLowerCase();
        const nameB = (b?.name || b?.channel_slug || "").toLowerCase();
        return nameA.localeCompare(nameB);
      })
    : [];

  return (
    <>
      <div
        ref={sidebarRef}
        style={{ width: `${sidebarWidth}px` }}
        className={`fixed top-[60px] bottom-[60px] left-0 lg:left-[85px] h-[100dvh] bg-blue-300 lg:translate-x-0 ${state?.openSidebar ? "translate-x-[85px]" : "-translate-x-full "}
        pt-4 flex flex-col gap-6 transition-transform duration-300 ease-in-out z-30`}
      >
        <div
          className="flex-1 min-h-0 overflow-y-auto text-blue-50 cursor-pointer pb-20 [scrollbar-gutter:stable] [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.4)_transparent] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/35 hover:[&::-webkit-scrollbar-thumb]:bg-white/55"
          onScroll={handleScroll}
          onClick={() =>
            dispatch({ type: ACTIONS.OPEN_SIDEBAR, payload: false })
          }
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {threadsReady && (
            <Link
              href={`/${orgSlug}/threads`}
              className={cn(
                "relative flex-1 flex items-center gap-[2px] py-[7px] px-2 mx-2 mb-2 hover:bg-blue-200 hover:text-white rounded-lg ",
                pathname.includes("/threads") ? "bg-blue-200" : ""
              )}
            >
              <ChatBubbleIcon />
              <p
                className={cn(
                  "text-[15px] leading-4 truncate w-[180px] text-blue-50"
                )}
              >
                Threads
              </p>
              {showThreadsBadge && (
                <div
                  className={cn(
                    "absolute right-3 flex items-center justify-center rounded-full bg-blue-200 text-white tracking-[-0.5%] font-bold text-right text-[10px] px-2 min-w-[1.25rem]",
                    pathname.includes("/threads")
                      ? "bg-blue-500 text-white"
                      : ""
                  )}
                >
                  {formatCount(unseenThreadCount)}
                </div>
              )}
            </Link>
          )}

          {channelsReady && (
            <Link
              href={`/${orgSlug}/buzzs`}
              className={cn(
                "flex-1 flex items-center gap-[2px] py-[7px] px-2 mx-2 hover:bg-blue-200 hover:text-white rounded-lg ",
                pathname.includes("/buzzs") ? "bg-blue-200" : ""
              )}
            >
              <div className="mt-[2px]">
                <HeadphoneIcon />
              </div>
              <p
                className={cn(
                  "text-[15px] leading-4 truncate w-[180px] text-blue-50"
                )}
              >
                Buzzes
              </p>
            </Link>
          )}

          <div className="">
            {channelsReady && (
              <div>
                <Accordion
                  type="multiple"
                  className="w-full"
                  value={openAccordions}
                  onValueChange={handleAccordionChanges}
                  onClick={(e) => e.stopPropagation()}
                >
                  <AccordionItem value="channels" className="border-none">
                    <AccordionTrigger className="font-normal w-full py-0">
                      <div className="relative py-3 mx-4 flex items-center gap-1 rounded-lg cursor-pointer w-full">
                        <DropdownIcon
                          className={`transition-transform duration-300 ${
                            openAccordions.includes("channels")
                              ? "rotate-0"
                              : "-rotate-90"
                          }`}
                        />
                        <h3 className="text-[15px]  font-medium">Channels</h3>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent onClick={handleClose}>
                      <ul className="flex flex-col gap-1">
                        {sortedChannels.map((item: any, index: number) => (
                          <ChannelCard
                            {...item}
                            key={
                              item?.channels_id ?? item?.channel_slug ?? index
                            }
                            selectedChannelId={selectedChannelId}
                            onSelectChannel={setPendingChannelId}
                          />
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <Link
                  href={`/${orgSlug}/home/channels`}
                  className={cn(
                    "relative px-2 mx-2 py-[6px] flex items-center justify-between rounded-lg group hover:border-blue-200 border border-[#4B4BB4] cursor-pointer"
                  )}
                >
                  <p
                    className={cn(
                      "text-[14px] leading-4 truncate text-blue-50"
                    )}
                  >
                    View all channels
                  </p>
                  <ChevronRight size={17} />
                </Link>
              </div>
            )}

            {/* <>
              <Accordion
                type="multiple"
                className="w-full mt-4"
                value={openAccordions}
                onValueChange={handleAccordionChanges}
                onClick={(e) => e.stopPropagation()}
              >
                <AccordionItem value="workflows" className="border-none">
                  <AccordionTrigger className="font-normal w-full py-0">
                    <div className="relative py-3 mx-4 flex items-center gap-1 rounded-lg cursor-pointer w-full">
                      <DropdownIcon
                        className={`w-5 h-5 transition-transform duration-300 ${
                          openAccordions.includes("workflows")
                            ? "rotate-0"
                            : "-rotate-90"
                        }`}
                      />
                      <h3 className="text-[15px]  font-medium">AI Coworkers</h3>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent onClick={handleClose}>
                    <ul className="flex flex-col gap-1">
                      {state?.agentDm?.map((item: any, index: number) => (
                        <ColleaguesCard {...item} key={index} />
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              <AddColleagueDialog />

              <Link
                href={`/${orgSlug}/home/colleagues`}
                className={cn(
                  "relative px-2 mx-2 py-[6px] mb-10 flex items-center justify-between rounded-lg group hover:border-blue-200 border border-[#4B4BB4] cursor-pointer"
                )}
              >
                <p
                  className={cn("text-[14px] leading-4 truncate text-blue-50")}
                >
                  View all AI Coworkers
                </p>
                <ChevronRight size={17} />
              </Link>
            </> */}
          </div>
          {homeDmsReady && (
            <Accordion
              type="multiple"
              className="w-full"
              value={openAccordions}
              onValueChange={handleAccordionChanges}
              onClick={(e) => e.stopPropagation()}
            >
              <AccordionItem value="people" className="border-none">
                <div className="relative py-3 mx-4 flex items-center justify-between rounded-lg cursor-pointer z-50 group">
                  <AccordionTrigger className="font-normal py-0">
                    <div className="relative flex items-center gap-1 rounded-lg cursor-pointer">
                      <DropdownIcon
                        className={`w-5 h-5 transition-transform duration-300 ${
                          openAccordions.includes("people")
                            ? "rotate-0"
                            : "-rotate-90"
                        }`}
                      />
                      <h3 className="text-[15px] leading-4 font-medium capitalize">
                        People
                      </h3>
                    </div>
                  </AccordionTrigger>
                  <Tooltips text="Start a new chat" side="top">
                    <button
                      type="button"
                      className="flex items-center justify-center h-6 w-6 bg-blue-500 rounded gap-1 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={handleNewChat}
                      aria-label="Start a new chat"
                    >
                      <PlusIcon className="size-4" />
                    </button>
                  </Tooltips>
                </div>
                <AccordionContent onClick={handleClose}>
                  {state.homeDms.map((item: any, index: number) => (
                    <div
                      className="mb-1"
                      key={item?.channel_id || item?.channels_id || index}
                    >
                      <PeopleHomeCard {...item} />
                    </div>
                  ))}

                  {state.homeDms.length === 0 && (
                    <p className="text-xs text-center text-blue-50">
                      No recent chats. Start a new conversation!
                    </p>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}

          {homeDmsReady && (
            <Link
              href={`/${orgSlug}/home/people`}
              className={cn(
                "relative px-2 mx-2 py-[6px] mb-10 flex items-center justify-between rounded-lg group hover:border-blue-200 border border-[#4B4BB4] cursor-pointer"
              )}
            >
              <p className={cn("text-[14px] leading-4 truncate text-blue-50")}>
                View all people
              </p>
              <ChevronRight size={17} />
            </Link>
          )}
        </div>
      </div>

      <div
        ref={resizerRef}
        style={{ left: `${sidebarWidth + 85}px` }}
        className="fixed top-[60px] bottom-[10px] w-1.5 cursor-ew-resize opacity-100 transition-opacity duration-300 z-30 hover:opacity-100"
      />
      {state?.inviteModal && <InviteModal />}
      {state?.channelInvite && <ChannelInviteModal />}
    </>
  );
}
