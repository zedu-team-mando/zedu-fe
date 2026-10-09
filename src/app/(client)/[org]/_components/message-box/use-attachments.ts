import { useCallback, useEffect, useRef, useState } from "react";
import { uuidv7 } from "uuidv7";
import { showError, showInfo } from "~/components/toast/sonner";
import { compressImage } from "~/utils/compress-image";
import { UploadRequest } from "~/utils/new-request";

export type AttachmentStatus = "uploading" | "done" | "failed";

export interface Attachment {
  id: string;
  file: File;
  /** First part of the MIME type: image, video, audio, application, text. */
  type: string;
  /** Object URL for showing the file locally. */
  preview: string;
  status: AttachmentStatus;
  /** File objects returned by the upload endpoint; empty until `done`. */
  uploaded: unknown[];
  /** Set for voice notes. */
  voice?: { content: string; duration: number; timestamp: string };
}

/**
 * The files attached to a message being composed, and their uploads.
 * Each file is tracked by id, so removing one never touches another.
 */
export const useAttachments = () => {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const latest = useRef(attachments);
  // An upload that finishes after its file was removed is discarded.
  const removed = useRef(new Set<string>());

  useEffect(() => {
    latest.current = attachments;
  }, [attachments]);

  useEffect(
    () => () => latest.current.forEach((a) => URL.revokeObjectURL(a.preview)),
    []
  );

  const settle = useCallback((id: string, changes: Partial<Attachment>) => {
    setAttachments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...changes } : a))
    );
  }, []);

  const upload = useCallback(
    async ({ id, file }: Attachment) => {
      try {
        const body = new FormData();
        body.append("files", await compressImage(file));

        // UploadRequest returns the error instead of throwing it.
        const res = await UploadRequest("/files/upload-files", body);
        const uploaded = res?.data?.data;
        const ok = res?.status === 200 || res?.status === 201;
        if (!ok || !Array.isArray(uploaded) || uploaded.length === 0) {
          throw res;
        }
        settle(id, { status: "done", uploaded });
      } catch (error: any) {
        if (removed.current.has(id)) return;
        showError(
          `Couldn't upload ${file.name}`,
          error?.response?.data?.message || "Please try again."
        );
        settle(id, { status: "failed" });
      }
    },
    [settle]
  );

  const add = useCallback(
    (files: File[], voice?: Attachment["voice"]) => {
      const added = files.map(
        (file): Attachment => ({
          id: uuidv7(),
          file,
          type: file.type.split("/")[0],
          preview: URL.createObjectURL(file),
          status: "uploading",
          uploaded: [],
          voice,
        })
      );
      setAttachments((prev) => [...prev, ...added]);
      added.forEach((attachment) => void upload(attachment));
    },
    [upload]
  );

  const remove = useCallback((id: string) => {
    const target = latest.current.find((a) => a.id === id);
    if (!target) return;
    removed.current.add(id);
    URL.revokeObjectURL(target.preview);
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const retry = useCallback(
    (id: string) => {
      const target = latest.current.find((a) => a.id === id);
      if (!target) return;
      settle(id, { status: "uploading" });
      void upload(target);
    },
    [settle, upload]
  );

  const clear = useCallback(() => {
    latest.current.forEach((a) => URL.revokeObjectURL(a.preview));
    setAttachments([]);
  }, []);

  const isUploading = attachments.some((a) => a.status === "uploading");
  const hasFailed = attachments.some((a) => a.status === "failed");

  /** True when nothing is uploading or failed; otherwise tells the user why not. */
  const readyToSend = () => {
    if (isUploading) {
      showInfo("Wait for uploads to finish");
      return false;
    }
    if (hasFailed) {
      showError("Retry or remove failed uploads before sending");
      return false;
    }
    return true;
  };

  return {
    attachments,
    uploaded: attachments
      .filter((a) => a.status === "done")
      .flatMap((a) => a.uploaded),
    readyToSend,
    add,
    remove,
    retry,
    clear,
  };
};
