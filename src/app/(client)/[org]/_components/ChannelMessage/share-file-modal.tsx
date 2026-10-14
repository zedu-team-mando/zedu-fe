"use client";

import { useContext, useMemo, useState } from "react";
import Image from "next/image";
import moment from "moment";
import { Hash, Link2, Lock } from "lucide-react";
import { uuidv7 } from "uuidv7";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { DataContext } from "~/store/GlobalState";
import { PostRequest } from "~/utils/new-request";
import { showError, showInfo, showSuccess } from "~/components/toast/sonner";
import images from "~/assets/images";
import { Media } from "~/types/channel";

type Recipient = {
  key: string;
  type: "channel" | "dm" | "group-dm" | "user";
  label: string;
  subtitle?: string;
  avatar?: string;
  isOnline?: boolean;
  isPrivate?: boolean;
  channelId?: string;
  userId?: string;
};

interface ShareFileModalProps {
  open: boolean;
  onClose: () => void;
  mediaItem: Media;
  item: any;
}

const ShareFileModal = ({
  open,
  onClose,
  mediaItem,
  item,
}: ShareFileModalProps) => {
  const { state } = useContext(DataContext);
  const { channels, orgMembers, dms, user } = state;
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Recipient | null>(null);
  const [isForwarding, setIsForwarding] = useState(false);

  const recipients = useMemo(() => {
    const query = search.trim().toLowerCase();
    const results: Recipient[] = [];

    (channels ?? []).forEach((channel: any) => {
      const name = channel?.name || channel?.channel_slug || "";
      if (query && !name.toLowerCase().includes(query)) return;

      results.push({
        key: `channel-${channel.channels_id}`,
        type: "channel",
        label: name,
        isPrivate: channel?.is_private,
        channelId: channel.channels_id,
      });
    });

    (orgMembers ?? []).forEach((member: any) => {
      if (member.id === user?.id) return;

      const name = member?.name || member?.username || member?.email || "";
      const username = member?.username || "";
      if (
        query &&
        !name.toLowerCase().includes(query) &&
        !username.toLowerCase().includes(query)
      ) {
        return;
      }

      const existingDm = (dms ?? []).find(
        (dm: any) =>
          dm.channel_type === "dm" &&
          (dm.participant_id === member.id ||
            dm.participants?.[0]?.id === member.id)
      );

      results.push({
        key: `user-${member.id}`,
        type: existingDm ? "dm" : "user",
        label: member?.username || name,
        subtitle: name,
        avatar:
          member?.profile_url ||
          member?.avatar_url ||
          member?.default_avatar_url,
        isOnline: member?.online || member?.is_online,
        channelId: existingDm?.channel_id,
        userId: member.id,
      });
    });

    return results;
  }, [channels, orgMembers, dms, user?.id, search]);

  const resetAndClose = () => {
    setSearch("");
    setSelected(null);
    onClose();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(mediaItem.file_link);
    showInfo("Link copied to clipboard");
  };

  const handleForward = async () => {
    if (!selected) return;

    setIsForwarding(true);

    try {
      const threadId = uuidv7();
      const payload = {
        content: "<p></p>",
        thread_id: threadId,
        media: [mediaItem],
      };

      if (selected.type === "channel") {
        const res = await PostRequest(
          `/threads/${selected.channelId}`,
          payload
        );

        if (res?.status !== 200 && res?.status !== 201) {
          throw new Error("Failed to forward file");
        }
      } else {
        let channelId = selected.channelId;

        if (selected.type === "user") {
          const orgId = localStorage.getItem("orgId") || "";
          const res = await PostRequest(`/organisations/${orgId}/dms`, {
            chat_type: "user",
            participant_id: selected.userId,
          });

          if (res?.status !== 200 && res?.status !== 201) {
            throw new Error("Failed to open conversation");
          }

          channelId = res?.data?.data?.channel_id;
        }

        const endpoint =
          selected.type === "group-dm"
            ? `/group-dms/channels/${channelId}/threads`
            : `/dms/channels/${channelId}/threads`;

        const res = await PostRequest(endpoint, payload);

        if (res?.status !== 200 && res?.status !== 201) {
          throw new Error("Failed to forward file");
        }
      }

      showSuccess("File forwarded");
      resetAndClose();
    } catch {
      showError("Could not forward file");
    } finally {
      setIsForwarding(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) resetAndClose();
      }}
    >
      <DialogContent
        overlayClassName="z-[80]"
        className="z-[80] max-w-md p-0 gap-0 overflow-hidden"
      >
        <DialogHeader className="px-5 py-4 border-b">
          <DialogTitle className="text-base font-semibold">
            Share this file
          </DialogTitle>
        </DialogHeader>

        <div className="px-5 py-4 space-y-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search for channel or person"
            className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:border-[#7141f8] focus:ring-2 focus:ring-[#7141f8]/20"
          />

          <div className="max-h-56 overflow-y-auto rounded-md border">
            {recipients.length === 0 ? (
              <p className="px-3 py-4 text-sm text-gray-500 text-center">
                No channels or people found
              </p>
            ) : (
              recipients.map((recipient) => (
                <button
                  key={recipient.key}
                  type="button"
                  onClick={() => setSelected(recipient)}
                  className={`flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-gray-50 ${
                    selected?.key === recipient.key ? "bg-blue-50" : ""
                  }`}
                >
                  {recipient.type === "channel" ? (
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-gray-100 text-gray-600">
                      {recipient.isPrivate ? (
                        <Lock size={16} />
                      ) : (
                        <Hash size={16} />
                      )}
                    </div>
                  ) : (
                    <Image
                      src={recipient.avatar || images.user}
                      alt={recipient.label}
                      width={32}
                      height={32}
                      unoptimized
                      className="h-8 w-8 rounded object-cover"
                    />
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold">
                        {recipient.type === "channel"
                          ? recipient.label
                          : recipient.label}
                      </p>
                      {recipient.isOnline && (
                        <span className="h-2 w-2 shrink-0 rounded-full bg-green-500" />
                      )}
                    </div>
                    {recipient.subtitle && (
                      <p className="truncate text-xs text-gray-500">
                        {recipient.subtitle}
                      </p>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>

          <div className="min-w-0 rounded-md border bg-gray-50 px-3 py-2">
            <p className="text-xs text-gray-500">
              {item?.username}{" "}
              {item?.created_at
                ? moment(item.created_at).format("MMM D [at] h:mm A")
                : ""}
            </p>
            <p className="break-all text-sm font-medium">
              {mediaItem.file_name}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between border-t px-5 py-4">
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 text-sm text-[#5F5FE1] hover:underline"
          >
            <Link2 size={16} />
            Copy Link
          </button>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={resetAndClose}>
              Cancel
            </Button>
            <Button
              onClick={handleForward}
              disabled={!selected || isForwarding}
              className="bg-[#7141f8] text-white hover:bg-[#7141f8]/90 disabled:opacity-50"
            >
              {isForwarding ? "Forwarding..." : "Forward"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareFileModal;
