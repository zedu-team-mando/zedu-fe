import { useContext, useRef, useState } from "react";
import { Extension, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Mention from "@tiptap/extension-mention";
import Link from "@tiptap/extension-link";
import { DataContext } from "~/store/GlobalState";
import { ACTIONS } from "~/store/Actions";
import Code from "@tiptap/extension-code";
import HardBreak from "@tiptap/extension-hard-break";
import SlackCodeBlock from "./slack-code-block";
import { AppleEmoji } from "./apple-emoji";

// Shift+Enter: MessageHardBreak. Plain Enter: message-box (send / lists).
const MessageHardBreak = HardBreak.extend({
  addKeyboardShortcuts() {
    return {
      "Shift-Enter": () => this.editor.commands.setHardBreak(),
      "Mod-Enter": () => this.editor.commands.setHardBreak(),
    };
  },
});

// ProseMirror handles keydown before the wrapper's React onKeyDown, so its default
// Enter (split block / list item) ran before the send. Claim plain Enter here and let
// the wrapper send or split the list; code blocks keep the default new line.
const MessageEnter = Extension.create({
  name: "messageEnter",
  priority: 1000,
  addKeyboardShortcuts() {
    return {
      Enter: () => !this.editor.isActive("codeBlock"),
    };
  },
});

const SLASH_COMMAND_ICON = "/image/TelexIcon.svg";
const CHANNEL_MENTION_ICON = "/images/megaphone.png";
/** Backend id for @channel (notify everyone in this channel). */
export const CHANNEL_MENTION_ID = "00000000-0000-0000-0000-000000000000";

const createChannelMentionItem = () => ({
  id: CHANNEL_MENTION_ID,
  name: "@channel",
  avatar_url: CHANNEL_MENTION_ICON,
  full_name: "Notify everyone in this channel",
  is_online: false,
  type: "user",
});

const SLASH_COMMANDS: {
  id: string;
  label: string;
  description: string;
  icon: string;
}[] = [
  {
    id: "remind",
    label: "remind",
    description: "Set a reminder",
    icon: SLASH_COMMAND_ICON,
  },
  {
    id: "poll",
    label: "invite",
    description: "Invite someone to this channel",
    icon: SLASH_COMMAND_ICON,
  },
  {
    id: "giphy",
    label: "remove",
    description: "Remove someone from this channel",
    icon: SLASH_COMMAND_ICON,
  },
  {
    id: "code",
    label: "archive",
    description: "Archive this channel",
    icon: SLASH_COMMAND_ICON,
  },
  {
    id: "me",
    label: "me",
    description: "Display an action message (emote style)",
    icon: SLASH_COMMAND_ICON,
  },
  {
    id: "shrug",
    label: "collapse",
    description: "Collapse the current thread",
    icon: SLASH_COMMAND_ICON,
  },
  {
    id: "tableflip",
    label: "expand",
    description: "Expand the current thread",
    icon: SLASH_COMMAND_ICON,
  },
  {
    id: "todo",
    label: "join",
    description: "Join this channel",
    icon: SLASH_COMMAND_ICON,
  },
  {
    id: "quote",
    label: "leave",
    description: "Leave this channel",
    icon: SLASH_COMMAND_ICON,
  },
  {
    id: "help",
    label: "open",
    description: "Open another channel or conversation",
    icon: SLASH_COMMAND_ICON,
  },
];

type PopulateFn = (
  component: HTMLElement,
  query: string,
  command: (payload: { id: string; label: string }) => void,
  clientRect: (() => DOMRect | null) | null | undefined
) => void;

function createSuggestionRender(getPopulateFn: () => PopulateFn) {
  return () => {
    let component: HTMLElement | null = null;
    let currentHoveredIndex = -1;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!component) return;
      const suggestionButtons = Array.from(
        component.querySelectorAll("button")
      );
      if (suggestionButtons.length === 0) return;

      if (event.key === "ArrowDown") {
        event.preventDefault();
        event.stopPropagation();
        if (
          currentHoveredIndex !== -1 &&
          suggestionButtons[currentHoveredIndex]
        ) {
          suggestionButtons[currentHoveredIndex].classList.remove("hover");
          const currentNameSpan =
            suggestionButtons[currentHoveredIndex].querySelector(".name-span");
          const currentSecondarySpan =
            suggestionButtons[currentHoveredIndex].querySelector(
              ".secondary-span"
            );
          if (currentNameSpan) currentNameSpan.classList.remove("text-white");
          if (currentSecondarySpan)
            currentSecondarySpan.classList.remove("text-white");
        }
        currentHoveredIndex =
          (currentHoveredIndex + 1) % suggestionButtons.length;
        const nextButton = suggestionButtons[currentHoveredIndex];
        if (nextButton) {
          nextButton.classList.add("hover");
          const nextNameSpan = nextButton.querySelector(".name-span");
          const nextSecondarySpan = nextButton.querySelector(".secondary-span");
          if (nextNameSpan) nextNameSpan.classList.add("text-white");
          if (nextSecondarySpan) nextSecondarySpan.classList.add("text-white");
          nextButton.scrollIntoView({ block: "nearest" });
        }
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        event.stopPropagation();
        if (
          currentHoveredIndex !== -1 &&
          suggestionButtons[currentHoveredIndex]
        ) {
          suggestionButtons[currentHoveredIndex].classList.remove("hover");
          const currentNameSpan =
            suggestionButtons[currentHoveredIndex].querySelector(".name-span");
          const currentSecondarySpan =
            suggestionButtons[currentHoveredIndex].querySelector(
              ".secondary-span"
            );
          if (currentNameSpan) currentNameSpan.classList.remove("text-white");
          if (currentSecondarySpan)
            currentSecondarySpan.classList.remove("text-white");
        }
        currentHoveredIndex =
          (currentHoveredIndex - 1 + suggestionButtons.length) %
          suggestionButtons.length;
        const prevButton = suggestionButtons[currentHoveredIndex];
        if (prevButton) {
          prevButton.classList.add("hover");
          const prevNameSpan = prevButton.querySelector(".name-span");
          const prevSecondarySpan = prevButton.querySelector(".secondary-span");
          if (prevNameSpan) prevNameSpan.classList.add("text-white");
          if (prevSecondarySpan) prevSecondarySpan.classList.add("text-white");
          prevButton.scrollIntoView({ block: "nearest" });
        }
      } else if (event.key === "Enter") {
        const selectedButton = component.querySelector(
          "button.hover"
        ) as HTMLElement | null;
        if (selectedButton) {
          event.preventDefault();
          event.stopPropagation();
          selectedButton.click();
        } else if (suggestionButtons.length === 1) {
          event.preventDefault();
          event.stopPropagation();
          suggestionButtons[0].click();
        }
      } else if (event.key === "Escape") {
        component.remove();
        component = null;
        currentHoveredIndex = -1;
        event.preventDefault();
        event.stopPropagation();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (component && !component.contains(event.target as Node)) {
        component.remove();
        component = null;
        currentHoveredIndex = -1;
      }
    };

    return {
      onStart: (props: any) => {
        const { query, command: cmd, clientRect } = props;
        component = document.createElement("div");
        component.className =
          "absolute border border-gray-300 rounded-lg shadow-lg bg-[#F9FAFB] overflow-y-auto z-50";
        component.style.minWidth = "500px";
        component.style.width = "500px";
        document.body.appendChild(component);
        document.addEventListener("keydown", handleKeyDown, true);
        document.addEventListener("mousedown", handleClickOutside);
        getPopulateFn()(component, query, cmd, clientRect ?? null);
        const firstButton = component.querySelector("button");
        if (firstButton) {
          firstButton.classList.add("hover");
          const firstNameSpan = firstButton.querySelector(".name-span");
          const firstSecondarySpan =
            firstButton.querySelector(".secondary-span");
          if (firstNameSpan) firstNameSpan.classList.add("text-white");
          if (firstSecondarySpan)
            firstSecondarySpan.classList.add("text-white");
          currentHoveredIndex = 0;
        } else {
          currentHoveredIndex = -1;
        }
      },
      onUpdate: (props: any) => {
        const { query, command: cmd, clientRect } = props;
        if (!component) return;
        component.innerHTML = "";
        getPopulateFn()(component, query, cmd, clientRect ?? null);
        const firstButton = component.querySelector("button");
        if (firstButton) {
          firstButton.classList.add("hover");
          const firstNameSpan = firstButton.querySelector(".name-span");
          const firstSecondarySpan =
            firstButton.querySelector(".secondary-span");
          if (firstNameSpan) firstNameSpan.classList.add("text-white");
          if (firstSecondarySpan)
            firstSecondarySpan.classList.add("text-white");
          currentHoveredIndex = 0;
        } else {
          currentHoveredIndex = -1;
        }
      },
      onExit: () => {
        if (component) component.remove();
        document.removeEventListener("keydown", handleKeyDown, true);
        document.removeEventListener("mousedown", handleClickOutside);
        component = null;
        currentHoveredIndex = -1;
      },
    };
  };
}

