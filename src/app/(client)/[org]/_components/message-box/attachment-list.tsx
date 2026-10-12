"use client";

import { Fragment } from "react";
import Image from "next/image";
import { FileIcon, RotateCw, XIcon } from "lucide-react";
import Loading from "~/components/ui/loading";
import { VoiceThumbnails } from "../voice/voice-thumbnails";
import type { Attachment } from "./use-attachments";

interface AttachmentListProps {
  attachments: Attachment[];
  onRemove: (id: string) => void;
  onRetry: (id: string) => void;
}

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400";

const RetryButton = ({
  name,
  onClick,
  className,
}: {
  name: string;
  onClick: () => void;
  className: string;
}) => (
  <button
    type="button"
    aria-label={`Retry upload of ${name}`}
    onClick={onClick}
    className={`flex items-center justify-center rounded-full bg-red-500 text-white h-7 w-7 ${focusRing} ${className}`}
  >
    <RotateCw size={14} />
  </button>
);

const Tile = ({
  attachment: { id, file, type, preview, status },
  onRemove,
  onRetry,
}: {
  attachment: Attachment;
  onRemove: AttachmentListProps["onRemove"];
  onRetry: AttachmentListProps["onRetry"];
}) => (
  <div className="relative w-[70px] h-[70px]">
    {type === "image" ? (
      <Image
        src={preview}
        alt={file.name}
        width={70}
        height={70}
        className="w-[70px] h-[70px] rounded-md object-cover border border-primary-400 cursor-pointer"
      />
    ) : type === "video" ? (
      <video
        src={preview}
        className="w-[70px] h-[70px] rounded-md border border-primary-400 object-cover"
        controls
      />
    ) : (
      <div className="w-[70px] h-[70px] flex flex-col items-center justify-center border border-primary-500 rounded-md bg-gray-100 p-1 text-center">
        <a
          href={preview}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center"
        >
          <FileIcon size={24} color="#606060" />
          <span className="text-xs text-blue-500 mt-1">
            {file.name.split(".").pop()?.toUpperCase()}
          </span>
        </a>
      </div>
    )}

    {status === "uploading" && (
      <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50">
        <Loading />
      </div>
    )}

    {status === "failed" && (
      <div
        title="Upload failed"
        className="absolute inset-0 flex items-center justify-center rounded-md border border-red-500 bg-red-50/80"
      >
        <RetryButton
          name={file.name}
          onClick={() => onRetry(id)}
          className=""
        />
      </div>
    )}

    <button
      type="button"
      aria-label={`Remove ${file.name}`}
      onClick={() => onRemove(id)}
      className={`absolute -top-1 -right-2 z-10 p-1 bg-gray-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center ${focusRing}`}
    >
      <XIcon size={14} />
    </button>
  </div>
);

/** The files and voice notes attached to a message, with their upload state. */
export const AttachmentList = ({
  attachments,
  onRemove,
  onRetry,
}: AttachmentListProps) => {
  const files = attachments.filter((a) => !a.voice);
  const voices = attachments.filter((a) => a.voice);

  return (
    <>
      <div className={`flex gap-3 ${files.length > 0 ? "mt-3" : ""}`}>
        {files.map((attachment) => (
          <Tile
            key={attachment.id}
            attachment={attachment}
            onRemove={onRemove}
            onRetry={onRetry}
          />
        ))}
      </div>

      <div className={`flex gap-3 ${voices.length > 0 ? "mt-3" : ""}`}>
        {voices.map(({ id, file, preview, status, voice }) => (
          <Fragment key={id}>
            <VoiceThumbnails
              audioUrl={preview}
              duration={voice?.duration ?? 0}
              removeVoice={() => onRemove(id)}
            />
            {status === "failed" && (
              <RetryButton
                name={file.name}
                onClick={() => onRetry(id)}
                className="self-center"
              />
            )}
          </Fragment>
        ))}
      </div>
    </>
  );
};
