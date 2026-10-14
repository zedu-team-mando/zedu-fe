"use client";

import { Lock } from "lucide-react";
import React, { useContext, useEffect, useRef } from "react";
import { DataContext } from "~/store/GlobalState";

const RestrictedChannel = () => {
  const { state } = useContext(DataContext);
  const channelName = state?.channelDetails?.name;
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateHeight = () => {
      const height = Math.ceil(el.getBoundingClientRect().height);
      document.documentElement.style.setProperty(
        "--chat-composer-height",
        `${Math.max(height + 16, 140)}px`
      );
    };

    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(el);

    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty("--chat-composer-height");
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative z-20 w-full bg-white pb-3 dark:bg-[#1A1D21]"
    >
      <div className="mx-3 md:mx-5 rounded-xl border border-[#E6EAEF] dark:border-white/10 bg-[#F9FAFB] dark:bg-[#222529] px-4 py-6 flex flex-col items-center justify-center text-center">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#EEF4FF] dark:bg-[#5757CD]/20 text-[#5757CD]">
          <Lock className="h-5 w-5" />
        </div>
        <h2 className="text-base font-semibold text-[#101828] dark:text-zinc-100">
          Only admins can send messages in this channel.
        </h2>
        <p className="mt-1 max-w-md text-sm text-[#667085] dark:text-zinc-400">
          Posting in {channelName ? `#${channelName}` : "this channel"} is
          restricted. You can still read messages
          {channelName ? ` in #${channelName}` : ""}.
        </p>
      </div>
    </div>
  );
};

export default RestrictedChannel;
