"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  Bold,
  Italic,
  Strikethrough,
  Link2,
  List,
  ListOrdered,
  Code,
  Smile,
  AtSign,
  Hash,
  Slash,
  SendHorizonal,
  Upload,
} from "lucide-react";
import { useParams } from "next/navigation";
import { uuidv7 } from "uuidv7";
import { EditorContent } from "@tiptap/react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import Picker from "~/components/theme/themed-emoji-picker";
import GifPicker from "~/components/gifs/gif-picker";
import data from "@emoji-mart/data";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import UseTextEditor from "./editor";
import { normalizeOutgoingMessageHtml } from "./editor/normalize-message-html";
import Tooltips from "./tooltip";
import { AttachmentList } from "./message-box/attachment-list";
import { useAttachments } from "./message-box/use-attachments";
import { CHAT_FILE_ACCEPT } from "~/utils/document-files";
import { localGifToFile, type LocalGif } from "~/lib/gifs/local-pack";

const FirstMessageBox = ({ sendMessage }: any) => {
  const { editor, isEmpty } = UseTextEditor();
  const params = useParams();
  const id = params.id as string;
  const uuid = uuidv7();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [isGifPickerOpen, setIsGifPickerOpen] = useState(false);
  const [showFormatting, setShowformatting] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { attachments, uploaded, readyToSend, add, remove, retry, clear } =
    useAttachments();

  const handleSave = () => {
    if (!text || !url) return;

    editor
      ?.chain()
      .focus()
      .insertContent(
        `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`
      )
      .run();

    setOpen(false);
    setText("");
    setUrl("");
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    add(Array.from(files));
  };

  // Handle message submission (no need to upload images here)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const editorText = editor?.getText() ?? "";
    let content = normalizeOutgoingMessageHtml(
      editor?.getHTML() ?? "",
      editorText
    );

    const strippedContent = content?.replace(/<[^>]+>/g, "").trim();

    if (!strippedContent && attachments.length === 0) return;
    if (!readyToSend()) return;

    editor?.commands?.clearContent();
    clear();

    sendMessage(id, uuid, content, uploaded);
  };

  const handleKeyDown = (event: any) => {
    if (event.key === "Enter") {
      if (event.shiftKey) {
        return;
      } else {
        event.preventDefault();
        handleSubmit(event);
      }
    }
  };

  const onEmojiClick = (emojiData: any) => {
    const native = emojiData?.native as string | undefined;
    if (!editor || !native) return;
    setIsEmojiPickerOpen(false);
    queueMicrotask(() => {
      editor.chain().focus().insertContent(native).run();
    });
  };

  const handleGifSelect = async (gif: LocalGif) => {
    setIsGifPickerOpen(false);

    try {
      add([await localGifToFile(gif)]);
    } catch (error) {
      console.error("GIF select failed", error);
    }
  };

  const handleMentionClick = () => {
    editor?.chain().focus().insertContent("@").run();
  };

  const handleChannelMentionClick = () => {
    editor?.chain().focus().insertContent("#").run();
  };

  const handleSlashCommandClick = () => {
    editor?.chain().focus().insertContent("/").run();
  };

  useEffect(() => {
    if (editor) {
      editor.commands.focus();
    }
  }, [editor]);

  //

  return (
    <>
      <div
        onClick={() => editor && editor.commands.focus()}
        className={`bg-white border rounded-xl mx-3 md:mx-5 border-[#E6EAEF]`}
      >
        {showFormatting && (
          <div className="border-b border-[#E6EAEF] flex items-center gap-2 bg-[#F9FAFB] pl-3 pr-4 py-[5px]">
            <button
              onClick={() => editor?.chain().focus().toggleBold().run()}
              className={`p-1.5 hover:bg-gray-100 rounded ${
                editor?.isActive("bold")
                  ? "bg-gray-200 font-semibold text-black"
                  : ""
              }`}
            >
              <Bold
                size={18}
                color={editor?.isActive("bold") ? "#444444" : "#CACACA"}
              />
            </button>

            <button
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              className={`p-1.5 hover:bg-gray-100 rounded ${
                editor?.isActive("italic")
                  ? "bg-gray-200 font-semibold text-black"
                  : ""
              }`}
            >
              <Italic
                size={18}
                color={editor?.isActive("italic") ? "#444444" : "#CACACA"}
              />
            </button>

            <button
              onClick={() => editor?.chain().focus().toggleStrike().run()}
              className={`p-1.5 hover:bg-gray-100 rounded ${
                editor?.isActive("strike")
                  ? "bg-gray-200 font-semibold text-black"
                  : ""
              }`}
            >
              <Strikethrough
                size={18}
                color={editor?.isActive("strike") ? "#444444" : "#CACACA"}
              />
            </button>

            <div className="w-px h-5 bg-[#E6EAEF]" />

            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <button
                  onClick={() => setOpen(true)}
                  className={`p-1.5 hover:bg-gray-100 rounded ${editor?.isActive("link") ? "bg-gray-200 font-semibold text-black" : ""}`}
                >
                  <Link2
                    size={18}
                    color={editor?.isActive("link") ? "#444444" : "#CACACA"}
                  />
                </button>
              </DialogTrigger>

              <DialogContent className="w-full max-w-md">
                <DialogHeader>
                  <DialogTitle className="font-semibold">Add link</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Text</label>
                  <Input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Enter link text"
                  />

                  <label className="text-sm font-medium mt-2">Link</label>
                  <Input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Enter URL"
                    type="url"
                  />
                </div>

                <DialogFooter className="mt-4 flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={!text || !url}
                    className="bg-blue-500 text-white px-10"
                  >
                    Save
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <button
              onClick={() => editor?.chain().focus().toggleOrderedList().run()}
              className={`p-1.5 hover:bg-gray-100 rounded ${
                editor?.isActive("orderedList")
                  ? "bg-gray-200 font-semibold text-black"
                  : ""
              }`}
            >
              <ListOrdered
                size={18}
                color={editor?.isActive("orderedList") ? "#444444" : "#CACACA"}
              />
            </button>

            <button
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
              className={`p-1.5 hover:bg-gray-100 rounded ${
                editor?.isActive("bulletList")
                  ? "bg-gray-200 font-semibold text-black"
                  : ""
              }`}
            >
              <List
                size={18}
                color={editor?.isActive("bulletList") ? "#444444" : "#CACACA"}
              />
            </button>

            <div className="w-px h-5 bg-[#E6EAEF]" />

            <button
              onClick={() => editor?.chain().focus().toggleCode().run()}
              className={`p-1.5 hover:bg-gray-100 rounded ${
                editor?.isActive("code")
                  ? "bg-gray-200 font-semibold text-black"
                  : ""
              }`}
            >
              <Code
                size={18}
                color={editor?.isActive("code") ? "#444444" : "#CACACA"}
              />
            </button>
          </div>
        )}

        <div className="md:flex-1 relative px-3">
          <EditorContent
            editor={editor}
            className="py-2 rounded-md flex flex-row overflow-auto"
            onKeyDown={handleKeyDown}
          />

          <AttachmentList
            attachments={attachments}
            onRemove={remove}
            onRetry={retry}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 py-2 pl-3 pr-4">
            <Tooltips text="Upload from your computer">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 hover:bg-gray-100 rounded-full bg-[#F2F4F7]"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                  accept={CHAT_FILE_ACCEPT}
                  multiple
                />

                <Upload size={18} color="#606060" />
              </button>
            </Tooltips>

            <Tooltips
              text={!showFormatting ? "Show formatting" : "Hide formatting"}
            >
              <button
                onClick={() => setShowformatting((prev) => !prev)}
                className="p-1.5 hover:bg-gray-100 rounded text-[#606060] underline"
              >
                Aa
              </button>
            </Tooltips>

            <Tooltips text="Emoji">
              <div className="relative">
                <Popover
                  open={isEmojiPickerOpen}
                  onOpenChange={(open) => {
                    setIsEmojiPickerOpen(open);
                    if (open) setIsGifPickerOpen(false);
                  }}
                >
                  <PopoverTrigger asChild>
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 hover:bg-gray-100 rounded"
                    >
                      <Smile size={18} color="#606060" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 w-full max-w-xs">
                    <Picker data={data} onEmojiSelect={onEmojiClick} />
                  </PopoverContent>
                </Popover>
              </div>
            </Tooltips>

            <Tooltips text="GIF">
              <div className="relative">
                <Popover
                  open={isGifPickerOpen}
                  onOpenChange={(open) => {
                    setIsGifPickerOpen(open);
                    if (open) setIsEmojiPickerOpen(false);
                  }}
                >
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      onClick={(e) => e.stopPropagation()}
                      className="px-1.5 py-1 hover:bg-gray-100 rounded"
                      aria-label="GIF"
                    >
                      <span className="block text-[10px] font-bold leading-none tracking-wide text-[#606060] border border-[#606060] rounded px-1 py-0.5">
                        GIF
                      </span>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-0 border-0 shadow-none"
                    align="start"
                  >
                    <GifPicker onSelect={handleGifSelect} />
                  </PopoverContent>
                </Popover>
              </div>
            </Tooltips>

            <Tooltips text="Mention someone">
              <button
                onClick={handleMentionClick}
                className="p-1.5 hover:bg-gray-100 rounded"
              >
                <AtSign size={18} color="#606060" />
              </button>
            </Tooltips>

            <Tooltips text="Mention a channel">
              <button
                onClick={handleChannelMentionClick}
                className="p-1.5 hover:bg-gray-100 rounded"
              >
                <Hash size={18} color="#606060" />
              </button>
            </Tooltips>

            <Tooltips text="Slash commands">
              <button
                onClick={handleSlashCommandClick}
                className="p-1.5 hover:bg-gray-100 rounded"
              >
                <Slash size={18} color="#606060" />
              </button>
            </Tooltips>
          </div>

          <div className="flex items-center gap-1 py-2 pl-3 pr-4">
            <button
              type="submit"
              className="p-1.5 hover:bg-gray-100 rounded size-8 flex items-center justify-center"
              onClick={handleSubmit}
              disabled={isEmpty && attachments.length === 0}
            >
              <SendHorizonal
                className={
                  isEmpty && attachments.length === 0
                    ? "text-[#999] dark:text-zinc-500"
                    : "text-zinc-900 dark:text-zinc-100"
                }
              />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default FirstMessageBox;
