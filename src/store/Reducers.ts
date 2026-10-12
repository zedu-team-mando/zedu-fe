import { ACTIONS } from "./Actions";

const toPreviewThreadItem = (message: any) => ({
  thread_id: message.thread_id,
  channels_id: message.channel_id,
  username: message.username,
  status: "success",
  created_at: message.created_at,
  messages: null,
  message_count: 0,
  last_reply: "0001-01-01T00:00:00Z",
  avatar_url: message.avatar_url,
  default_avatar_url: message.default_avatar_url,
  type: message.type || "message",
  message: message.message,
  channel_name: message.channel_name,
  channel_type: message.channel_type,
  current_status: "pending",
  full_name: message.full_name,
  email: message.email,
  edited: Boolean(message.edited),
  is_pinned: false,
  is_deactivated: false,
  user_type: message.user_type,
  user_id: message.user_id,
  org_id: message.org_id,
  pinned_details: {},
  reactions: null,
  media: message.media || [],
});

const prependPreviewThread = (list: any[] = [], message: any) => {
  const previewItem = toPreviewThreadItem(message);
  const currentPreview = Array.isArray(list) ? list : [];

  return [
    previewItem,
    ...currentPreview.filter(
      (item: any) => String(item?.thread_id) !== String(message.thread_id)
    ),
  ];
};

const prependRealtimeThreadMessage = (list: any[] = [], newMessage: any) => {
  const threadId = newMessage?.thread_id;
  if (!threadId) return [newMessage, ...list];

  const cleanList = list.filter(
    (msg) => !msg?.isOptimistic && msg?.thread_id !== threadId
  );

  return [newMessage, ...cleanList];
};

const reactionsSignature = (reactions: any[] = []) =>
  (reactions || [])
    .map((r) => `${r?.reaction ?? ""}:${r?.reaction_count ?? 0}`)
    .sort()
    .join("|");

/** Drop parent-thread reactions that were incorrectly attached to a reply payload. */
const sanitizeReplyReactions = (message: any, parentReactions?: any[]) => {
  if (!message) return message;

  const replyReactions = message.reactions;
  if (!Array.isArray(replyReactions) || replyReactions.length === 0) {
    return { ...message, reactions: null };
  }

  if (!Array.isArray(parentReactions) || parentReactions.length === 0) {
    return message;
  }

  // reaction_id is stable per emoji, so a shared emoji is not a copied parent list.
  // Only drop the payload when it is the same set and counts as the parent thread.
  if (
    reactionsSignature(parentReactions) === reactionsSignature(replyReactions)
  ) {
    return { ...message, reactions: null };
  }

  return message;
};

const prependRealtimeReplyMessage = (list: any[] = [], newMessage: any) => {
  let removedOptimistic = false;
  const cleanList = list.filter((msg) => {
    if (
      !removedOptimistic &&
      msg?.isOptimistic &&
      msg?.user_id === newMessage?.user_id
    ) {
      removedOptimistic = true;
      return false;
    }
    return true;
  });

  // New replies never have reactions yet; realtime payloads sometimes include
  // the parent thread's reactions, which incorrectly renders a 👍 (etc.) chip.
  const sanitizedMessage = {
    ...newMessage,
    reactions: null,
  };

  return [sanitizedMessage, ...cleanList];
};

