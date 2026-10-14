"use client";

import { HashIcon, HeadphonesIcon } from "lucide-react";
import { cn } from "~/lib/utils";
import { useParams, useRouter } from "next/navigation";
import { formatCount } from "~/utils/utils";
import { LockClosedIcon } from "@radix-ui/react-icons";
import { useContext } from "react";
import { DataContext } from "~/store/GlobalState";
import { ACTIONS } from "~/store/Actions";

interface ComponentProps {
  name: string;
  active: boolean;
  thread_count: number;
  message_count: number;
  channels_id: string;
  id?: string;
  archived?: boolean;
  mention_count: number;
  is_private: boolean;
  is_starred?: boolean;
  preview_thread: any;
  active_buzz?: boolean;
  selectedChannelId?: string;
  onSelectChannel?: (channelId: string) => void;
}

export const ChannelCard = (props: ComponentProps) => {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { state, dispatch } = useContext(DataContext);
  const { orgSlug } = state;

  // Handle channel selection
  const selectChannel = () => {
    props.onSelectChannel?.(props.channels_id);
    dispatch({
      type: ACTIONS.MESSAGES,
      payload: { newThreads: [], newPage: 1 },
    });
    dispatch({
      type: ACTIONS.MESSAGES,
      payload: { newThreads: props.preview_thread || [], newPage: 1 },
    });
    localStorage.setItem("channelId", props?.channels_id);
    localStorage.setItem("channelName", props?.name);
    dispatch({ type: ACTIONS.CHANNEL_NAME, payload: props?.name });

    // Clear Nav unread highlight immediately on open
    dispatch({
      type: ACTIONS.UPDATE_THREAD_COUNT,
      payload: {
        channels_id: props.channels_id,
        mention_count: 0,
        thread_count: 0,
      },
    });
    dispatch({ type: ACTIONS.THREAD_COUNT, payload: 0 });

    router.push(`/${orgSlug}/home/channels/${props.channels_id}`);
  };

  // Determine if this card is the currently selected one
  const isSelected = props.channels_id === (props.selectedChannelId || id);
  const isActive = props?.mention_count > 0 || props?.thread_count > 0;

  //

  return (
    <li
      className={cn(
        "relative px-2 mx-2 py-[7px] flex items-center rounded-lg group hover:bg-blue-200 cursor-pointer",
        isSelected ? "bg-blue-200" : ""
      )}
      onClick={selectChannel}
    >
      <div className="flex-1 flex items-center gap-1">
        {props?.is_private ? (
          <LockClosedIcon
            className={cn(
              "size-4",
              props.active ? "text-white" : "text-blue-50"
            )}
          />
        ) : (
          <HashIcon
            className={cn("size-4", isActive ? "text-white" : "text-blue-50")}
          />
        )}

        <p
          className={cn(
            "text-[15px] leading-4 lowercase truncate py-1 w-[180px]",
            isActive ? "font-semibold text-white" : "text-blue-50"
          )}
          title={props.name}
        >
          {props.name}
        </p>
      </div>

      <div className="absolute right-3 flex items-center gap-2">
        {props.active_buzz && <HeadphonesIcon size={16} />}

        {props.mention_count > 0 && (
          <div
            className={cn(
              `flex items-center justify-center rounded-full bg-blue-200 hover:bg-blue-500 text-white tracking-[-0.5%] font-bold text-right text-[10px] px-2`,
              isSelected ? "bg-blue-500 text-white" : ""
            )}
          >
            {formatCount(props?.mention_count || 0)}
          </div>
        )}
      </div>
    </li>
  );
};
