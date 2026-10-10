"use client";
import React, { useContext, useEffect, useState } from "react";
import PeopleHeader from "../../../../../_components/people-nav";
import ProfileSidebar from "../../../../../_components/profile-sidebar";
import ChatConnection from "~/components/layout/centrifugo/chat-connection";
import PeopleMessage from "~/app/(client)/[org]/_components/people-message";
import MessageBox from "~/app/(client)/[org]/_components/message-box";
import { GetRequest, PostRequest } from "~/utils/new-request";
import { DataContext } from "~/store/GlobalState";
import { useParams } from "next/navigation";
import ThreadsSidebar, {
  getThreadsSidebarLayoutWidth,
  threadsSidebarPanelClassName,
} from "~/app/(client)/[org]/_components/threads-sidebar";
import UsePeopleReply from "../../../../channels/hooks/people-reply";
import HoverSidebar from "~/app/(client)/[org]/_components/profile-sidebar/hover-sidebar";
import { ACTIONS } from "~/store/Actions";
import { isUserDeactivated } from "~/utils/user-deactivation";
import { useIsSmUp } from "~/hooks/use-media-query";
import { cn } from "~/lib/utils";
import ConversationSearchSidebar, {
  CONVERSATION_SEARCH_PANEL_TRANSITION,
  getConversationSearchSidebarWidth,
} from "~/app/(client)/[org]/_components/conversation-search/conversation-search-sidebar";

// Global `participant` is whoever was opened last, so only trust it when it is
// the person this DM is with.
const isParticipantOf = (person: any, participantId: string) =>
  Boolean(person) &&
  String(person?.user_id ?? person?.id ?? person?.participant_id) ===
    String(participantId);