const reducers = (state: any, action: any) => {
  const { type, payload } = action;
  switch (type) {
    case ACTIONS.ADD_ACTIVE_BUZZ:
      // Add or update active_buzz in channelDetails
      return {
        ...state,
        channelDetails: {
          ...state.channelDetails,
          active_buzz: payload,
        },
      };
    case ACTIONS.REMOVE_ACTIVE_BUZZ:
      // Remove active_buzz from channelDetails
      if (!state.channelDetails) return state;
      const { active_buzz, ...rest } = state.channelDetails;
      return {
        ...state,
        channelDetails: { ...rest },
      };
    case ACTIONS.SHOW_INCOMING_CALL_POPUP:
      return {
        ...state,
        showIncomingCallPopup: true,
        incomingCallInfo: action.payload,
      };
    case ACTIONS.HIDE_INCOMING_CALL_POPUP:
      return {
        ...state,
        showIncomingCallPopup: false,
        incomingCallInfo: null,
      };
    case "TOGGLE_AGENT": {
      const existing = state.activatedAgents || [];
      const index = existing.findIndex(
        (a: any) => a.name === action.payload.name
      );

      let updatedAgents;
      if (index >= 0) {
        // Agent already active, remove it
        updatedAgents = [
          ...existing.slice(0, index),
          ...existing.slice(index + 1),
        ];
      } else {
        // Agent not active, add it
        updatedAgents = [...existing, action.payload];
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("activatedAgents", JSON.stringify(updatedAgents));
      }

      return {
        ...state,
        activatedAgents: updatedAgents,
      };
    }
    case ACTIONS.USER:
      return {
        ...state,
        user: payload,
      };
    case ACTIONS.TOKEN:
      return {
        ...state,
        token: payload,
      };
    case ACTIONS.ORG_ID:
      return {
        ...state,
        orgId: payload,
      };
    case ACTIONS.CALLBACK:
      return {
        ...state,
        callback: payload,
      };
    case ACTIONS.LOADING:
      return {
        ...state,
        loading: payload,
      };
    case ACTIONS.CHANNEL_LOADING:
      return {
        ...state,
        channelloading: payload,
      };
    case ACTIONS.NOTIFY:
      return {
        ...state,
        notify: payload,
      };
    case ACTIONS.CHANNELS:
      return {
        ...state,
        channels: payload,
      };
    case ACTIONS.ALL_CHANNELS:
      return {
        ...state,
        allChannels: payload,
      };
    case ACTIONS.THREAD:
      return {
        ...state,
        thread: payload,
      };
    case ACTIONS.CHANNEL_DETAILS:
      return {
        ...state,
        channelDetails: payload,
      };
    case ACTIONS.UPDATE_CHANNEL_STAR: {
      const { channelId, isStarred } = payload || {};
      const updatedChannelDetails =
        state?.channelDetails &&
        String(
          state?.channelDetails?.channels_id || state?.channelDetails?.id
        ) === String(channelId)
          ? { ...state.channelDetails, is_starred: isStarred }
          : state.channelDetails;

      const updatedChannels = Array.isArray(state?.channels)
        ? state.channels.map((ch: any) =>
            String(ch?.channels_id || ch?.id) === String(channelId)
              ? { ...ch, is_starred: isStarred }
              : ch
          )
        : state.channels;

      return {
        ...state,
        channelDetails: updatedChannelDetails,
        channels: updatedChannels,
      };
    }
    case ACTIONS.CHANNEL_NAME:
      return {
        ...state,
        channelName: payload,
      };
    case ACTIONS.CHANNEL_BAR:
      return {
        ...state,
        channelBar: payload,
      };
    case ACTIONS.OPEN_SIDEBAR:
      return {
        ...state,
        openSidebar: payload,
      };
    case ACTIONS.ORG_MEMBERS:
      return {
        ...state,
        orgMembers: payload,
      };
    case ACTIONS.ORG_MEMBERS_TOTAL:
      return {
        ...state,
        orgMembersTotal: payload,
      };
    case ACTIONS.MENTION_ORG_MEMBERS:
      return {
        ...state,
        mentionOrgMembers: payload,
      };
    case ACTIONS.ORG_INVITES:
      return {
        ...state,
        orgInvites: payload,
      };
    case ACTIONS.ORG_ROLES:
      return {
        ...state,
        orgRoles: payload,
      };
    case ACTIONS.PERMISSIONS_CATALOG:
      return {
        ...state,
        permissionsCatalog: payload,
      };
    case ACTIONS.ORG_ACCESS_LOADING:
      return {
        ...state,
        orgAccessLoading: payload,
      };
    case ACTIONS.DMS:
      return {
        ...state,
        dms: payload,
      };
    case ACTIONS.UPDATE_DM_PREVIEW: {
      const { channelId, message } = action.payload;
      const list = state.dms || [];
      const match = list.find(
        (dm: any) =>
          String(dm.channel_id || dm.channels_id) === String(channelId)
      );
      if (!match) return state;

      return {
        ...state,
        dms: [
          {
            ...match,
            preview_message: message,
            last_read_at: new Date().toISOString(),
          },
          ...list.filter(
            (dm: any) =>
              String(dm.channel_id || dm.channels_id) !== String(channelId)
          ),
        ],
      };
    }
    case ACTIONS.HOME_DMS:
      return {
        ...state,
        homeDms: payload,
      };
    case ACTIONS.NOTIFICATIONS:
      return {
        ...state,
        notifications: [...state.notifications, payload],
      };
    case ACTIONS.INCREMENT_NOTIFICATION_BADGE:
      return {
        ...state,
        notificationBadgeState: {
          count: (state.notificationBadgeState?.count ?? 0) + 1,
        },
      };
    case ACTIONS.CLEAR_NOTIFICATION_BADGE:
      return {
        ...state,
        notificationBadgeState: { count: 0 },
      };
    case ACTIONS.MESSAGES:
      if (action.payload?.newMessage?.isOptimistic) {
        return {
          ...state,
          messages: [action.payload.newMessage, ...(state.messages || [])],
        };
      }

      if (action.payload?.isRealTime) {
        return {
          ...state,
          messages: prependRealtimeThreadMessage(
            state.messages,
            action.payload.newMessage
          ),
        };
      }

      return {
        ...state,
        messages:
          action.payload.newPage === 1
            ? action.payload.newThreads || []
            : [...(state.messages || []), ...(action.payload.newThreads || [])],
      };

    case ACTIONS.CHATS:
      if (action.payload?.newMessage?.isOptimistic) {
        return {
          ...state,
          chats: [action.payload.newMessage, ...(state.chats || [])],
        };
      }

      if (action.payload?.isRealTime) {
        return {
          ...state,
          chats: prependRealtimeThreadMessage(
            state.chats,
            action.payload.newMessage
          ),
        };
      }

      return {
        ...state,
        chats:
          action.payload.newPage === 1
            ? action.payload.newThreads || []
            : [...(state.chats || []), ...(action.payload.newThreads || [])],
      };

    case ACTIONS.STREAM_APPEND: {
      const { message } = action.payload;
      const { thread_id, ...restOfMessage } = message;

      const chats = [...(state.chats || [])];

      const existingMessageIndex = chats.findIndex(
        (m) => m.thread_id === thread_id
      );

      if (existingMessageIndex !== -1) {
        chats[existingMessageIndex] = {
          ...chats[existingMessageIndex],
          message:
            (chats[existingMessageIndex].message || "") + restOfMessage.message,
        };
      } else {
        const newMessage = {
          ...restOfMessage,
          thread_id: thread_id,
        };
        chats.unshift(newMessage);
      }

      return { ...state, chats };
    }

    case ACTIONS.REPLIES:
      if (action.payload?.newMessage?.isOptimistic) {
        return {
          ...state,
          replies: [action.payload.newMessage, ...(state.replies || [])],
        };
      }

      if (action.payload?.isRealTime) {
        return {
          ...state,
          replies: prependRealtimeReplyMessage(
            state.replies,
            action.payload.newMessage
          ),
        };
      }

      {
        const parentReactions =
          action.payload.parentReactions ?? state.thread?.reactions;
        const incoming = action.payload.newThreads || [];
        const sanitizedThreads = incoming.map((msg: any) =>
          sanitizeReplyReactions(msg, parentReactions)
        );

        return {
          ...state,
          replies:
            action.payload.newPage === 1
              ? sanitizedThreads
              : [...(state.replies || []), ...sanitizedThreads],
        };
      }

    case ACTIONS.CLEAR_CHATS:
      return {
        ...state,
        chats: [],
      };

    case ACTIONS.MESSAGE_LOADING:
      return {
        ...state,
        messageLoading: payload,
      };

    case ACTIONS.INTEGRATIONS_LOADING:
      return {
        ...state,
        integrationsLoading: payload,
      };

    case ACTIONS.ORG_DATA:
      return {
        ...state,
        orgData: payload,
      };
    case ACTIONS.CHANNEL_CALLBACK:
      return {
        ...state,
        channelCallback: !state.channelCallback,
      };
    case ACTIONS.CHANNEL_SUBSCRIPTION:
      return {
        ...state,
        channelSubscription: payload,
      };
    case ACTIONS.CHAT_SUBSCRIPTION:
      return {
        ...state,
        chatSubscription: payload,
      };
    case ACTIONS.USER_TYPING: {
      const { userId, username, typing } = payload || {};
      const currentId = String(state.user?.user_id || state.user?.id || "");
      if (!userId || String(userId) === currentId) return state;

      const list = state.userTyping || [];
      if (typing) {
        const exists = list.some(
          (typer: any) => String(typer.id) === String(userId)
        );
        if (exists) {
          return {
            ...state,
            userTyping: list.map((typer: any) =>
              String(typer.id) === String(userId)
                ? {
                    ...typer,
                    username: username || typer.username || "Someone",
                    at: Date.now(),
                  }
                : typer
            ),
          };
        }
        return {
          ...state,
          userTyping: [
            ...list,
            { id: userId, username: username || "Someone", at: Date.now() },
          ],
        };
      }

      return {
        ...state,
        userTyping: list.filter(
          (typer: any) => String(typer.id) !== String(userId)
        ),
      };
    }
    case ACTIONS.CLEAR_TYPING:
      return {
        ...state,
        userTyping: [],
      };
    case ACTIONS.REPLY_SUBSCRIPTION:
      return {
        ...state,
        replySubscription: payload,
      };
    case ACTIONS.AGENT_DM:
      return {
        ...state,
        agentDm: payload,
      };
    case ACTIONS.MENTIONS:
      return {
        ...state,
        mentions: [...state.mentions, ...payload],
      };
    case ACTIONS.CLEAR_MENTIONS:
      return {
        ...state,
        mentions: [],
      };
    case ACTIONS.INVITE_MODAL:
      return {
        ...state,
        inviteModal: payload,
      };
    case ACTIONS.SHOW_PROFILE:
      return {
        ...state,
        showProfile: payload,
      };
    case ACTIONS.REPLY:
      return {
        ...state,
        reply: payload,
      };
    case ACTIONS.PROFILE:
      return {
        ...state,
        profile: payload,
      };
    case ACTIONS.SHOW_USER_PROFILE:
      return {
        ...state,
        showUserProfile: payload,
      };
    case ACTIONS.PROFILE_CALLBACK:
      return {
        ...state,
        profileCallback: payload,
      };
    case ACTIONS.GROUP_CALLBACK:
      return {
        ...state,
        groupCallback: payload,
      };
    case ACTIONS.CHANNEL_READY:
      return {
        ...state,
        channelReady: payload,
      };
    case ACTIONS.CONVERSATION_SEARCH_OPEN:
      return {
        ...state,
        conversationSearchOpen: Boolean(action.payload),
      };
    case ACTIONS.UPDATE_MESSAGE_THREAD: {
      const { threadId, reply, updates } = action.payload;

      const updatedMessages = state.messages.map((msg: any) => {
        if (msg.thread_id === threadId) {
          const existingReplies = msg.messages || [];

          const userExists = existingReplies.some(
            (r: any) => r.user_id === reply.user_id
          );

          return {
            ...msg,
            last_reply: reply?.created_at,
            messages: userExists
              ? existingReplies
              : [...existingReplies, reply],
            message_count: updates?.thread_count,
          };
        }
        return msg;
      });

      return {
        ...state,
        messages: updatedMessages,
      };
    }

    case ACTIONS.UPDATE_DM_MESSAGE_THREAD: {
      const { threadId, reply, updates } = action.payload;

      const updatedMessages = state.chats.map((msg: any) => {
        if (msg.thread_id === threadId) {
          const existingReplies = msg.messages || [];

          const userExists = existingReplies.some(
            (r: any) => r.user_id === reply.user_id
          );

          return {
            ...msg,
            last_reply: reply?.created_at,
            messages: userExists
              ? existingReplies
              : [...existingReplies, reply],
            message_count: updates?.thread_count,
          };
        }
        return msg;
      });

      return {
        ...state,
        chats: updatedMessages,
      };
    }

    case ACTIONS.DELETE_CHANNEL_MESSAGE: {
      const { threadId } = action.payload;

      return {
        ...state,
        messages: (state.messages || []).filter(
          (msg: any) => msg.thread_id !== threadId
        ),
      };
    }

    case ACTIONS.DELETE_CHANNEL_MEDIA: {
      const { updatedMessage } = action.payload;

      return {
        ...state,
        messages: (state.messages || []).map((msg: any) =>
          msg.thread_id === updatedMessage?.thread_id ? updatedMessage : msg
        ),
      };
    }

    case ACTIONS.DELETE_DM_MESSAGE: {
      const { threadId } = action.payload;

      return {
        ...state,
        chats: (state.chats || []).filter(
          (msg: any) => msg.thread_id !== threadId
        ),
      };
    }

    case ACTIONS.DELETE_MESSAGE_THREAD_REPLY: {
      const { threadId, messageId, updates } = action.payload;

      const updatedMessages = state.messages.map((msg: any) => {
        if (msg.thread_id === threadId) {
          const existingReplies = msg.messages || [];

          const filteredReplies = existingReplies.filter(
            (r: any) => r.id !== messageId
          );

          return {
            ...msg,
            messages: updates?.preview_section
              ? filteredReplies
              : existingReplies,
            message_count: updates?.thread_count,
          };
        }
        return msg;
      });

      return {
        ...state,
        replies: (state.replies || []).filter(
          (msg: any) => msg.id !== messageId
        ),
        messages: updatedMessages,
      };
    }

    case ACTIONS.DELETE_DM_THREAD_REPLY: {
      const { threadId, messageId, updates } = action.payload;

      const updatedMessages = state.chats.map((msg: any) => {
        if (msg.thread_id === threadId) {
          const existingReplies = msg.messages || [];

          const filteredReplies = existingReplies.filter(
            (r: any) => r.id !== messageId
          );

          return {
            ...msg,
            messages: updates?.preview_section
              ? filteredReplies
              : existingReplies,
            message_count: updates?.thread_count,
          };
        }
        return msg;
      });

      return {
        ...state,
        replies: (state.replies || []).filter(
          (msg: any) => msg.id !== messageId
        ),
        chats: updatedMessages,
      };
    }

    case ACTIONS.EDIT_CHANNEL_MESSAGE: {
      const { threadId, newMessageData } = action.payload;

      const updatedMessages = (state.messages || []).map((msg: any) => {
        if (msg.thread_id === threadId) {
          return {
            ...msg,
            message: newMessageData.message,
            edited: true,
          };
        }
        return msg;
      });

      return {
        ...state,
        messages: updatedMessages,
      };
    }

    case ACTIONS.UPDATE_CHANNEL_PIN: {
      const { threadId, is_pin, details } = action.payload;

      const updatedMessages = (state.messages || []).map((msg: any) => {
        if (msg.thread_id === threadId) {
          return {
            ...msg,
            is_pinned: is_pin,
            pinned_details: details,
          };
        }
        return msg;
      });

      return {
        ...state,
        messages: updatedMessages,
      };
    }

    case ACTIONS.UPDATE_CHANNEL_REACTIONS: {
      const { threadId, reactions } = action.payload;

      const updatedMessages = (state.messages || []).map((msg: any) => {
        if (msg.thread_id === threadId) {
          return {
            ...msg,
            reactions: reactions,
          };
        }
        return msg;
      });

      const updatedThread =
        state.thread?.thread_id === threadId
          ? { ...state.thread, reactions }
          : state.thread;

      return {
        ...state,
        messages: updatedMessages,
        thread: updatedThread,
      };
    }

    case ACTIONS.UPDATE_REPLY_REACTIONS: {
      const { messageId, reactions } = action.payload;

      // Without a message id, `undefined === undefined` would match empty ids
      // and attach parent/thread reactions onto the wrong reply rows.
      if (!messageId) {
        return state;
      }

      const updatedMessages = (state.replies || []).map((msg: any) => {
        if (msg.id === messageId || msg.message_id === messageId) {
          return {
            ...msg,
            reactions: reactions ?? null,
          };
        }
        return msg;
      });

      return {
        ...state,
        replies: updatedMessages,
      };
    }

    case ACTIONS.UPDATE_DM_REACTIONS: {
      const { threadId, reactions } = action.payload;

      const updatedMessages = (state.chats || []).map((msg: any) => {
        if (msg.thread_id === threadId) {
          return {
            ...msg,
            reactions: reactions,
          };
        }
        return msg;
      });

      const updatedThread =
        state.thread?.thread_id === threadId
          ? { ...state.thread, reactions }
          : state.thread;

      return {
        ...state,
        chats: updatedMessages,
        thread: updatedThread,
      };
    }

    case ACTIONS.UPDATE_DM_PIN: {
      const { threadId, is_pin, details } = action.payload;

      const updatedMessages = (state.chats || []).map((msg: any) => {
        if (msg.thread_id === threadId) {
          return {
            ...msg,
            is_pinned: is_pin,
            pinned_details: details,
          };
        }
        return msg;
      });

      return {
        ...state,
        chats: updatedMessages,
      };
    }

    case ACTIONS.EDIT_DM_MESSAGE: {
      const { threadId, newMessageData } = action.payload;

      const updatedMessages = (state.chats || []).map((msg: any) => {
        if (msg.thread_id === threadId) {
          return {
            ...msg,
            message: newMessageData.message,
            edited: true,
          };
        }
        return msg;
      });

      return {
        ...state,
        chats: updatedMessages,
      };
    }

    case ACTIONS.EDIT_REPLY_MESSAGE: {
      const { threadId, newMessageData } = action.payload;

      const updatedMessages = (state.replies || []).map((msg: any) => {
        if (msg.id === threadId) {
          return {
            ...msg,
            message: newMessageData.message,
            edited: true,
          };
        }
        return msg;
      });

      return {
        ...state,
        replies: updatedMessages,
      };
    }

    case ACTIONS.UPDATE_REPLY_PIN: {
      const { threadId, is_pin, details } = action.payload;

      const updatedMessages = (state.replies || []).map((msg: any) => {
        if (msg.id === threadId) {
          return {
            ...msg,
            is_pinned: is_pin,
            pinned_details: details,
          };
        }
        return msg;
      });

      return {
        ...state,
        replies: updatedMessages,
      };
    }

    case ACTIONS.IS_EDIT:
      return {
        ...state,
        isEdit: payload,
      };
    case ACTIONS.IS_EDIT_REPLY:
      return {
        ...state,
        isEditReply: payload,
      };
    case ACTIONS.THREAD_REPLY:
      return {
        ...state,
        threadReply: payload,
      };
    case ACTIONS.STATUS_CALLBACK:
      return {
        ...state,
        statusCallback: payload,
      };
    case ACTIONS.TOP_LABEL:
      return {
        ...state,
        topLabel: payload,
      };
    case ACTIONS.ACTIVE_AGENTS:
      return {
        ...state,
        activeAgents: payload,
      };
    case ACTIONS.INACTIVE_AGENTS:
      return {
        ...state,
        inactiveAgents: payload,
      };
    case ACTIONS.MARKETPLACE_AGENTS:
      return {
        ...state,
        marketPlaceAgents: payload,
      };
    case ACTIONS.PREPEND_CHANNEL_PREVIEW: {
      const message = action.payload;
      const channelId = message?.channel_id;
      if (!channelId || !message?.thread_id) return state;

      return {
        ...state,
        channels: (state.channels || []).map((channel: any) => {
          if (String(channel.channels_id) !== String(channelId)) return channel;

          return {
            ...channel,
            preview_message: message.message ?? channel.preview_message,
            last_thread_id: message.thread_id,
            preview_thread: prependPreviewThread(
              channel.preview_thread,
              message
            ),
          };
        }),
      };
    }
    case ACTIONS.PREPEND_HOME_DM_PREVIEW: {
      const message = action.payload;
      const channelId = message?.channel_id;
      if (!channelId || !message?.thread_id) return state;

      const updateDm = (dm: any) => {
        const dmId = dm?.channel_id || dm?.channels_id;
        if (String(dmId) !== String(channelId)) return dm;

        return {
          ...dm,
          preview_message: message.message ?? dm.preview_message,
          last_thread_id: message.thread_id,
          preview_thread: prependPreviewThread(dm.preview_thread, message),
        };
      };

      return {
        ...state,
        homeDms: (state.homeDms || []).map(updateDm),
      };
    }
    case ACTIONS.UPDATE_THREAD_COUNT: {
      const updatedChannelId = action.payload.channels_id;

      return {
        ...state,
        channels: state?.channels?.map((channel: any) => {
          if (channel.channels_id === updatedChannelId) {
            return {
              ...channel,
              mention_count: action.payload.mention_count,
              thread_count: action.payload.thread_count,
            };
          }
          return channel;
        }),
      };
    }
    case ACTIONS.BUZZ_SIGNAL_UPDATE: {
      const { notification_type, buzzEventData } = action.payload;
      if (!buzzEventData?.channel_id) return state;
      if (notification_type === "buzz_started") {
        const newUser = buzzEventData?.user_joined;
        return {
          ...state,
          channels: state?.channels?.map((channel: any) => {
            if (
              String(channel.channels_id) === String(buzzEventData.channel_id)
            ) {
              return {
                ...channel,
                active_buzz: {
                  buzz_id: buzzEventData?.buzz_id,
                  host_id: buzzEventData?.host_id,
                  host_name: newUser?.username || "A participant",
                  participant_count:
                    buzzEventData?.participant_ids?.length || 1,
                  started_at: buzzEventData?.created_at,
                },
              };
            }
            return channel;
          }),
        };
      }
      if (notification_type === "buzz_ended") {
        return {
          ...state,
          channels: state?.channels?.map((channel: any) => {
            if (
              String(channel.channels_id) === String(buzzEventData.channel_id)
            ) {
              const { active_buzz, ...restOfChannel } = channel;
              return restOfChannel;
            }
            return channel;
          }),
        };
      }
      return state;
    }
    case ACTIONS.UPDATE_DM_COUNT: {
      const updatedChannelId = action.payload.channel_id;

      const updateDmThreadCount = (dm: any) => {
        if (dm.channel_id === updatedChannelId) {
          return {
            ...dm,
            thread_count: action.payload.thread_count,
          };
        }
        return dm;
      };

      return {
        ...state,
        // Keep homeDms (visible/HOME_DMS) and full dms lists independent.
        // Mapping state.dms into homeDms was replacing the sidebar with the old endpoint.
        homeDms: (state.homeDms || []).map(updateDmThreadCount),
        dms: (state.dms || []).map(updateDmThreadCount),
      };
    }

    case ACTIONS.COUNT_CALLBACK:
      return {
        ...state,
        countCallback: payload,
      };
    case ACTIONS.TRIGGER_CALLBACK:
      return {
        ...state,
        triggerCallback: !state.triggerCallback,
      };
    case ACTIONS.JOIN_CALLBACK:
      return {
        ...state,
        joinCallback: !state.joinCallback,
      };
    case ACTIONS.LEAVE_CALLBACK:
      return {
        ...state,
        leaveCallback: !state.leaveCallback,
      };
    case ACTIONS.CREATE_CALLBACK:
      return {
        ...state,
        createCallback: !state.createCallback,
      };
    case ACTIONS.HOME_DMS_CALLBACK:
      return {
        ...state,
        homeDmsCallback: !state.homeDmsCallback,
      };
    case ACTIONS.DELETE_CALLBACK:
      return {
        ...state,
        deleteCallback: !state.deleteCallback,
      };
    case ACTIONS.THREAD_COUNT:
      return {
        ...state,
        threadCount: payload,
      };
    case ACTIONS.DM_COUNT:
      return {
        ...state,
        dmCount: payload,
      };
    case ACTIONS.USER_DATA:
      return {
        ...state,
        userData: payload,
      };
    case ACTIONS.HOVER_PROFILE:
      return {
        ...state,
        hoverProfile: payload,
      };
    case ACTIONS.STATUS:
      return {
        ...state,
        status: payload,
      };
    case ACTIONS.NOTIFICATION_DETAIL:
      return {
        ...state,
        notificationDetail: payload,
      };
    case ACTIONS.CHANNEL_INVITE:
      return {
        ...state,
        channelInvite: payload,
      };
    case ACTIONS.AGENT_MODAL:
      return {
        ...state,
        agentModal: payload,
      };
    case ACTIONS.AGENT_STATE:
      return {
        ...state,
        agentState: payload,
      };
    case ACTIONS.AGENT_CALLBACK:
      return {
        ...state,
        agentCallback: payload,
      };
    case ACTIONS.SUBSCRIPTION_PLANS:
      return {
        ...state,
        subscriptionPlans: payload,
      };
    case ACTIONS.ACTIVE_TAB:
      return {
        ...state,
        activeTab: payload,
      };
    case ACTIONS.BOOKMARKS:
      return {
        ...state,
        bookmarks: payload,
      };
    case ACTIONS.DATA_ID:
      return {
        ...state,
        dataId: payload,
      };

    case ACTIONS.SELECTED_SKILLS:
      return {
        ...state,
        selectedSkills: action.payload,
      };
    case ACTIONS.SKILL_SIDEBAR:
      return {
        ...state,
        skillSidebar: action.payload,
      };
    case ACTIONS.TASKS:
      return {
        ...state,
        tasks: action.payload,
      };

    case ACTIONS.ADD_TASK:
      return {
        ...state,
        tasks: [...(state.tasks || []), action.payload],
      };

    case ACTIONS.PROMPTS:
      return {
        ...state,
        prompts: action.payload,
      };
    case ACTIONS.COLLEAGUE:
      return {
        ...state,
        colleague: action.payload,
      };
    case ACTIONS.SKILL:
      return {
        ...state,
        skill: action.payload,
      };
    case ACTIONS.AGENT_SKILLS:
      return {
        ...state,
        agentSkills: action.payload,
      };
    case ACTIONS.SKILLS_CALLBACK:
      return {
        ...state,
        skillsCallback: action.payload,
      };
    case ACTIONS.TASKS_CALLBACK:
      return {
        ...state,
        tasksCallback: action.payload,
      };
    case ACTIONS.WORKFLOW:
      return {
        ...state,
        workflow: action.payload,
      };
    case ACTIONS.ORG_CALLBACK:
      return {
        ...state,
        orgCallback: action.payload,
      };
    case ACTIONS.PROMPT_CALLBACK:
      return {
        ...state,
        promptCallback: action.payload,
      };
    case ACTIONS.ORG_SLUG:
      return {
        ...state,
        orgSlug: action.payload,
      };
    case ACTIONS.SKILL_LOADING:
      return {
        ...state,
        skillLoading: action.payload,
      };
    case ACTIONS.NODE_SIDEBAR:
      return {
        ...state,
        nodeSidebar: action.payload,
      };
    case ACTIONS.PARTICIPANT:
      return {
        ...state,
        participant: payload,
      };
    case ACTIONS.PARTICIPANTS:
      return {
        ...state,
        participants: payload,
      };
    case ACTIONS.BUZZ_DATA:
      return {
        ...state,
        buzzData: payload,
      };
    case ACTIONS.BUZZ_PARTICIPANTS: {
      const list = Array.isArray(payload) ? payload : [];
      const byUserId = new Map<string, any>();
      for (const participant of list) {
        const key = String(participant?.user_id ?? participant?.uid ?? "");
        if (!key) continue;
        byUserId.set(
          key,
          byUserId.has(key)
            ? { ...byUserId.get(key), ...participant }
            : participant
        );
      }
      return {
        ...state,
        buzzParticipants: Array.from(byUserId.values()),
      };
    }
    case ACTIONS.HAS_JOINED:
      return {
        ...state,
        hasJoined: payload,
      };
    case ACTIONS.ADD_FLOATING_EMOJI:
      return {
        ...state,
        floatingEmojis: [...(state.floatingEmojis || []), action.payload],
      };

    case ACTIONS.REMOVE_FLOATING_EMOJI:
      return {
        ...state,
        floatingEmojis: (state.floatingEmojis || []).filter(
          (e: any) => e.id !== action.payload
        ),
      };
    case ACTIONS.BUZZ_CHATS:
      return {
        ...state,
        buzzChats: payload,
      };
    case ACTIONS.THREAD_MENTIONS: {
      if (action.payload?.reset) {
        return {
          ...state,
          threadMentions: null,
          threadMentionsHasMore: false,
          unseenThreadCount: 0,
        };
      }
      if (action.payload?.isRealTime) {
        return {
          ...state,
          threadMentions: [
            action.payload.newMessage,
            ...(state.threadMentions || []),
          ],
        };
      }

      const incoming = action.payload.newThreads || [];
      const isFirstPage = action.payload.newPage === 1;
      const previous = state.threadMentions || [];
      const seen = new Set(
        previous
          .map(
            (group: any) =>
              group?.thread_id || group?.thread_messages?.[0]?.thread_id
          )
          .filter(Boolean)
      );
      const appended = incoming.filter((group: any) => {
        const id = group?.thread_id || group?.thread_messages?.[0]?.thread_id;
        if (!id || seen.has(id)) return false;
        seen.add(id);
        return true;
      });
      const hasMore =
        typeof action.payload.hasMore === "boolean"
          ? action.payload.hasMore && (isFirstPage || appended.length > 0)
          : state.threadMentionsHasMore;

      return {
        ...state,
        threadMentions: isFirstPage ? incoming : [...previous, ...appended],
        threadMentionsHasMore: hasMore,
        ...(action.payload.newPage === 1 &&
        typeof action.payload.unseenThreadCount === "number"
          ? { unseenThreadCount: action.payload.unseenThreadCount }
          : {}),
      };
    }

    case ACTIONS.UNSEEN_THREAD_COUNT:
      return {
        ...state,
        unseenThreadCount:
          typeof payload === "number" ? payload : state.unseenThreadCount,
      };

    case ACTIONS.MUTE_PARTICIPANT:
      return {
        ...state,
        muteParticipant: payload,
      };
    case ACTIONS.BUZZ_VIEW:
      return {
        ...state,
        buzzView: payload,
      };
    case ACTIONS.BUZZ_SIDEBAR:
      return {
        ...state,
        buzzSidebar: payload,
      };
    case ACTIONS.BUZZ_SESSION_MODE:
      return {
        ...state,
        buzzSessionMode: payload,
      };
    case ACTIONS.BUZZ_AGORA_UINT_UIDS:
      return {
        ...state,
        buzzAgoraUintUids: {
          ...state.buzzAgoraUintUids,
          ...payload,
        },
      };
    case ACTIONS.BUZZ_IS_SCREEN_SHARING:
      return {
        ...state,
        buzzIsScreenSharing: payload,
      };
    case ACTIONS.BUZZ_STOPPING_RECORDING:
      return {
        ...state,
        buzzStoppingRecording: payload,
      };
    case ACTIONS.BUZZ_STARTING_RECORDING:
      return {
        ...state,
        buzzStartingRecording: payload,
      };
    case ACTIONS.LOAD_THREAD:
      return {
        ...state,
        loadThread: payload,
      };
    default:
      return state;
  }
};

export default reducers;
