import React, { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import {
  BellOff,
  Bookmark,
  Clock,
  Link,
  Pin,
  Users,
  Edit,
  Trash2,
  MoreHorizontal,
  MoreVertical,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { DataContext } from "~/store/GlobalState";
import { ACTIONS } from "~/store/Actions";
import DeleteReplyMessageDialog from "../delete-message-modal/reply";
import { SaveMessage } from "~/utils/new-request";
import { useParams, usePathname } from "next/navigation";
import PinReplyMessageDialog from "../pin-message-modal/reply";
import { buildMessageLink, getMessageLinkContext } from "~/utils/message-link";
import { orgSlugFromPathname } from "~/lib/reserved-paths";
import { showInfo } from "~/components/toast/sonner";

const MessageContextMenu = ({ item }: any) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState(false);
  const { state, dispatch } = useContext(DataContext);
  const { user, orgSlug, thread } = state;
  const params = useParams();
  const pathname = usePathname();
  const id = (params.id || thread?.channels_id || item?.channels_id) as string;
  const [unpinModal, setUnpinModal] = useState(false);

  useEffect(() => {
    const body = document.body;

    if (isPopoverOpen) {
      body.classList.add("overflow-hidden");
    } else {
      body.classList.remove("overflow-hidden");
    }

    return () => {
      body.classList.remove("overflow-hidden");
    };
  }, [isPopoverOpen]);

  // handledelete
  const handleDelete = () => {
    dispatch({ type: ACTIONS.THREAD_REPLY, payload: item });
    setDeleteMessage(true);
  };

  const handleEdit = () => {
    dispatch({ type: ACTIONS.THREAD_REPLY, payload: item });
    dispatch({ type: ACTIONS.IS_EDIT_REPLY, payload: true });
  };

  const handleCopyLink = async () => {
    const parentThreadId = thread?.thread_id || item?.thread_id;
    const resolvedOrgSlug =
      orgSlug ||
      (typeof window !== "undefined"
        ? orgSlugFromPathname(window.location.pathname)
        : "");

    if (!parentThreadId || !id || !resolvedOrgSlug) return;

    const link = buildMessageLink({
      orgSlug: resolvedOrgSlug,
      channelId: id,
      threadId: parentThreadId,
      messageId: item?.id,
      context:
        thread?.channel_type === "DM" || thread?.channel_type === "GroupDm"
          ? "dm"
          : getMessageLinkContext(pathname),
    });

    await navigator.clipboard.writeText(link);
    showInfo("Link copied to clipboard");
    setIsPopoverOpen(false);
  };

  // pin message
  const togglePin = async () => {
    setIsPopoverOpen(false);

    const payload = {
      thread_id: item.thread_id,
      message_id: item?.id,
    };

    await SaveMessage(`/channels/pin/${id}/message`, payload);
  };

  const unPinned = (e: any) => {
    e.stopPropagation();
    dispatch({ type: ACTIONS.THREAD_REPLY, payload: item });
    setUnpinModal(true);
    setIsPopoverOpen(false);
  };

  //

  return (
    <>
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <button
            onClick={(e) => e.stopPropagation()}
            className="py-[7px] px-[10px] hover:bg-gray-200 rounded"
            aria-label="More options"
          >
            <MoreVertical size={18} className="text-[#667085]" />
          </button>
        </PopoverTrigger>

        <PopoverContent
          className="max-width-[350px] p-0 bg-white border border-gray-200 rounded-md shadow-lg"
          align="end"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            className="popover-content"
          >
            {/* <div className="group flex items-center justify-between px-4 py-1 my-3 text-sm text-gray-700 hover:bg-blue-500 hover:text-white cursor-pointer">
              <div className="flex items-center gap-2">
                <BellOff size={16} />
                <span>Turn off notifications for replies</span>
              </div>
            </div>

            <hr /> */}

            <div className="group flex items-center justify-between px-4 py-1 my-2 text-sm text-gray-700 hover:bg-blue-500 hover:text-white cursor-pointer">
              <div className="flex items-center gap-2">
                <Bookmark size={16} />
                <span>Mark unread</span>
              </div>
              <span className="ml-4 text-xs text-gray-400 group-hover:text-white">
                U
              </span>
            </div>

            <hr />

            {/* <div className="group flex items-center justify-between px-4 py-1 my-2 text-sm text-gray-700 hover:bg-blue-500 hover:text-white cursor-pointer">
              <div className="flex items-center gap-2">
                <Clock size={16} />
                <span>Remind me about this</span>
              </div>
              <span className="ml-4 text-xs text-gray-400 group-hover:text-white">
                {">"}
              </span>
            </div>

            <hr /> */}

            <div
              onClick={handleCopyLink}
              className="group flex items-center justify-between px-4 py-1 my-2 text-sm text-gray-700 hover:bg-blue-500 hover:text-white cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Link size={16} />
                <span>Copy link</span>
              </div>
              <span className="ml-4 text-xs text-gray-400 group-hover:text-white">
                L
              </span>
            </div>

            <hr />

            {item.is_pinned ? (
              <div
                onClick={unPinned}
                className="group flex items-center justify-between px-4 py-1 my-2 text-sm text-gray-700 hover:bg-blue-500 hover:text-white cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Pin size={16} />
                  <span>Un-pin from channel</span>
                </div>

                <span className="ml-4 text-xs text-gray-400 group-hover:text-white">
                  P
                </span>
              </div>
            ) : (
              <div
                onClick={togglePin}
                className="group flex items-center justify-between px-4 py-1 my-2 text-sm text-gray-700 hover:bg-blue-500 hover:text-white cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Pin size={16} />
                  <span>Pin to channel</span>
                </div>

                <span className="ml-4 text-xs text-gray-400 group-hover:text-white">
                  P
                </span>
              </div>
            )}

            {/* <hr />

            <div className="group flex items-center justify-between px-4 py-1 my-2 text-sm text-gray-700 hover:bg-blue-500 hover:text-white cursor-pointer">
              <div className="flex items-center gap-2">
                <Users size={16} />
                <span>Start a huddle in thread...</span>
              </div>
            </div> */}

            <hr />

            {user?.user_id === item?.user_id && (
              <>
                <div
                  onClick={handleEdit}
                  className="group flex items-center justify-between px-4 py-1 my-2 text-sm text-gray-700 hover:bg-blue-500 hover:text-white cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Edit size={16} />
                    <span>Edit message</span>
                  </div>
                  <span className="ml-4 text-xs text-gray-400 group-hover:text-white">
                    E
                  </span>
                </div>
                <hr />

                <div
                  onClick={handleDelete}
                  className="group flex items-center justify-between px-4 py-1 my-2 text-sm text-red-500 hover:bg-red-500 hover:text-white cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Trash2 size={16} />
                    <span>Delete message...</span>
                  </div>
                  <span className="ml-4 text-xs group-hover:text-white">
                    delete
                  </span>
                </div>
                <hr />
              </>
            )}

            {/* <div className="group flex items-center justify-between px-4 py-1 my-2 text-sm text-gray-700 hover:bg-blue-500 hover:text-white cursor-pointer">
              <div className="flex items-center gap-2">
                <MoreHorizontal size={16} />
                <span>More message shortcuts...</span>
              </div>
            </div> */}
          </motion.div>
        </PopoverContent>
      </Popover>

      {isPopoverOpen && (
        <div
          className="fixed inset-0 bg-black/1 z-50"
          onClick={() => setIsPopoverOpen(false)}
          aria-hidden="true"
        />
      )}

      <DeleteReplyMessageDialog
        open={deleteMessage}
        setOpen={setDeleteMessage}
        id={id}
      />
      <PinReplyMessageDialog
        open={unpinModal}
        setOpen={setUnpinModal}
        id={id}
      />
    </>
  );
};

const ReplyMore = ({ item }: any) => {
  return <MessageContextMenu item={item} />;
};

export default ReplyMore;
