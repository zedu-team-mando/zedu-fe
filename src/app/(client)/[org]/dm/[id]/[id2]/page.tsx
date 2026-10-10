"use client";

import { GetRequest, PostRequest } from "~/utils/new-request";
import { useContext, useEffect, useState } from "react";
import ChatConnection from "~/components/layout/centrifugo/chat-connection";
import { DataContext } from "~/store/GlobalState";
import MessageBox from "../../../_components/message-box";
import PeopleHeader from "../../../_components/people-nav";
import PeopleMessage from "../../../_components/people-message";
import ProfileSidebar from "../../../_components/profile-sidebar";
import ThreadsSidebar, {
  getThreadsSidebarLayoutWidth,
  threadsSidebarPanelClassName,
} from "../../../_components/threads-sidebar";
import UsePeopleReply from "../../../home/channels/hooks/people-reply";
import { useParams } from "next/navigation";
import { ACTIONS } from "~/store/Actions";
import { useIsSmUp } from "~/hooks/use-media-query";
import { cn } from "~/lib/utils";

//

// Global `participant` is whoever was opened last, so only trust it when it is
// the person this DM is with.
const isParticipantOf = (person: any, participantId: string) =>
  Boolean(person) &&
  String(person?.user_id ?? person?.id ?? person?.participant_id) ===
    String(participantId);

const DmPage = () => {
  const { state, dispatch } = useContext(DataContext);
  const { orgId, reply, participant: previewParticipant, user } = state;
  const [participant, setParticipant] = useState<any>(null);
  const params = useParams();
  const id = params.id as string;
  const id2 = params.id2 as string;
  const { fetchMoreData, hasMore } = UsePeopleReply();
  const isSmUp = useIsSmUp();
  const activeParticipant = isParticipantOf(previewParticipant, id2)
    ? previewParticipant
    : participant;

  // get the participant information
  useEffect(() => {
    setParticipant(null);
    const getUser = async () => {
      const res = await GetRequest(
        `/organisations/${orgId}/dms/participants/${id}`
      );
      if (res?.status === 200 || res?.status === 201) {
        setParticipant(res?.data?.data?.participants[0]);
      }
    };

    if (orgId) {
      getUser();
    }
  }, [id, orgId]);

  const handleSendMessage = async (
    id: string,
    uuid: string,
    content: string,
    medias: any
  ) => {
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

  if (state?.showProfile) {
    totalSidePanelWidth += isSmUp ? 408 : 0;
  }
  if (reply) {
    totalSidePanelWidth += getThreadsSidebarLayoutWidth(true, isSmUp);
  }

  return (
    <div className="flex h-[calc(100vh-70px)] relative w-full overflow-hidden">
      <ChatConnection />

      {/* Main content container that will shrink when panels are open */}
      <div
        className="relative flex flex-col flex-1 transition-[margin] duration-300 ease-in-out"
        style={{ marginRight: `${totalSidePanelWidth}px` }}
      >
        <PeopleHeader user={activeParticipant} />

        <div className="flex-1 flex flex-col relative overflow-hidden">
          <PeopleMessage participant={activeParticipant} />

          <div className="absolute bottom-0 left-0 right-[17px]">
            <MessageBox
              subscription={state?.chatSubscription}
              sendMessage={handleSendMessage}
            />
          </div>
        </div>
      </div>

      {/* Master Side Panels Container - Holds all right-aligned panels */}
      <div
        className={cn(
          "fixed z-30 mt-[60px] right-0 top-0 h-full flex transition-all duration-300 ease-in-out",
          !isSmUp && reply && "w-full"
        )}
        style={
          !isSmUp && reply ? undefined : { width: `${totalSidePanelWidth}px` }
        }
      >
        {/* Profile Sidebar */}
        {state?.showProfile && isSmUp && (
          <div className="w-[408px] h-full bg-white border-l border-[#E6EAEF] shadow-[-3px_0px_27px_0px_#DFDFDF]">
            <ProfileSidebar user={activeParticipant} />
          </div>
        )}

        {/* Threads Sidebar */}
        {reply && (
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
      </div>
    </div>
  );
};

export default DmPage;
