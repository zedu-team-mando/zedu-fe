"use client";

import { useContext, useMemo, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { Headphones, Plus, X } from "lucide-react";
import { BuzzItem } from "./buzz-item";
import UseBuzzs from "../../home/channels/hooks/use-buzzs";
import { DataContext } from "~/store/GlobalState";
import type { BuzzsFilter } from "~/types/buzzs";
import { cn } from "~/lib/utils";
import { isBuzzActive } from "./buzz-utils";
import { PostRequest } from "~/utils/new-request";
import { showError } from "~/components/toast/sonner";
import { navigateBuzzTab, prepareBuzzTab } from "~/lib/buzz/open-buzz-tab";
import Loading from "~/components/ui/loading";

const FILTER_OPTIONS: { value: BuzzsFilter; label: string }[] = [
  { value: "all", label: "All buzzes" },
  { value: "active", label: "Active" },
  { value: "ended", label: "Ended" },
];

export const BuzzList = () => {
  const { state } = useContext(DataContext);
  const { orgSlug } = state;
  const { buzzes, fetchMoreData, hasMore, loading, totalItems } = UseBuzzs();
  const [filter, setFilter] = useState<BuzzsFilter>("all");
  const [showHero, setShowHero] = useState(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem("buzzs-hero-dismissed") !== "true";
  });
  const [startingBuzz, setStartingBuzz] = useState(false);

  const filteredBuzzes = useMemo(() => {
    if (filter === "active") {
      return buzzes.filter((buzz) => isBuzzActive(buzz));
    }

    if (filter === "ended") {
      return buzzes.filter((buzz) => !isBuzzActive(buzz));
    }

    return buzzes;
  }, [buzzes, filter]);

  const dismissHero = () => {
    setShowHero(false);
    localStorage.setItem("buzzs-hero-dismissed", "true");
  };

  const handleStartBuzz = async () => {
    if (!orgSlug) return;

    const tab = prepareBuzzTab();
    if (!tab) return;

    setStartingBuzz(true);

    try {
      const createRes = await PostRequest("/buzz/org/create", {});

      if (createRes.status === 200 || createRes.status === 201) {
        const buzzId = createRes.data.data.buzz_code;
        navigateBuzzTab(tab, orgSlug, buzzId, { directJoin: true });
      } else {
        tab.close();
      }
    } catch {
      tab.close();
      showError("Failed to start buzz. Please try again.");
    } finally {
      setStartingBuzz(false);
    }
  };

  return (
    <div className="flex h-full w-full flex-col bg-white">
      <div className="flex shrink-0 items-center justify-between border-b border-[#E6EAEF] px-5 py-4">
        <h1 className="text-[22px] font-bold text-[#1D2939] dark:text-zinc-100">
          Buzzes
        </h1>
        <button
          type="button"
          onClick={handleStartBuzz}
          disabled={startingBuzz}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#D0D5DD] bg-white px-3.5 py-2 text-sm font-semibold text-[#344054] transition hover:bg-[#F9FAFB] disabled:opacity-60"
        >
          <Plus className="size-4" />
          {startingBuzz ? "Starting..." : "New Buzz"}
        </button>
      </div>

      <div id="buzzsScrollable" className="flex-1 overflow-y-auto">
        {showHero && (
          <div className="relative mx-5 mt-5 overflow-hidden rounded-xl border border-[#ABEFC6] bg-[#ECFDF3] dark:border-emerald-800/50 dark:bg-[#163226]">
            <button
              type="button"
              onClick={dismissHero}
              className="absolute right-3 top-3 rounded-md p-1 text-[#667085] transition hover:bg-white/60 dark:text-zinc-400 dark:hover:bg-white/10"
              aria-label="Dismiss"
            >
              <X className="size-4" />
            </button>

            <div className="flex flex-col gap-5 p-5 md:flex-row md:items-center md:justify-between">
              <div className="max-w-xl pr-8">
                <h2 className="text-[20px] font-bold leading-tight text-[#1D2939] dark:text-zinc-100">
                  Instantly connect over audio or video
                </h2>
                <p className="mt-2 text-sm leading-6 text-[#667085] dark:text-zinc-400">
                  Buzzes are lightweight audio and video spaces for your team.
                  Start one for a channel, a quick sync, or an impromptu
                  conversation.
                </p>
                <button
                  type="button"
                  onClick={handleStartBuzz}
                  disabled={startingBuzz}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#1264A3] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0F5A93] disabled:opacity-60"
                >
                  <Headphones className="size-4" />
                  {startingBuzz ? "Starting..." : "Start a Buzz"}
                </button>
              </div>

              <div className="hidden h-28 w-56 shrink-0 rounded-xl border border-[#ABEFC6] bg-white/70 p-4 dark:border-emerald-800/40 dark:bg-white/5 md:flex md:flex-col md:justify-between">
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded-full bg-[#F2F4F7] dark:bg-zinc-700" />
                  <div className="size-8 rounded-full bg-[#E0EAFF] dark:bg-blue-900/50" />
                  <div className="flex size-8 items-center justify-center rounded-full bg-[#1264A3] text-xs font-bold text-white">
                    +3
                  </div>
                </div>
                <div className="flex items-center justify-center gap-3 rounded-lg bg-[#F9FAFB] py-2 dark:bg-zinc-800/80">
                  <span className="size-2 rounded-full bg-[#667085] dark:bg-zinc-500" />
                  <span className="size-2 rounded-full bg-[#667085] dark:bg-zinc-500" />
                  <span className="size-2 rounded-full bg-[#667085] dark:bg-zinc-500" />
                  <span className="size-2 rounded-full bg-[#1264A3]" />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="px-5 pb-3 pt-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-[15px] font-bold text-[#1D2939]">
              Recent buzzes
            </h2>

            <div className="flex flex-wrap items-center gap-2">
              {FILTER_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFilter(option.value)}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm font-medium transition",
                    filter === option.value
                      ? "border-[#1264A3] bg-[#F0F7FC] text-[#1264A3]"
                      : "border-[#D0D5DD] bg-white text-[#344054] hover:bg-[#F9FAFB]"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mx-5 mb-6 overflow-hidden rounded-xl border border-[#E6EAEF] bg-white">
          {loading && filteredBuzzes.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <Loading color="#1264A3" />
            </div>
          ) : filteredBuzzes.length > 0 ? (
            <InfiniteScroll
              dataLength={filteredBuzzes.length}
              next={fetchMoreData}
              hasMore={hasMore && filter === "all"}
              loader={
                <p className="py-6 text-center text-xs text-[#667085]">
                  Loading more buzzes...
                </p>
              }
              scrollableTarget="buzzsScrollable"
            >
              {filteredBuzzes.map((buzz) => (
                <BuzzItem key={buzz.buzz_id} buzz={buzz} />
              ))}
            </InfiniteScroll>
          ) : (
            <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
              <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-[#F2F4F7]">
                <Headphones
                  className="size-8 text-[#98A2B3]"
                  strokeWidth={1.5}
                />
              </div>
              <h3 className="mb-2 text-lg font-bold text-[#344054]">
                {filter === "all" ? "No buzzes yet" : `No ${filter} buzzes`}
              </h3>
              <p className="max-w-sm text-sm text-[#667085]">
                {filter === "all"
                  ? "When your team starts a buzz, it will show up here so you can jump back in anytime."
                  : "Try switching filters or start a new buzz for your organisation."}
              </p>
              <button
                type="button"
                onClick={handleStartBuzz}
                disabled={startingBuzz}
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#1264A3] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0F5A93] disabled:opacity-60"
              >
                <Plus className="size-4" />
                Start a Buzz
              </button>
            </div>
          )}
        </div>

        {!loading && totalItems > 0 && filter === "all" && (
          <p className="px-5 pb-6 text-sm text-[#667085]">
            {totalItems} buzz{totalItems === 1 ? "" : "es"} in this organisation
          </p>
        )}
      </div>
    </div>
  );
};
