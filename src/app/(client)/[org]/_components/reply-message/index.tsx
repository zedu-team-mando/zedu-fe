"use client";
import React, { useContext, useEffect, useState } from "react";
import { DataContext } from "~/store/GlobalState";
import InfiniteScroll from "react-infinite-scroll-component";
import ReplyMessages from "../ChannelMessage/reply-message";
import Thread from "../ChannelMessage/thread";
import UserAvatar from "~/components/layout/user-avatar";
import { Pin } from "lucide-react";
import MessageItem from "../ChannelMessage/message-item";
import { GetRequest, PutRequest } from "~/utils/new-request";
import { ACTIONS } from "~/store/Actions";
import { useParams, useSearchParams } from "next/navigation";
import EditReplyMessageBox from "../message-box/edit-reply";
import { BookmarkFilledIcon } from "@radix-ui/react-icons";
import {
  applyMessageHighlightClasses,
  MESSAGE_HIGHLIGHT_DURATION_MS,
  removeMessageHighlightClasses,
} from "~/utils/message-highlight";

const ReplyMessage = ({ fetchMoreData, hasMore }: any) => {
  const { state, dispatch } = useContext(DataContext);
  const { replies, user, thread, threadReply, isEditReply, bookmarks } = state;
  const params = useParams();
  const searchParams = useSearchParams();
  const channelId = (thread?.channels_id || params.id) as string;
  const [popupId, setPopupId] = useState<any>(null);
  const replyMessageId = searchParams.get("message_id");

  useEffect(() => {
    if (!replyMessageId || !replies?.length) return;

    const highlightReply = () => {
      const el = document.getElementById(`reply-${replyMessageId}`);
      if (!el) return false;

      el.scrollIntoView({ behavior: "auto", block: "center" });
      applyMessageHighlightClasses(el);
      setTimeout(() => {
        removeMessageHighlightClasses(el);
      }, MESSAGE_HIGHLIGHT_DURATION_MS);
      return true;
    };

    if (highlightReply()) return;

    requestAnimationFrame(() => {
      highlightReply();
    });
  }, [replyMessageId, replies]);

  // edit message
  const handleEditMessage = async (content: any) => {
    // payload
    const payload = {
      content: content,
      message_id: threadReply?.id,
      thread_id: threadReply?.thread_id,
    };

    await PutRequest(`/channels/${channelId}/messages`, payload);
    dispatch({
      type: ACTIONS.IS_EDIT_REPLY,
      payload: false,
    });
  };

  // saved for later messages
  useEffect(() => {
    const orgId = localStorage.getItem("orgId") || "";

    const loadSavedChats = async () => {
      const res = await GetRequest(`/organisations/${orgId}/saved/message`);

      if (res?.status === 200 || res?.status === 201) {
        const result = res?.data?.data?.map((item: any) => {
          return item.type === "thread"
            ? { id: item.id, thread_id: item.thread_id }
            : { id: item.id };
        });

        dispatch({ type: ACTIONS.BOOKMARKS, payload: result });
      }
    };

    loadSavedChats();
  }, []);

  //

  return (
    <div
      id="scrollableDivs"
      style={{
        overflowY: "auto",
        display: "flex",
        flexDirection: "column-reverse",
      }}
      className="h-full w-full overflow-x-hidden pb-[15px]"
    >
      <InfiniteScroll
        dataLength={replies?.length}
        next={fetchMoreData}
        hasMore={hasMore}
        loader={
          replies?.length !== 0 && (
            <h4 className="my-5 text-xs text-center">Loading threads...</h4>
          )
        }
        style={{
          display: "flex",
          flexDirection: "column-reverse",
          overflowY: "hidden",
          overflowX: "hidden",
        }}
        scrollableTarget="scrollableDivs"
        inverse={true}
      >
        {replies?.map((item: any, index: number) => {
          const nextMessage = replies[index + 1];
          const shouldShowAvatar =
            !nextMessage || nextMessage.user_id !== item.user_id;

          const isSaved = bookmarks?.some((b: any) => b.id === item.id);

          return (
            <React.Fragment key={index}>
              <>
                {isEditReply && threadReply?.id === item?.id ? (
                  <div
                    className={`flex mb-5 gap-2 mt-2 z-10 bg-white px-2 py-3 bg-blue-50 w-full`}
                  >
                    <UserAvatar item={item} size="sm" className="mb-2" />

                    <EditReplyMessageBox
                      subscription={state?.replySubscription}
                      sendMessage={handleEditMessage}
                    />
                  </div>
                ) : (
                  <>
                    <ReplyMessages
                      item={item}
                      shouldShowAvatar={shouldShowAvatar}
                      setPopupId={setPopupId}
                      popupId={popupId}
                    />

                    {item.is_pinned ? (
                      <div className="flex items-center gap-2 bg-yellow-50 pl-10 text-[13px] font-semibold text-blue-100 pt-2">
                        <Pin size={13} className="text-[#667085] mt-[3px]" />
                        Pinned by{" "}
                        {user?.email === item?.pinned_details?.email
                          ? "you"
                          : item?.pinned_details?.username}
                      </div>
                    ) : isSaved ? (
                      <div className="flex items-center gap-2 bg-primary-50 pl-10 text-[13px] font-bold text-blue-100 pt-2">
                        <BookmarkFilledIcon
                          fontSize={13}
                          className="text-[#667085]"
                        />
                        Saved for Later
                      </div>
                    ) : null}
                  </>
                )}
              </>
            </React.Fragment>
          );
        })}

        {thread && (
          <div className="px-3 mt-4 mb-2">
            {thread?.type === "thread" ? (
              <Thread item={thread} compact />
            ) : (
              <div className="flex">
                <UserAvatar
                  item={thread}
                  size="sm"
                  className="mr-2"
                  alt="avatar"
                />

                <div>
                  <div className="w-full flex items-center gap-2">
                    <span className="font-bold text-[15px] text-[#1D2939]">
                      {thread?.username || thread?.email}
                    </span>

                    <span className="text-xs text-[#98A2B3]">
                      {new Date(thread?.created_at).toLocaleTimeString([], {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </span>
                  </div>

                  <div className="relative flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <MessageItem item={thread} />

                      <span className="text-[9px] text-neutral-500">
                        {thread?.edited ? "(edited)" : ""}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Show horizontal divider with "35 replies" after the first item */}
            {replies?.length > 0 && (
              <div className="flex items-center my-3 mt-5">
                <hr className="flex-grow border-t border-gray-200" />
                <span className="text-xs text-gray-500 mx-2 whitespace-nowrap">
                  {replies?.length}{" "}
                  {replies?.length === 1 ? "reply" : "replies"}
                </span>
                <hr className="flex-grow border-t border-gray-200" />
              </div>
            )}
          </div>
        )}
      </InfiniteScroll>
    </div>
  );
};

export default ReplyMessage;