const DmPage = () => {
  const { state, dispatch } = useContext(DataContext);
  const { orgId, participant: previewParticipant, user } = state;
  const [participant, setParticipant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const isSmUp = useIsSmUp();
  const params = useParams();
  const id = params.id as string;
  const id2 = params.id2 as string;
  const { fetchMoreData, hasMore } = UsePeopleReply();
  const activeParticipant = isParticipantOf(previewParticipant, id2)
    ? previewParticipant
    : participant;

  // get the participant infor
  useEffect(() => {
    setParticipant(
      isParticipantOf(previewParticipant, id2) ? previewParticipant : null
    );
    const getUser = async () => {
      const res = await GetRequest(
        `/organisations/${orgId}/dms/participants/${id}`
      );
      if (res?.status === 200 || res?.status === 201) {
        const people = res?.data?.data?.participants || [];
        const match =
          people.find(
            (person: any) =>
              String(
                person?.user_id ?? person?.id ?? person?.participant_id
              ) === String(id2)
          ) ||
          people.find(
            (person: any) =>
              String(person?.user_id ?? person?.id) !== String(user?.user_id)
          ) ||
          people[0];
        setParticipant(match);
      }
    };

    if (orgId && id) {
      getUser();
    }
  }, [id, id2, orgId, user?.user_id, previewParticipant]);

  const handleSendMessage = async (
    id: string,
    uuid: string,
    content: string,
    medias: any
  ) => {
    // send client side update
    const optimisticMessage = {
      channels_id: id,
      thread_id: uuid,
      username: user?.username || "You",
      avatar_url: user?.avatar_url,
      message: content,
      created_at: new Date().toISOString(),
      status: "pending",
      type: "message",
      media: state.media,
      user_id: user?.user_id,
      reactions: null,
      isOptimistic: true,
    };

    dispatch({
      type: ACTIONS.CHATS,
      payload: { newMessage: optimisticMessage },
    });
    dispatch({
      type: ACTIONS.UPDATE_DM_PREVIEW,
      payload: { channelId: id, message: content },
    });

    const secondPayload = {
      content: content,
      thread_id: uuid,
      media: medias,
    };

    await PostRequest(`/dms/channels/${id}/threads`, secondPayload);
  };

  const handleReplyMessage = async (
    id: string,
    uuid: string,
    content: string,
    medias: any
  ) => {
    const optimisticMessage = {
      id: uuid,
      channels_id: id,
      thread_id: state?.thread?.thread_id,
      username: user?.username || "You",
      avatar_url: user?.avatar_url,
      message: content,
      created_at: new Date().toISOString(),
      status: "pending",
      type: "message",
      media: state.media,
      user_id: user?.user_id,
      reactions: null,
      isOptimistic: true,
    };

    dispatch({
      type: ACTIONS.REPLIES,
      payload: { newMessage: optimisticMessage },
    });

    const payload = {
      content: content,
      thread_id: state?.thread?.thread_id,
      media: medias,
    };

    await PostRequest(`/dms/messages/${id}`, payload);
  };

  // Calculate combined width of open side panels
  let totalSidePanelWidth = 0;

  if (state?.hoverProfile) {
    totalSidePanelWidth += isSmUp ? 408 : 0;
  }
  if (state?.showProfile) {
    totalSidePanelWidth += isSmUp ? 408 : 0;
  }
  if (state?.reply) {
    totalSidePanelWidth += getThreadsSidebarLayoutWidth(true, isSmUp);
  }
  totalSidePanelWidth += getConversationSearchSidebarWidth(
    Boolean(state?.conversationSearchOpen),
    isSmUp
  );

  return (
    <div className="flex h-[calc(100vh-70px)] relative w-full overflow-hidden">
      <ChatConnection />

      <div
        className={cn(
          "relative flex flex-col flex-1 transition-[margin]",
          CONVERSATION_SEARCH_PANEL_TRANSITION
        )}
        style={{ marginRight: `${totalSidePanelWidth}px` }}
      >
        <PeopleHeader user={activeParticipant} />

        <PeopleMessage
          participant={activeParticipant}
          setShowProfile={setShowProfile}
          showProfile={showProfile}
        />

        {isUserDeactivated(activeParticipant) ? (
          <div className="absolute bottom-0 left-0 right-[17px] border-t border-[#E6EAEF] bg-[#F8F8F8] px-5 py-4 text-sm text-[#616061]">
            This person is deactivated and can no longer receive messages.
          </div>
        ) : (
          <div className="absolute bottom-0 left-0 right-[17px]">
            <MessageBox
              subscription={state?.chatSubscription}
              sendMessage={handleSendMessage}
            />
          </div>
        )}
      </div>

      {/* Master Side Panels Container - Holds all right-aligned panels */}
      <div
        className={cn(
          "fixed z-30 mt-[60px] right-0 top-0 h-full flex overflow-hidden transition-[width]",
          CONVERSATION_SEARCH_PANEL_TRANSITION,
          !isSmUp && state?.reply && "w-full"
        )}
        style={
          !isSmUp && state?.reply
            ? undefined
            : { width: `${totalSidePanelWidth}px` }
        }
      >
        {/* Profile Sidebar */}
        {state?.showProfile && isSmUp && (
          <div className="w-[408px] h-full bg-white border-l border-[#E6EAEF]">
            <ProfileSidebar user={activeParticipant} />
          </div>
        )}

        {/* Hover Sidebar */}
        {state?.hoverProfile && isSmUp && (
          <div className="w-[408px] h-full bg-white border-l border-[#E6EAEF]">
            <HoverSidebar />
          </div>
        )}

        {/* Threads Sidebar */}
        {state?.reply && (
          <div
            className={cn(
              threadsSidebarPanelClassName,
              "shadow-[-3px_0px_27px_0px_#DFDFDF]"
            )}
          >
            <ThreadsSidebar
              handleSendMessage={handleReplyMessage}
              fetchMoreData={fetchMoreData}
              hasMore={hasMore}
            />
          </div>
        )}

        <ConversationSearchSidebar
          channelId={id}
          conversationLabel={activeParticipant?.username}
        />
      </div>
    </div>
  );
};

export default DmPage;
