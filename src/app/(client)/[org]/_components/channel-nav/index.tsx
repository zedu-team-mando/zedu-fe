"use client";

import { Avatar, AvatarImage } from "~/components/ui/avatar";
import { EllipsisVertical, Hash, Lock, Pin } from "lucide-react";
import React, { useContext, useRef, useState } from "react";

import { ACTIONS } from "~/store/Actions";
import { Button } from "~/components/ui/button";
import CallButton from "../buzz-management/call-button";
import StartBuzzConfirmModal from "../buzz-management/start-buzz-confirm-modal";
import ChannelDetailsDialog from "../channel-details-dialog";
import { DataContext } from "~/store/GlobalState";
import MenuDropdown from "./menu-dropdown";
import PinnedMessagesModal from "../pinned-messages/pinned-messages-modal";
import Tooltips from "../tooltip";
import { cn } from "~/lib/utils";
import { PostRequest } from "~/utils/new-request";
import { showError, showSuccess } from "~/components/toast/sonner";
import { useParams } from "next/navigation";
import { StarIcon } from "~/svgs";
import {
  DEACTIVATED_AVATAR_SRC,
  isUserDeactivated,
} from "~/utils/user-deactivation";

type ChannelHeaderTab = "messages" | "pins";

const ChannelHeader = () => {
  const [isMenuDropdownOpen, setIsMenuDropdownOpen] = useState(false);
  const [headerTab, setHeaderTab] = useState<ChannelHeaderTab>("messages");
  const [pinsOpen, setPinsOpen] = useState(false);
  const menuDropdownRef = useRef<HTMLDivElement>(null);
  const { state, dispatch } = useContext(DataContext);
  const { channelDetails, user } = state;

  const id = useParams().id as string;
  const detailsMatch =
    String(channelDetails?.channels_id || "") === String(id || "");
  const displayName = detailsMatch
    ? channelDetails?.name || state?.channelName
    : state?.channelName;
  const showPrivateIcon = detailsMatch && channelDetails?.is_private;

  const [startLoading, setStartLoading] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);
  const [startBuzzConfirmOpen, setStartBuzzConfirmOpen] = useState(false);
  const [starLoading, setStarLoading] = useState(false);

  const isStarred = Boolean(channelDetails?.is_starred);

  const handleToggleStar = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!id || starLoading) return;
    setStarLoading(true);

    const nextStarred = !isStarred;
    try {
      const res = await PostRequest(`/channels/${id}/star`);
      if (res?.status === 200 || res?.status === 201) {
        const actualStatus = res.data?.data?.is_starred ?? nextStarred;
        dispatch({
          type: ACTIONS.UPDATE_CHANNEL_STAR,
          payload: { channelId: id, isStarred: actualStatus },
        });
        showSuccess(
          res.data?.message ||
            (actualStatus ? "Channel starred" : "Channel unstarred")
        );
      } else {
        showError("Failed to update starred status");
      }
    } catch (err) {
      showError("Failed to update starred status");
    } finally {
      setStarLoading(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();

    let extractedId = channelDetails?.active_buzz?.buzz_id;

    const isAlreadyInCurrentBuzz =
      state?.hasJoined &&
      String(state?.buzzData?.buzz_id || "") === String(extractedId || "");

    if (isAlreadyInCurrentBuzz) {
      dispatch({ type: ACTIONS.BUZZ_VIEW, payload: "side" });
      dispatch({ type: ACTIONS.BUZZ_SIDEBAR, payload: true });
      return;
    }

    setJoinLoading(true);

    const joinRes = await PostRequest(`/buzz/${extractedId}/join`);

    if (joinRes.status === 200 || joinRes.status === 201) {
      dispatch({ type: ACTIONS.BUZZ_DATA, payload: joinRes.data.data });

      dispatch({
        type: ACTIONS.BUZZ_PARTICIPANTS,
        payload: joinRes.data.data.participants,
      });

      dispatch({ type: ACTIONS.HAS_JOINED, payload: true });
      dispatch({ type: ACTIONS.BUZZ_SIDEBAR, payload: true });

      setJoinLoading(false);
    } else {
      setJoinLoading(false);
    }
  };

  const handleStartBuzz = async () => {
    setStartLoading(true);
    try {
      const createRes = await PostRequest("/buzz/create", { channel_id: id });
      const buzzId = createRes.data.data.buzz_code;

      const joinRes = await PostRequest(`/buzz/${buzzId}/join`);
      if (joinRes.status === 200 || joinRes.status === 201) {
        const localUserAsParticipant = {
          user_id: user?.user_id,
          username: user?.username || "You",
          avatar_url: user?.avatar_url,
          audioTrack: null,
          videoTrack: null,
          handsRaised: false,
          isPinned: false,
        };
        dispatch({
          type: ACTIONS.BUZZ_PARTICIPANTS,
          payload: [localUserAsParticipant],
        });
        dispatch({ type: ACTIONS.BUZZ_DATA, payload: joinRes.data.data });
        dispatch({ type: ACTIONS.HAS_JOINED, payload: true });
        dispatch({ type: ACTIONS.BUZZ_SIDEBAR, payload: true });

        setStartBuzzConfirmOpen(false);
        setStartLoading(false);
      }
    } catch (error) {
      showError("Failed to create meeting. Please try again.");
      setStartLoading(false);
    }
  };

  const headerTabs: {
    id: ChannelHeaderTab;
    label: string;
    icon?: typeof Pin;
  }[] = [
    { id: "messages", label: "Messages" },
    { id: "pins", label: "Pinned", icon: Pin },
  ];

  return (
    <nav className="border-b border-[#E6EAEF] px-3 pt-3 md:px-5 md:pt-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <Tooltips
            side="bottom"
            text={isStarred ? "Remove from Starred" : "Add to Starred"}
          >
            <button
              type="button"
              aria-label={isStarred ? "Unstar channel" : "Star channel"}
              onClick={handleToggleStar}
              className="p-1.5 rounded-md transition-all duration-150 hover:bg-gray-100 dark:hover:bg-zinc-800 active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              <StarIcon
                filled={isStarred}
                color={isStarred ? "#EAAA08" : "#98A2B3"}
                size={18}
              />
            </button>
          </Tooltips>

          <ChannelDetailsDialog>
            <Tooltips side="bottom" text="Get channel details">
              <h2 className="text-base lg:text-lg font-bold hover:bg-gray-100 px-2 py-1 rounded-md flex items-center gap-1.5">
                {displayName &&
                  (showPrivateIcon ? (
                    <Lock className="size-4 lg:size-5 shrink-0" />
                  ) : (
                    <Hash className="size-4 lg:size-5 shrink-0" />
                  ))}
                {displayName}
              </h2>
            </Tooltips>
          </ChannelDetailsDialog>
        </div>

        {!state?.channelloading &&
          state?.channelDetails?.access === true &&
          !state?.channelDetails?.archived && (
            <div className="flex items-center gap-3">
              <div className="flex gap-3 items-center relative">
                {!state?.hasJoined && (
                  <div>
                    <CallButton
                      onClick={
                        channelDetails?.active_buzz
                          ? handleJoin
                          : async (e) => {
                              e.preventDefault();
                              setStartBuzzConfirmOpen(true);
                            }
                      }
                      isActive={channelDetails?.active_buzz}
                      startLoading={startLoading}
                      joinLoading={joinLoading}
                    />
                  </div>
                )}
              </div>

              <div className="w-px h-5 bg-[#E6EAEF] hidden lg:block" />

              {/* avatar badge group */}
              <ChannelDetailsDialog>
                <div
                  onClick={() =>
                    dispatch({ type: ACTIONS.ACTIVE_TAB, payload: "people" })
                  }
                  className="hidden lg:flex rounded-[5px] border border-[#E6EAEF] p-2 h-9 cursor-pointer hover:bg-gray-50"
                >
                  <Tooltips
                    side="bottom"
                    text="View all members of this channel"
                  >
                    <div className="flex items-center gap-1.5">
                      {channelDetails?.users
                        ?.slice(0, 3)
                        .map((member: any, index: number) => (
                          <Avatar
                            key={member.id || member?.profile?.user_id || index}
                            className={`rounded-[5px] w-5 h-5 border border-[#E6EAEF] object-cover ${
                              index > 0 ? "-ml-2.5" : ""
                            }`}
                          >
                            <AvatarImage
                              src={
                                isUserDeactivated(member) ||
                                isUserDeactivated(member?.profile)
                                  ? DEACTIVATED_AVATAR_SRC
                                  : member?.avatar_url ||
                                    member?.default_avatar_url ||
                                    DEACTIVATED_AVATAR_SRC
                              }
                              className="object-cover"
                            />
                          </Avatar>
                        ))}

                      {channelDetails?.users?.length > 3 && (
                        <span className="text-[13px] font-semibold text-[#344054]">
                          +{channelDetails.user_count - 3}
                        </span>
                      )}
                    </div>
                  </Tooltips>
                </div>
              </ChannelDetailsDialog>

              <div className="relative" ref={menuDropdownRef}>
                <Tooltips side="bottom" text="More actions">
                  <Button
                    variant="outline"
                    className={`p-2 border-[#E6EAEF] h-9 ${
                      isMenuDropdownOpen ? "bg-[#F6F7F9]" : ""
                    }`}
                    onClick={() => setIsMenuDropdownOpen((prev) => !prev)}
                  >
                    <EllipsisVertical className="w-5 h-5 text-[#344054] dark:text-zinc-300" />
                  </Button>
                </Tooltips>

                <MenuDropdown
                  isOpen={isMenuDropdownOpen}
                  onClose={() => setIsMenuDropdownOpen(false)}
                />
              </div>
            </div>
          )}
      </div>

      <div className="mt-1 flex items-end gap-5 px-2">
        {headerTabs.map((tab) => {
          const active = headerTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setHeaderTab(tab.id);
                setPinsOpen(tab.id === "pins");
              }}
              className={cn(
                "-mb-px inline-flex items-center gap-1.5 border-b-2 pb-2 text-sm font-semibold",
                active
                  ? "border-[#5757CD] text-[#5757CD]"
                  : "border-transparent text-[#667085] hover:text-[#344054]"
              )}
            >
              {Icon ? <Icon className="size-3.5" /> : null}
              {tab.label}
            </button>
          );
        })}
      </div>

      <PinnedMessagesModal
        open={pinsOpen}
        onOpenChange={(open) => {
          setPinsOpen(open);
          if (!open) setHeaderTab("messages");
        }}
        channelId={id}
        scope="channel"
      />

      <StartBuzzConfirmModal
        open={startBuzzConfirmOpen}
        onOpenChange={setStartBuzzConfirmOpen}
        onConfirm={handleStartBuzz}
        loading={startLoading}
        variant="channel"
        displayName={displayName || "channel"}
        memberCount={channelDetails?.user_count}
        isPrivate={channelDetails?.is_private}
      />
    </nav>
  );
};

export default ChannelHeader;
