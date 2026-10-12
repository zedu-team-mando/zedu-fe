"use client";

import ChannelDetailsDialog from "../channel-details-dialog";
import ChannelExportModal from "../channel-export/channel-export-modal";
import { useParams, useRouter } from "next/navigation";
import {
  useState,
  useRef,
  useEffect,
  useContext,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { cn } from "~/lib/utils";
import NotificationSettingsModal from "../notification-modal";
import { ACTIONS } from "~/store/Actions";
import { DataContext } from "~/store/GlobalState";
import { PostRequest } from "~/utils/new-request";
import Loading from "~/components/ui/loading";
import { useRBAC } from "~/hooks/useRBAC";
import { showError, showSuccess } from "~/components/toast/sonner";

interface MenuDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const MenuDropdown = ({ isOpen, onClose }: MenuDropdownProps) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { state, dispatch } = useContext(DataContext);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { hasPermission } = useRBAC();
  const canManageChannels = hasPermission("manage:channels");

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const isInsideDialog = (event.target as Element).closest(
        '[role="dialog"]'
      );
      if (isInsideDialog) return;

      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  const menuItemClass =
    "px-4 py-[10px] text-[15px] text-[#101828] hover:bg-[#F1F1FE] flex items-center justify-between cursor-pointer";
  const dividerClass = "h-px bg-[#E6EAEF]";

  const isStarred = Boolean(state?.channelDetails?.is_starred);

  const handleToggleStar = async (e: ReactMouseEvent) => {
    e.stopPropagation();
    if (!id || buttonLoading) return;
    setButtonLoading(true);

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
    } catch {
      showError("Failed to update starred status");
    } finally {
      setButtonLoading(false);
      onClose();
    }
  };

  const handleLeave = async () => {
    setButtonLoading(true);

    const res = await PostRequest(`/channels/${id}/leave`, {});
    if (res?.status === 200 || res?.status === 201) {
      dispatch({
        type: ACTIONS.LEAVE_CALLBACK,
        payload: !state?.leaveCallback,
      });
      onClose();
    }
    setButtonLoading(false);
  };

  const handleOpenExport = (event: ReactMouseEvent) => {
    event.stopPropagation();
    setExportOpen(true);
    onClose();
  };

  return (
    <>
      {isOpen ? (
        <div
          ref={dropdownRef}
          className="absolute top-full right-0 w-[220px] mt-2.5 bg-white rounded-[7px] shadow-lg border border-[#E6EAEF] z-20"
          onClick={() =>
            dispatch({ type: ACTIONS.ACTIVE_TAB, payload: "about" })
          }
        >
          <div>
            <ChannelDetailsDialog className={cn(menuItemClass, "w-full")}>
              Open channel details
            </ChannelDetailsDialog>

            <div className={menuItemClass} onClick={handleToggleStar}>
              {isStarred ? "Unstar channel" : "Star channel"}
            </div>

            <NotificationSettingsModal />

            <div className={menuItemClass} onClick={handleOpenExport}>
              Export
            </div>

            <div
              className={menuItemClass}
              onClick={() => {
                dispatch({
                  type: ACTIONS.CONVERSATION_SEARCH_OPEN,
                  payload: true,
                });
                onClose();
              }}
            >
              Search
            </div>

            {canManageChannels ? (
              <div
                className={menuItemClass}
                onClick={() => {
                  onClose();
                  router.push(
                    `/${state?.orgSlug}/home/channels/${id}/settings`
                  );
                }}
              >
                Channel settings
              </div>
            ) : null}

            <div className={dividerClass} />

            <div
              className={`${menuItemClass} text-[#B00E03]`}
              onClick={handleLeave}
            >
              Leave channel{" "}
              {buttonLoading && (
                <Loading color="red" height="15px" width="15px" />
              )}
            </div>
          </div>
        </div>
      ) : null}

      <ChannelExportModal
        open={exportOpen}
        onOpenChange={setExportOpen}
        channelId={id}
      />
    </>
  );
};

export default MenuDropdown;
