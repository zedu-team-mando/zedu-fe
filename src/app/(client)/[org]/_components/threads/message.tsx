"use client";

import React, { useContext } from "react";
import { DataContext } from "~/store/GlobalState";
import { ACTIONS } from "~/store/Actions";
import ReplyCard from "../reply-card";
import UserAvatar from "~/components/layout/user-avatar";
import MessageItem from "../ChannelMessage/message-item";
import { formatSlackStyleTimestamp } from "~/utils/format-slack-timestamp";

interface MessageProps {
  item: any;
  shouldShowAvatar: boolean;
}

const Message = ({ item, shouldShowAvatar }: MessageProps) => {
  const { state, dispatch } = useContext(DataContext);

  const handleReply = () => {
    dispatch({ type: ACTIONS.THREAD, payload: item });
    dispatch({
      type: ACTIONS.REPLIES,
      payload: {
        newThreads: item.preview_reply ?? item.messages ?? [],
        newPage: 1,
        parentReactions: item.reactions,
      },
    });
    dispatch({ type: ACTIONS.REPLY, payload: true });
    dispatch({ type: ACTIONS.LOAD_THREAD, payload: !state.loadThread });
  };

  return (
    <div className="relative flex items-start gap-2 px-5 py-4 transition-colors">
      <div className="flex items-center justify-center">
        {shouldShowAvatar ? (
          <UserAvatar item={item} size="sm" className="mb-2" alt="profile" />
        ) : (
          <span className="mt-1 block w-[36px] text-xs text-[#98A2B3]">
            {new Date(item?.created_at).toLocaleTimeString([], {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            })}
          </span>
        )}
      </div>

      <div className="w-full min-w-0">
        {shouldShowAvatar && (
          <div className="flex items-center gap-2">
            <span className="text-[15px] font-bold text-[#1D2939]">
              {item?.username || item?.email}
            </span>

            <span className="mt-[1px] text-xs text-[#98A2B3]">
              {formatSlackStyleTimestamp(item?.created_at)}
            </span>
          </div>
        )}

        <div className="relative flex items-start justify-between">
          <div className="flex items-start gap-2">
            <MessageItem item={item} />

            <div className="mt-[2px] text-[9px] text-neutral-500">
              {(item.user_type === "user" || item.user_type === "") &&
              item?.edited === true
                ? "(edited)"
                : ""}
            </div>
          </div>
        </div>

        {item?.message_count > 0 && (
          <ReplyCard
            users={item?.messages}
            totalReplies={item?.message_count}
            lastReplyTime={item?.last_reply || item?.created_at}
            handleReply={handleReply}
          />
        )}
      </div>
    </div>
  );
};

export default Message;
