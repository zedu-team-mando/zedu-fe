"use client";
import { useContext, useEffect } from "react";
import { DataContext } from "~/store/GlobalState";
import { ACTIONS } from "~/store/Actions";
import { useParams } from "next/navigation";
import {
  getSharedCentrifuge,
  getSubscriptionToken,
  prepareChannelSubscription,
  releaseChannelSubscription,
} from "~/lib/centrifugo/shared-centrifuge";

//

export default function ChannelConnection() {
  const params = useParams();
  const id = params.id as string;
  const { dispatch, state } = useContext(DataContext);
  const { channelCallback } = state;

  // centrifugo connection for notification
  useEffect(() => {
    if (id) {
      const centrifugeClient = getSharedCentrifuge();
      const sub = prepareChannelSubscription(centrifugeClient, id, {
        getToken: () => getSubscriptionToken(id),
      });

      const onSubscribed = () => {
        dispatch({ type: ACTIONS.CHANNEL_SUBSCRIPTION, payload: sub });
      };

      const onPublication = (ctx: any) => {
        const result = ctx?.data;
        // console.log("channel publishing", ctx);

        if (ctx?.data?.type === "typing") {
          dispatch({
            type: ACTIONS.USER_TYPING,
            payload: {
              userId: ctx.data?.user?.id || ctx.data?.user?.user_id,
              username: ctx.data?.user?.username,
              typing: ctx.data?.typing,
            },
          });
          return;
        }

        if (ctx?.data?.type === "message" || ctx?.data?.type === "system") {
          dispatch({
            type: ACTIONS.USER_TYPING,
            payload: {
              userId: ctx.data?.user_id,
              typing: false,
            },
          });
          dispatch({
            type: ACTIONS.MESSAGES,
            payload: { newMessage: ctx.data, isRealTime: true },
          });
        }

        if (ctx?.data?.type === "thread") {
          dispatch({
            type: ACTIONS.MESSAGES,
            payload: { newMessage: ctx.data, isRealTime: true },
          });
        }

        // ------------CHANNELS SECTION-----------------------

        if (
          result?.section === "channels_section" &&
          result?.notification_type === "reply_count_change"
        ) {
          const message = ctx?.data?.data;
          const updates = ctx?.data?.update_change;

          dispatch({
            type: ACTIONS.UPDATE_MESSAGE_THREAD,
            payload: {
              threadId: message.thread_id,
              reply: message,
              updates,
            },
          });
        }

        // channel message edit
        if (
          result?.section === "thread_message" &&
          result?.notification_type === "updated"
        ) {
          const message = ctx?.data?.data;

          dispatch({
            type: ACTIONS.EDIT_CHANNEL_MESSAGE,
            payload: {
              threadId: message.thread_id,
              newMessageData: message,
            },
          });
        }

        // Channel message delete
        if (
          result?.section === "thread_message" &&
          result?.notification_type === "deleted"
        ) {
          const message = ctx?.data?.modification_ids;

          dispatch({
            type: ACTIONS.DELETE_CHANNEL_MESSAGE,
            payload: {
              threadId: message.thread_id,
            },
          });
        }

        // Channel media delete
        if (
          result?.section === "thread_message" &&
          result?.notification_type === "updated_media"
        ) {
          const updatedMessage = ctx?.data?.data;

          dispatch({
            type: ACTIONS.DELETE_CHANNEL_MEDIA,
            payload: { updatedMessage },
          });
        }

        //---------------Reply section---------------------
        if (
          result?.section === "reply_message" &&
          result?.notification_type === "updated"
        ) {
          const message = ctx?.data?.data;
          const id = ctx?.data?.modification_ids?.message_id;

          dispatch({
            type: ACTIONS.EDIT_REPLY_MESSAGE,
            payload: {
              threadId: id,
              newMessageData: message,
            },
          });
        }

        if (
          result?.section === "reply_message" &&
          result?.notification_type === "deleted"
        ) {
          const message = ctx?.data?.modification_ids;
          const updates = ctx?.data?.update_change;

          dispatch({
            type: ACTIONS.DELETE_MESSAGE_THREAD_REPLY,
            payload: {
              threadId: message.thread_id,
              messageId: message?.message_id,
              updates,
            },
          });
        }

        // ----------------Pinned message section-------------------------
        // pinned message
        if (
          result?.section === "thread_message" &&
          result?.notification_type === "pinned_message_event"
        ) {
          const ids = ctx?.data?.modification_ids;
          const details = ctx?.data?.pinned_details;

          dispatch({
            type: ACTIONS.UPDATE_CHANNEL_PIN,
            payload: {
              threadId: ids.thread_id,
              is_pin: true,
              details,
            },
          });
        }

        // pinned reply
        if (
          result?.section === "reply_message" &&
          result?.notification_type === "pinned_message_event"
        ) {
          const ids = ctx?.data?.modification_ids;

          dispatch({
            type: ACTIONS.UPDATE_REPLY_PIN,
            payload: {
              threadId: ids.message_id,
              is_pin: true,
            },
          });
        }

        // unpinned message
        if (
          result?.section === "thread_message" &&
          result?.notification_type === "unpinned_message_event"
        ) {
          const ids = ctx?.data?.modification_ids;

          dispatch({
            type: ACTIONS.UPDATE_CHANNEL_PIN,
            payload: {
              threadId: ids.thread_id,
              is_pin: false,
            },
          });
        }

        // unpinned reply
        if (
          result?.section === "reply_message" &&
          result?.notification_type === "unpinned_message_event"
        ) {
          const ids = ctx?.data?.modification_ids;

          dispatch({
            type: ACTIONS.UPDATE_REPLY_PIN,
            payload: {
              threadId: ids.message_id,
              is_pin: false,
            },
          });
        }

        // ----------------REACTIONS SECTION-------------------------

        // thread thread
        if (
          result?.section === "thread_message" &&
          result?.notification_type === "reaction_event"
        ) {
          const ids = ctx?.data?.modification_ids;
          const reactions = ctx?.data?.reactions;

          dispatch({
            type: ACTIONS.UPDATE_CHANNEL_REACTIONS,
            payload: {
              threadId: ids.thread_id,
              reactions,
            },
          });
        }

        // channel reply
        if (
          result?.section === "reply_message" &&
          result?.notification_type === "reaction_event"
        ) {
          const ids = ctx?.data?.modification_ids;
          const reactions = ctx?.data?.reactions;
          const messageId = ids?.message_id;

          if (messageId) {
            dispatch({
              type: ACTIONS.UPDATE_REPLY_REACTIONS,
              payload: {
                messageId,
                reactions,
              },
            });
          }
        }
      };

      const onError = (ctx: any) => {
        console.error(`Subscription error: ${ctx.message}`);
      };

      sub.on("subscribed", onSubscribed);
      sub.on("publication", onPublication);
      sub.on("error", onError);

      if (sub.state !== "subscribed") {
        sub.subscribe();
      }

      // Cleanup on channel change or unmount — keep the shared connection alive
      return () => {
        sub.off("subscribed", onSubscribed);
        sub.off("publication", onPublication);
        sub.off("error", onError);
        releaseChannelSubscription(centrifugeClient, id, sub);
        dispatch({ type: ACTIONS.CHANNEL_SUBSCRIPTION, payload: null });
        dispatch({ type: ACTIONS.CLEAR_TYPING });
      };
    }
  }, [id, dispatch]);

  //

  return <div></div>;
}
