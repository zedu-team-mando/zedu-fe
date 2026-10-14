import React, { useContext, useState } from "react";
import { SmilePlus, Bookmark, BookmarkCheck } from "lucide-react";
import UserAvatar from "~/components/layout/user-avatar";
import MessageItem from "./message-item";
import { AppleEmojiText } from "~/app/(client)/[org]/_components/apple-emoji/apple-emoji-text";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import EmojiPicker from "~/components/theme/themed-emoji-picker";
import data from "@emoji-mart/data";
import { DataContext } from "~/store/GlobalState";
import ReplyMore from "./reply-more";
import UserHoverCard from "../hover-card/user";
import { ACTIONS } from "~/store/Actions";
import {
  DeleteSavedMessage,
  GetRequest,
  PostRequest,
  SaveMessage,
} from "~/utils/new-request";
import { useParams, usePathname } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { TooltipArrow } from "@radix-ui/react-tooltip";
import moment from "moment";
import { formatReactionUsers } from "~/utils/format-reaction-users";

const ReplyMessages = ({
  item,
  shouldShowAvatar,
  setPopupId,
  popupId,
}: any) => {
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const { state, dispatch } = useContext(DataContext);
  const { bookmarks, user, orgMembers } = state;
  const params = useParams();
  const id = params.id as string;
  const [usernames, setUsernames] = useState<any>([]);
  const pathname = usePathname();

  const isSaved = bookmarks?.some((b: any) => b.id === item.id);

  const isOnline = orgMembers?.find(
    (member: any) => member.id === item.user_id
  )?.online;

  const handleOpen = () => {
    dispatch({ type: ACTIONS.USER_DATA, payload: item });
    dispatch({ type: ACTIONS.HOVER_PROFILE, payload: true });
  };

  const onEmojiClick = async (emojiData: any) => {
    setIsEmojiPickerOpen(false);

    const payload = {
      thread_id: item?.thread_id,
      message_id: item?.id,
      type: "reply",
      reaction: emojiData.native,
    };
    await PostRequest(`/reactions/${id ?? item?.channels_id}`, payload);
    setIsEmojiPickerOpen(false);
    setEmojiPickerOpen(false);
  };

  const handleUpdateEmoji = async (emoji: any) => {
    setIsEmojiPickerOpen(false);

    const payload = {
      thread_id: item?.thread_id,
      message_id: item?.id,
      type: "reply",
      reaction: emoji,
    };
    await PostRequest(`/reactions/${id}`, payload);
  };

  const toggleSave = async () => {
    const updatedIds = [...bookmarks, { id: item.id }];

    dispatch({ type: ACTIONS.BOOKMARKS, payload: updatedIds });

    const orgId = localStorage.getItem("orgId") || "";

    const payload = {
      channels_id: id,
      message_id: item.id,
      thread_id: item.thread_id,
    };

    await SaveMessage(`/organisations/${orgId}/message/save`, payload);
  };

  const toggleRemove = async () => {
    const updatedIds = bookmarks.filter(
      (bookmark: any) => bookmark.id !== item.id
    );

    dispatch({ type: ACTIONS.BOOKMARKS, payload: updatedIds });

    const orgId = localStorage.getItem("orgId") || "";

    await DeleteSavedMessage(
      `/organisations/${orgId}/saved/message/${item.id}`
    );
  };

  // get reactions users
  const reactionUsers = async (reactionId: string) => {
    const res = await GetRequest(
      `/reactions/${reactionId}/thread/${item?.thread_id}`
    );
    if (res?.status === 200 || res?.status === 201) {
      const names = (res?.data?.data?.usernames || [])
        .map((name: any) =>
          typeof name === "string"
            ? name.trim()
            : (
                name?.username ||
                name?.user_name ||
                name?.display_name ||
                ""
              ).trim()
        )
        .filter(Boolean);

      const currentUserName = (
        user?.username ||
        user?.display_name ||
        user?.full_name ||
        ""
      ).trim();

      // API often omits the current user on self-reactions
      if (names.length === 0 && currentUserName) {
        setUsernames([currentUserName]);
      } else {
        setUsernames(names);
      }
    }
  };

  const handlePopup = () => {
    setPopupId((prevId: string | null) =>
      prevId === item.id ? null : item.id
    );
  };

  const handleClick = (emoji: any, e: any) => {
    handleUpdateEmoji(emoji.reaction);
    e.stopPropagation();
  };

  //

  return (
    <div
      id={item?.id ? `reply-${item.id}` : undefined}
      className={`h-[100%] relative group py-1 transition-colors flex items-start gap-2 px-3 ${item.is_pinned ? "bg-yellow-50" : isSaved ? "bg-primary-50" : "hover:bg-gray-50"}`}
    >
      <div className="flex shrink-0 items-center justify-center">
        {shouldShowAvatar ? (
          <>
            <div className="relative inline-flex">
              <UserHoverCard
                item={item}
                handleOpen={handleOpen}
                isOnline={isOnline}
              />
            </div>
            <div
              className="relative mb-2 flex cursor-pointer lg:hidden"
              onClick={handleOpen}
            >
              <UserAvatar item={item} size="sm" alt="profile" />
            </div>
          </>
        ) : (
          <span className="mt-1 block w-[36px] text-xs text-[#98A2B3] opacity-0 transition-opacity group-hover:opacity-100">
            {new Date(item?.created_at).toLocaleTimeString([], {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            })}
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        {shouldShowAvatar && (
          <div className="flex items-center gap-2">
            <span
              className="cursor-pointer text-[15px] font-bold text-[#1D2939] hover:underline"
              onClick={handleOpen}
            >
              {item?.username || item?.email}
            </span>

            <span className="text-xs text-[#98A2B3]">
              {moment(item?.created_at).format("MMMM Do [at] h:mm A")}
            </span>
          </div>
        )}

        <div className="relative flex items-start justify-between">
          <div className="flex items-center gap-2">
            <MessageItem item={item} />

            <span className="text-[9px] text-neutral-500">
              {item?.edited ? "(edited)" : ""}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 rounded-md mt-1">
          {item?.reactions?.map((emoji: any, index: number) => {
            const namesListString = formatReactionUsers(usernames || []);

            return (
              <TooltipProvider key={index}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      onMouseEnter={() => reactionUsers(emoji.reaction_id)}
                      onClick={(e) => handleClick(emoji, e)}
                      className="bg-primary-50 text-[13px] cursor-pointer text-blue-100 border border-blue-400 flex items-center justify-center h-[27px] py-1 px-3 rounded-2xl"
                    >
                      <AppleEmojiText text={emoji?.reaction} />{" "}
                      {emoji?.reaction_count}
                    </div>
                  </TooltipTrigger>

                  <TooltipContent className="bg-black text-white p-2 rounded-md text-sm max-w-[280px]">
                    <TooltipArrow className="fill-black" />

                    <div className="text-5xl mx-auto text-center bg-white rounded-lg flex items-center justify-center p-2 w-[70px] mb-2">
                      <AppleEmojiText text={emoji.reaction} />
                    </div>
                    {namesListString && (
                      <span className="block text-center whitespace-normal break-words">
                        {namesListString} reacted with{" "}
                        <AppleEmojiText text={emoji?.reaction} />
                      </span>
                    )}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}

          <Popover open={emojiPickerOpen} onOpenChange={setEmojiPickerOpen}>
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <PopoverTrigger asChild>
                    {item?.reactions?.length > 0 && (
                      <div
                        className="bg-primary-50 text-[13px] cursor-pointer text-blue-100 h-[27px] flex items-center justify-center py-1 px-3 rounded-full border hover:border-blue-400"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <SmilePlus size={16} />
                      </div>
                    )}
                  </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent className="bg-black text-white p-2 rounded-md text-sm">
                  <TooltipArrow className="fill-black" />
                  <span>Add reaction...</span>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <PopoverContent className="p-0 w-full max-w-xs" align="end">
              <EmojiPicker data={data} onEmojiSelect={onEmojiClick} />
            </PopoverContent>
          </Popover>
        </div>

        <div className="hidden lg:flex opacity-0 group-hover:opacity-100 transition-opacity flex items-center ml-4 absolute right-5 -top-6 z-10 bg-white shadow-md rounded-[8px] border border-[#E6EAEF] p-[2px]">
          {!pathname?.includes("/agents") && (
            <Popover
              open={isEmojiPickerOpen}
              onOpenChange={setIsEmojiPickerOpen}
            >
              <PopoverTrigger asChild>
                <button className="py-[7px] px-[10px] hover:bg-gray-200 rounded">
                  <SmilePlus size={18} className="text-[#667085]" />
                </button>
              </PopoverTrigger>
              <PopoverContent
                className="p-0"
                align="end"
                avoidCollisions
                collisionPadding={80}
              >
                <EmojiPicker data={data} onEmojiSelect={onEmojiClick} />
              </PopoverContent>
            </Popover>
          )}

          {isSaved ? (
            <button
              onClick={toggleRemove}
              className="py-[7px] px-[10px] hover:bg-gray-200 rounded"
            >
              <BookmarkCheck size={18} className="text-primary-500" />
            </button>
          ) : (
            <button
              onClick={toggleSave}
              className="py-[7px] px-[10px] hover:bg-gray-200 rounded"
            >
              <Bookmark size={18} className="text-[#667085]" />
            </button>
          )}
          <ReplyMore item={item} />
        </div>

        {popupId === item.id && (
          <div
            onClick={handlePopup}
            className="flex lg:hidden group-hover:opacity-100 transition-opacity flex items-center ml-4 absolute right-5 -top-6 z-10 bg-white shadow-md rounded-[8px] border border-[#E6EAEF] p-[2px]"
          >
            {!pathname?.includes("/agents") && (
              <Popover
                open={isEmojiPickerOpen}
                onOpenChange={setIsEmojiPickerOpen}
              >
                <PopoverTrigger asChild>
                  <button className="py-[7px] px-[10px] hover:bg-gray-200 rounded">
                    <SmilePlus size={18} className="text-[#667085]" />
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  className="p-0"
                  align="end"
                  avoidCollisions
                  collisionPadding={80}
                >
                  <EmojiPicker data={data} onEmojiSelect={onEmojiClick} />
                </PopoverContent>
              </Popover>
            )}

            {isSaved ? (
              <button
                onClick={toggleRemove}
                className="py-[7px] px-[10px] hover:bg-gray-200 rounded"
              >
                <BookmarkCheck size={18} className="text-primary-500" />
              </button>
            ) : (
              <button
                onClick={toggleSave}
                className="py-[7px] px-[10px] hover:bg-gray-200 rounded"
              >
                <Bookmark size={18} className="text-[#667085]" />
              </button>
            )}
            <ReplyMore item={item} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ReplyMessages;