const UseTextEditor = (
  subscription?: any,
  handleImagePaste?: any,
  handleTyping?: (isTyping: boolean) => void
) => {
  const { state, dispatch } = useContext(DataContext);
  const name = localStorage.getItem("channelName") || "";
  const [isEmpty, setIsEmpty] = useState(true);

  const memberPopulateRef = useRef<PopulateFn>(null!);
  const channelPopulateRef = useRef<PopulateFn>(null!);
  const slashPopulateRef = useRef<PopulateFn>(null!);
  const handleTypingRef = useRef(handleTyping);
  handleTypingRef.current = handleTyping;

  const populateMemberMentions: PopulateFn = (
    component,
    query,
    command,
    clientRect
  ) => {
    const queryString = String(query || "").toLowerCase();
    const mentionMembers = state?.mentionOrgMembers || state?.orgMembers || [];
    const members = mentionMembers.filter((item: any) =>
      (item.name || item.email).toLowerCase().includes(queryString)
    );
    const includeChannel =
      queryString === "" || "@channel".includes(queryString);
    const channelMentionItem = createChannelMentionItem();
    const filteredItems = includeChannel
      ? [channelMentionItem, ...members]
      : members;

    if (filteredItems.length === 0) {
      component.style.display = "none";
      return;
    }
    component.style.display = "";

    const coords = typeof clientRect === "function" ? clientRect() : null;
    if (coords && component) {
      const editorTop = coords.top + window.scrollY;
      const itemHeight = 48;
      const calculatedHeight = filteredItems.length * itemHeight;
      const maxHeight = 300;
      const dropdownHeight = Math.min(calculatedHeight, maxHeight);
      const isAbove = editorTop > dropdownHeight + itemHeight;
      const dropdownTop = isAbove
        ? editorTop - dropdownHeight - coords.height
        : coords.bottom + window.scrollY;
      Object.assign(component.style, {
        top: `${dropdownTop}px`,
        left: `${coords.left + window.scrollX}px`,
        maxHeight: `${maxHeight}px`,
        minWidth: "500px",
        width: "500px",
      });
    }

    filteredItems.forEach((item: any) => {
      const button = document.createElement("button");
      button.className =
        "group flex items-center px-3 py-2 text-left w-full gap-3";

      button.addEventListener("mouseover", () => {
        const buttons = Array.from(component.querySelectorAll("button"));
        buttons.forEach((btn, idx) => {
          if (btn === button) {
            if (!btn.classList.contains("hover")) {
              btn.classList.add("hover");
              const nameSpan = btn.querySelector(".name-span");
              const secondarySpan = btn.querySelector(".secondary-span");
              if (nameSpan) nameSpan.classList.add("text-white");
              if (secondarySpan) secondarySpan.classList.add("text-white");
            }
          } else {
            if (btn.classList.contains("hover")) {
              btn.classList.remove("hover");
              const nameSpan = btn.querySelector(".name-span");
              const secondarySpan = btn.querySelector(".secondary-span");
              if (nameSpan) nameSpan.classList.remove("text-white");
              if (secondarySpan) secondarySpan.classList.remove("text-white");
            }
          }
        });
      });

      const avatarContainer = document.createElement("div");
      const isChannelMention =
        item.id === CHANNEL_MENTION_ID || item.name === "@channel";
      avatarContainer.className = isChannelMention
        ? "w-6 h-6 flex items-center justify-center rounded-md overflow-hidden flex-shrink-0"
        : "w-6 h-6 flex items-center justify-center rounded-md bg-gray-200 text-white font-bold text-sm overflow-hidden flex-shrink-0";
      avatarContainer.style.minWidth = "1.5rem";
      avatarContainer.style.minHeight = "1.5rem";
      const img = document.createElement("img");
      img.src =
        item.avatar_url ||
        item.default_avatar_url ||
        item.profile_url ||
        "/images/user.png";
      img.alt = item.name || item.email;
      img.className = isChannelMention
        ? "w-full h-full rounded-md object-contain"
        : "w-full h-full rounded-md object-cover border";
      avatarContainer.appendChild(img);

      const textContainer = document.createElement("div");
      textContainer.className = "flex items-center gap-2";
      const mainTextLine = document.createElement("div");
      mainTextLine.className = "flex items-center gap-2";
      const nameSpan = document.createElement("span");
      nameSpan.textContent = item.name || item.email;
      nameSpan.className =
        "text-sm font-bold capitalize text-gray-800 name-span";
      const status = document.createElement("div");
      if (item.name !== "@channel") {
        status.className = "size-2 rounded-full border border-gray-500";
      }
      mainTextLine.appendChild(nameSpan);
      if (item.id !== CHANNEL_MENTION_ID) mainTextLine.appendChild(status);

      const secondaryTextSpan = document.createElement("span");
      secondaryTextSpan.textContent =
        item?.id === CHANNEL_MENTION_ID
          ? item.full_name
          : item.role !== "bot"
            ? item.name
            : "";
      secondaryTextSpan.className = "text-xs text-gray-500 secondary-span";
      textContainer.appendChild(mainTextLine);
      if (secondaryTextSpan.textContent) {
        textContainer.appendChild(secondaryTextSpan);
      }

      button.appendChild(avatarContainer);
      button.appendChild(textContainer);

      button.onclick = () => {
        let labelText = item.name;
        if (!labelText || labelText.trim() === "") labelText = item.email;
        const finalLabel = labelText.replace(/^@/, "");
        const isBroadcastChannelMention =
          item.id === CHANNEL_MENTION_ID || item.name === "@channel";
        const mentionId = isBroadcastChannelMention
          ? CHANNEL_MENTION_ID
          : item.id;
        const mentionCommandPayload = { id: mentionId, label: finalLabel };
        const mentionForDispatch = isBroadcastChannelMention
          ? { id: CHANNEL_MENTION_ID, type: "user" as const }
          : { id: item.id, label: finalLabel, type: "user" as const };
        if (!state.mentions.some((m: any) => m.id === mentionForDispatch.id)) {
          dispatch({ type: ACTIONS.MENTIONS, payload: [mentionForDispatch] });
        }
        command(mentionCommandPayload);
      };
      component.appendChild(button);
    });
  };
  memberPopulateRef.current = populateMemberMentions;

  const populateChannelMentions: PopulateFn = (
    component,
    query,
    command,
    clientRect
  ) => {
    const queryString = String(query || "").toLowerCase();
    const channels = state?.channels ?? [];
    const filteredChannels = channels.filter((channel: any) => {
      const chName = (channel?.name || "").toLowerCase();
      const slug = (channel?.channel_slug || "").toLowerCase();
      return chName.includes(queryString) || slug.includes(queryString);
    });

    if (filteredChannels.length === 0) {
      component.style.display = "none";
      return;
    }
    component.style.display = "";

    const coords = typeof clientRect === "function" ? clientRect() : null;
    if (coords && component) {
      const editorTop = coords.top + window.scrollY;
      const itemHeight = 48;
      const calculatedHeight = filteredChannels.length * itemHeight;
      const maxHeight = 300;
      const dropdownHeight = Math.min(calculatedHeight, maxHeight);
      const isAbove = editorTop > dropdownHeight + itemHeight;
      const dropdownTop = isAbove
        ? editorTop - dropdownHeight - coords.height
        : coords.bottom + window.scrollY;
      Object.assign(component.style, {
        top: `${dropdownTop}px`,
        left: `${coords.left + window.scrollX}px`,
        maxHeight: `${maxHeight}px`,
        minWidth: "500px",
        width: "500px",
      });
    }

    filteredChannels.forEach((channel: any) => {
      const button = document.createElement("button");
      button.className =
        "group flex items-center px-3 py-2 text-left w-full gap-3";

      button.addEventListener("mouseover", () => {
        const buttons = Array.from(component.querySelectorAll("button"));
        buttons.forEach((btn, idx) => {
          if (btn === button) {
            if (!btn.classList.contains("hover")) {
              btn.classList.add("hover");
              const nameSpan = btn.querySelector(".name-span");
              const secondarySpan = btn.querySelector(".secondary-span");
              if (nameSpan) nameSpan.classList.add("text-white");
              if (secondarySpan) secondarySpan.classList.add("text-white");
            }
          } else {
            if (btn.classList.contains("hover")) {
              btn.classList.remove("hover");
              const nameSpan = btn.querySelector(".name-span");
              const secondarySpan = btn.querySelector(".secondary-span");
              if (nameSpan) nameSpan.classList.remove("text-white");
              if (secondarySpan) secondarySpan.classList.remove("text-white");
            }
          }
        });
      });

      const avatarContainer = document.createElement("div");
      avatarContainer.className =
        "w-6 h-6 flex items-center justify-center rounded-md bg-gray-200 text-primary-600 font-bold text-sm overflow-hidden flex-shrink-0";
      avatarContainer.style.minWidth = "1.5rem";
      avatarContainer.style.minHeight = "1.5rem";
      avatarContainer.textContent = "#";

      const textContainer = document.createElement("div");
      textContainer.className = "flex items-center gap-2";
      const mainTextLine = document.createElement("div");
      mainTextLine.className = "flex items-center gap-2";
      const nameSpan = document.createElement("span");
      nameSpan.textContent = channel?.name || "";
      nameSpan.className =
        "text-sm font-bold capitalize text-gray-800 name-span";
      mainTextLine.appendChild(nameSpan);

      const secondaryTextSpan = document.createElement("span");
      secondaryTextSpan.textContent =
        channel?.description || `${channel?.members_count ?? 0} members`;
      secondaryTextSpan.className = "text-xs text-gray-500 secondary-span";
      textContainer.appendChild(mainTextLine);
      textContainer.appendChild(secondaryTextSpan);

      button.appendChild(avatarContainer);
      button.appendChild(textContainer);

      button.onclick = () => {
        const channelId = channel?.channels_id;
        const label = channel?.name || "";
        if (
          !state.mentions.some(
            (m: any) => m.id === channelId && m.type === "channel"
          )
        ) {
          dispatch({
            type: ACTIONS.MENTIONS,
            payload: [{ id: channelId, label, type: "channel" }],
          });
        }
        command({ id: channelId, label });
      };
      component.appendChild(button);
    });
  };
  channelPopulateRef.current = populateChannelMentions;

  const populateSlashCommands: PopulateFn = (
    component,
    query,
    command,
    clientRect
  ) => {
    const queryString = String(query || "").toLowerCase();
    const filtered = SLASH_COMMANDS.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(queryString) ||
        cmd.id.toLowerCase().includes(queryString)
    );

    if (filtered.length === 0) {
      component.style.display = "none";
      return;
    }
    component.style.display = "";

    const coords = typeof clientRect === "function" ? clientRect() : null;
    if (coords && component) {
      const editorTop = coords.top + window.scrollY;
      const itemHeight = 48;
      const calculatedHeight = filtered.length * itemHeight;
      const maxHeight = 300;
      const dropdownHeight = Math.min(calculatedHeight, maxHeight);
      const isAbove = editorTop > dropdownHeight + itemHeight;
      const dropdownTop = isAbove
        ? editorTop - dropdownHeight - coords.height
        : coords.bottom + window.scrollY;
      Object.assign(component.style, {
        top: `${dropdownTop}px`,
        left: `${coords.left + window.scrollX}px`,
        maxHeight: `${maxHeight}px`,
        minWidth: "500px",
        width: "500px",
      });
    }

    filtered.forEach((cmd) => {
      const button = document.createElement("button");
      button.className =
        "group flex items-center px-3 py-2 text-left w-full gap-3";

      button.addEventListener("mouseover", () => {
        const buttons = Array.from(component.querySelectorAll("button"));
        buttons.forEach((btn, idx) => {
          if (btn === button) {
            if (!btn.classList.contains("hover")) {
              btn.classList.add("hover");
              const nameSpan = btn.querySelector(".name-span");
              const secondarySpan = btn.querySelector(".secondary-span");
              if (nameSpan) nameSpan.classList.add("text-white");
              if (secondarySpan) secondarySpan.classList.add("text-white");
            }
          } else {
            if (btn.classList.contains("hover")) {
              btn.classList.remove("hover");
              const nameSpan = btn.querySelector(".name-span");
              const secondarySpan = btn.querySelector(".secondary-span");
              if (nameSpan) nameSpan.classList.remove("text-white");
              if (secondarySpan) secondarySpan.classList.remove("text-white");
            }
          }
        });
      });

      const avatarContainer = document.createElement("div");
      avatarContainer.className =
        "w-6 h-6 flex items-center justify-center rounded-md bg-gray-200 overflow-hidden flex-shrink-0";
      avatarContainer.style.minWidth = "1.5rem";
      avatarContainer.style.minHeight = "1.5rem";
      const iconImg = document.createElement("img");
      iconImg.src = cmd.icon;
      iconImg.alt = `/${cmd.label}`;
      iconImg.className = "w-full h-full object-contain";
      iconImg.onerror = () => {
        iconImg.style.display = "none";
        avatarContainer.textContent = "/";
        avatarContainer.classList.add(
          "text-primary-600",
          "font-bold",
          "text-sm"
        );
      };
      avatarContainer.appendChild(iconImg);

      const textContainer = document.createElement("div");
      textContainer.className = "flex items-center gap-2";
      const mainTextLine = document.createElement("div");
      mainTextLine.className = "flex items-center gap-2";
      const nameSpan = document.createElement("span");
      nameSpan.textContent = `/${cmd.label}`;
      nameSpan.className = "text-sm font-bold text-gray-800 name-span";
      mainTextLine.appendChild(nameSpan);

      const secondaryTextSpan = document.createElement("span");
      secondaryTextSpan.textContent = cmd.description;
      secondaryTextSpan.className = "text-xs text-gray-500 secondary-span";
      textContainer.appendChild(mainTextLine);
      textContainer.appendChild(secondaryTextSpan);

      button.appendChild(avatarContainer);
      button.appendChild(textContainer);

      button.onclick = () => {
        command({ id: cmd.id, label: cmd.label });
      };
      component.appendChild(button);
    });
  };
  slashPopulateRef.current = populateSlashCommands;

  type SuggestionRenderObj = ReturnType<
    ReturnType<typeof createSuggestionRender>
  >;
  const memberRenderRef = useRef<SuggestionRenderObj | null>(null);
  const channelRenderRef = useRef<SuggestionRenderObj | null>(null);
  const slashRenderRef = useRef<SuggestionRenderObj | null>(null);
  if (!memberRenderRef.current)
    memberRenderRef.current = createSuggestionRender(
      () => memberPopulateRef.current!
    )();
  if (!channelRenderRef.current)
    channelRenderRef.current = createSuggestionRender(
      () => channelPopulateRef.current!
    )();
  if (!slashRenderRef.current)
    slashRenderRef.current = createSuggestionRender(
      () => slashPopulateRef.current!
    )();

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        hardBreak: false,
        code: false,
        codeBlock: false,
        bulletList: {
          HTMLAttributes: {
            class: "message-editor-bullet-list",
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: "message-editor-ordered-list",
          },
        },
        listItem: {
          HTMLAttributes: {
            class: "message-editor-list-item",
          },
        },
      }),
      MessageHardBreak.configure({
        keepMarks: true,
      }),
      MessageEnter,
      Placeholder.configure({
        placeholder: `Message #${name}`,
      }),
      Mention.configure({
        HTMLAttributes: {
          class: "mention",
        },
        suggestions: [
          {
            char: "@",
            items: (props: { query?: string }) => {
              const query = props?.query ?? "";
              const queryString = String(query).toLowerCase();
              const mentionMembers =
                state?.mentionOrgMembers || state?.orgMembers || [];
              const members = mentionMembers.filter((item: any) => {
                let name =
                  item?.name && item?.name !== " " ? item?.name : item?.email;
                return name.toLowerCase().includes(queryString);
              });

              const channelMatch = "@channel".includes(queryString);
              const channel = createChannelMentionItem();

              return channelMatch ? [channel, ...members] : members;
            },
            render: () => memberRenderRef.current!,
          },
          {
            char: "#",
            items: (props: { query?: string }) => {
              const query = props?.query ?? "";
              const queryString = String(query).toLowerCase();
              const channels = state?.channels ?? [];
              return channels.filter((channel: any) => {
                const name = (channel?.name || "").toLowerCase();
                const slug = (channel?.channel_slug || "").toLowerCase();
                return name.includes(queryString) || slug.includes(queryString);
              });
            },
            render: () => channelRenderRef.current!,
          },
          {
            char: "/",
            items: (props: { query?: string }) => {
              const query = props?.query ?? "";
              const queryString = String(query).toLowerCase();
              if (!queryString) return SLASH_COMMANDS;
              return SLASH_COMMANDS.filter(
                (cmd) =>
                  cmd.label.toLowerCase().includes(queryString) ||
                  cmd.id.toLowerCase().includes(queryString)
              );
            },
            render: () => slashRenderRef.current!,
          },
        ],
      }),

      Link.configure({
        openOnClick: true,
        linkOnPaste: true,
        autolink: true,
        defaultProtocol: "https",
        HTMLAttributes: {
          class: "text-primary-500",
        },
      }),
      Code.configure({
        HTMLAttributes: {
          class: "slack-inline-code",
        },
      }),
      SlackCodeBlock.configure({
        HTMLAttributes: {
          class: "slack-code-block",
        },
      }),
      AppleEmoji,
    ],
    onCreate: ({ editor }) => {
      editor.commands.focus();
    },
    onUpdate: ({ editor }) => {
      const isContentEmpty = editor.isEmpty;
      setIsEmpty(isContentEmpty);
      handleTypingRef.current?.(!isContentEmpty);
    },
    onBlur: () => handleTypingRef.current?.(false),
    editorProps: {
      handlePaste(view, event, slice) {
        const items = event.clipboardData?.items;

        if (items) {
          for (const item of items) {
            if (item.type.indexOf("image") !== -1) {
              const file = item.getAsFile();
              if (file) {
                handleImagePaste?.(file);
              }
              return true;
            }
          }
        }

        return false;
      },
    },
  });

  return {
    editor,
    isEmpty,
  };
};

export default UseTextEditor;
