import React, { useContext, useEffect, useMemo, useState } from "react";
import { Button } from "~/components/ui/button";
import { DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { BellSimpleSlashIcon, StarIcon } from "~/svgs";
import {
  AboutTabContainer,
  PeopleTabContainer,
  AgentsTabContainer,
} from "./channel-details-tabs-content";
import FilesTabContainer from "./files-tab-container";
import { cn } from "~/lib/utils";
import { DataContext } from "~/store/GlobalState";
import { ACTIONS } from "~/store/Actions";
import { PostRequest } from "~/utils/new-request";
import { showSuccess, showError } from "~/components/toast/sonner";

function formatTabCount(count: number) {
  if (count > 1000) {
    return `${Math.floor(count / 1000)}k+`;
  }
  return String(count);
}

export const ChannelDetailsContent = ({ setIsOpen }: any) => {
  const { state, dispatch } = useContext(DataContext);
  const [muted, setMuted] = useState(false);
  const channelId =
    state?.channelDetails?.channels_id || state?.channelDetails?.id;
  const isChannelStarred = Boolean(state?.channelDetails?.is_starred);
  const [starred, setStarred] = useState(isChannelStarred);
  const [activeTab, setActiveTab] = useState(state?.activeTab);

  useEffect(() => {
    setStarred(Boolean(state?.channelDetails?.is_starred));
  }, [state?.channelDetails?.is_starred]);

  const TABS_LIST = useMemo(() => {
    const tabs = [
      { name: "about", notifs: 0 },
      { name: "people", notifs: state?.channelDetails?.users?.length || 0 },
      { name: "agents", notifs: state?.channelAgents?.length || 0 },
      { name: "files", notifs: 0 },
    ];
    return tabs;
  }, [state?.channelDetails?.users?.length, state?.channelAgents?.length]);

  const TABS_CONTENT = useMemo(() => {
    const content = [
      { name: "about", Component: AboutTabContainer },
      { name: "people", Component: PeopleTabContainer },
      { name: "agents", Component: AgentsTabContainer },
      { name: "files", Component: FilesTabContainer },
    ];
    return content;
  }, []);

  const handleMute = async () => {
    setMuted(!muted);
    // const res = await PostRequest("/");
    // if (res.status === 200 || res.status === 201) {
    // }
  };

  const handleStarred = async () => {
    if (!channelId) return;
    const nextStarred = !starred;
    setStarred(nextStarred);

    try {
      const res = await PostRequest(`/channels/${channelId}/star`);
      if (res?.status === 200 || res?.status === 201) {
        const actualStatus = res.data?.data?.is_starred ?? nextStarred;
        setStarred(actualStatus);
        dispatch({
          type: ACTIONS.UPDATE_CHANNEL_STAR,
          payload: { channelId, isStarred: actualStatus },
        });
        showSuccess(
          res.data?.message ||
            (actualStatus ? "Channel starred" : "Channel unstarred")
        );
      } else {
        setStarred(!nextStarred);
        showError("Failed to update starred status");
      }
    } catch (err) {
      setStarred(!nextStarred);
      showError("Failed to update starred status");
    }
  };

  return (
    <section className="overflow-hidden h-[600px]">
      <DialogHeader className="py-5 px-6 space-y-3.5 border-b border-[#E6EAEF]">
        <DialogTitle className="font-black text-[#1D2939] text-lg lg:text-[1.375rem] leading-8">
          # {state?.channelDetails?.name}
        </DialogTitle>

        <div className="flex items-center space-x-3 overflow-auto">
          <Button
            variant={"outline"}
            className={`h-fit p-[0.435rem] font-semibold text-[0.8125rem] text-[#344054] gap-1 ${starred ? "border-[#EAAA08] bg-amber-50/40" : ""}`}
            onClick={handleStarred}
            aria-label={starred ? "Unstar channel" : "Star channel"}
          >
            <StarIcon
              filled={starred}
              color={starred ? "#EAAA08" : "#98A2B3"}
              size={18}
            />
          </Button>

          <Button
            variant={"outline"}
            className={`h-fit p-[0.435rem] px-3 font-semibold text-[0.8125rem] text-[#344054] gap-1 ${muted ? "border-primary-500" : ""}`}
            onClick={handleMute}
          >
            <BellSimpleSlashIcon color={muted ? "rgb(113, 65, 248)" : ""} />{" "}
            Mute
          </Button>
        </div>
      </DialogHeader>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-0"
      >
        <div className="overflow-x-auto overflow-y-hidden">
          <TabsList className="p-0 px-6 h-fit bg-transparent justify-start gap-8 w-[450px] sm:w-full">
            {TABS_LIST.map(({ name, notifs }) => (
              <TabsTrigger
                key={name}
                value={name}
                onClick={(e) => e.stopPropagation()}
                className="-mb-[1.5px] py-2.5 px-1 font-bold capitalize rounded-none border-b-2 border-transparent data-[state=active]:shadow-none data-[state=active]:border-primary-500"
              >
                {name}
                {notifs != 0 && (
                  <div className="ml-1.5 min-w-[1.375rem] h-[1.375rem] px-1.5 inline-flex shrink-0 justify-center items-center rounded-full text-[0.6875rem] leading-none text-[#5757CD] bg-[#F2F4F7] tabular-nums">
                    {name === "people"
                      ? formatTabCount(state?.channelDetails?.user_count || 0)
                      : notifs}
                  </div>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {TABS_CONTENT.map(({ name, Component }) => (
          <TabsContent key={name} value={name}>
            <TabContainer
              className={
                name === "about"
                  ? "bg-[#F6F7F9] dark:bg-[#1A1D21] min-h-[32rem]"
                  : ""
              }
            >
              <Component setIsOpen={setIsOpen} />
            </TabContainer>
          </TabsContent>
        ))}
      </Tabs>
    </section>
  );
};

function TabContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "px-2 sm:px-6 py-5 border-t border-[#E6EAEF] rounded-b-[0.625rem]",
        className
      )}
    >
      {children}
    </div>
  );
}
