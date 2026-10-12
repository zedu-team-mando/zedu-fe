"use client";

import {
  Menu,
  XIcon,
  Settings,
  UserPlus,
  ChevronDown,
  ChevronUp,
  Pin,
} from "lucide-react";
import { PinIcon } from "~/svgs/index";
import { usePathname } from "next/navigation";
import { useContext, useState, useEffect } from "react";
import UseFirstChannel from "~/app/(client)/[org]/home/channels/hooks/first-channel";
import {
  GetRequest,
  PutRequest,
  PostRequest,
  DeleteRequest,
} from "~/utils/new-request";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet";
import { orderResponseAlphabetically } from "~/utils/utils";
import { ACTIONS } from "~/store/Actions";
import { DataContext } from "~/store/GlobalState";
import { AddIcon } from "~/svgs";
import { Button } from "~/components/ui/button";
import { OrgList, OrgLogo } from "./org-logo";
import Link from "next/link";
import { ScrollArea } from "~/components/ui/scroll-area";
import { SearchInput } from "~/components/search/search-bar";
import { showSuccess } from "~/components/toast/sonner";
import MiniWidget from "~/app/(client)/[org]/_components/buzz-management/mini-widget";
import PillWidget from "~/app/(client)/[org]/_components/buzz-management/pill-widget";
import {
  redirectAfterOrgSwitch,
  resolveChannelIdForOrgSwitch,
} from "~/utils/org-switch";
import { RequirePermission } from "~/components/rbac/RequirePermission";
import { useRBAC } from "~/hooks/useRBAC";
import { isOwnerOrAdministrator } from "~/utils/rbac";
import NavigationHistory from "~/components/layout/topbar/navigation-history";

const Topbar = () => {
  const name: string = localStorage.getItem("channelName") || "";
  const { state, dispatch } = useContext(DataContext);
  const pathname = usePathname();
  const { orgSlug, orgMembers, orgMembersTotal, orgData } = state;
  const { userRole } = useRBAC();
  const memberCount = orgMembersTotal || orgMembers?.length || 0;
  const settingsHref = isOwnerOrAdministrator(userRole)
    ? `/${orgSlug}/settings/organisation/general`
    : `/${orgSlug}/settings/personal/account`;
  const [organisations, setOrganisations] = useState<any>(null);
  const [orgloading, setOrgloading] = useState(true);
  const [pinnedCallback, setPinnedCallback] = useState(false);
  const { firstChannel } = UseFirstChannel();
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    const org_id = localStorage.getItem("orgId") || "";

    const fetchOrg = async () => {
      const res = await GetRequest("/users/organisations");
      if (res?.status === 200 || res?.status === 201) {
        const result: any = orderResponseAlphabetically(res?.data?.data);
        setOrganisations(result);

        // find through the data to get the organisation with the id
        // const org = res?.data?.data?.find((item: any) => item.id === org_id);
        // dispatch({ type: ACTIONS.ORG_DATA, payload: org });
        // dispatch({ type: ACTIONS.ORG_ID, payload: org?.id });
        // localStorage.setItem("orgId", org?.id);
        setOrgloading(false);
      }
    };

    fetchOrg();
  }, [state?.callback, dispatch, pinnedCallback]);

  const handlePin = async (id: string) => {
    const payload = {
      org_id: id,
    };

    const res = await PostRequest("/organisations/pin", payload);
    if (res?.status === 200 || res?.status === 201) {
      setPinnedCallback(!pinnedCallback);
      showSuccess(res.data.message);
    }
  };

  const handleDelete = async (id: string) => {
    const res = await DeleteRequest(`/organisations/pin/${id}`);
    if (res?.status === 200 || res?.status === 201) {
      setPinnedCallback(!pinnedCallback);
      showSuccess(res.data.message);
    }
  };

  const handleOrg = async (item: any) => {
    localStorage.removeItem("channelId");

    dispatch({ type: ACTIONS.LOADING, payload: true });

    try {
      const payload = {
        current_org: item?.id,
      };

      const res = await PutRequest("/users/switch-org", payload);

      if (res?.status !== 200 && res?.status !== 201) {
        dispatch({ type: ACTIONS.LOADING, payload: false });
        return;
      }

      const slug = res.data.data.current_organisation_slug;
      const orgId = res?.data?.data?.organisation?.id;

      localStorage.setItem("token", res?.data?.data?.access_token);
      localStorage.setItem("orgId", orgId);
      localStorage.setItem("orgSlug", slug);

      setIsWorkspaceModalOpen(false);
      setIsSheetOpen(false);

      const channelId = await resolveChannelIdForOrgSwitch(firstChannel, orgId);

      redirectAfterOrgSwitch(slug, channelId);
    } catch {
      dispatch({ type: ACTIONS.LOADING, payload: false });
    }
  };

  return (
    <div className="fixed h-[60px] w-full z-40 lg:gap-0 gap-2 flex items-center justify-between px-4 lg:px-6 py-1 lg:py-3 bg-blue-500 text-white">
      {/* Leftmost section: Workspace button */}

      <div className="flex items-center gap-3 lg:gap-6 relative">
        {orgloading ? (
          <div className="flex items-center gap-1 lg:w-4/10">
            <div className="flex items-center gap-2 animate-pulse">
              <div className="h-[30px] w-[30px] lg:h-[36px] lg:w-[36px] rounded-sm bg-white/30" />
              <div className="hidden lg:flex flex-col gap-1">
                <div className="h-3 w-24 rounded bg-white/30" />
                <div className="h-2 w-16 rounded bg-white/20" />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-1 min-w-[50px]">
            {/* Mobile Sheet */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button className="bg-blue-300 px-2 py-1.5 rounded-lg flex items-center gap-1.5">
                  <div className="w-[28px] h-[28px] rounded-md bg-white/90 flex items-center justify-center shadow-sm">
                    <OrgLogo
                      logo_url={orgData?.logo_url}
                      name={orgData?.name}
                    />
                  </div>
                  <ChevronDown className="w-4 h-4 flex-shrink-0" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[320px] p-0 pt-6">
                <div className="px-4">
                  <div className="flex items-center gap-2 pb-3">
                    <div className="w-[35px] h-[35px] rounded-sm bg-[#2e8dff] flex items-center justify-center">
                      <OrgLogo
                        logo_url={orgData?.logo_url}
                        name={orgData?.name}
                      />
                    </div>
                    <div className="flex-grow flex items-center justify-between">
                      <div className="flex flex-col">
                        <p className="text-black text-base font-semibold  truncate max-w-[180px]">
                          {orgData?.name ?? ""}
                        </p>
                        <span className="text-xs text-gray-500">
                          {memberCount} {memberCount === 1 ? "user" : "users"}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">current</span>
                    </div>
                  </div>
                  <div className="flex gap-2 pb-3">
                    <Link
                      href={settingsHref}
                      className="flex-grow border border-gray-300 text-gray-700 text-sm py-2 rounded-md hover:bg-gray-50 flex items-center justify-center gap-1"
                      onClick={() => setIsSheetOpen(false)}
                    >
                      <Settings size={16} />
                      Settings
                    </Link>
                    <RequirePermission permission="invite:members">
                      <button
                        className="flex-grow border border-gray-300 text-gray-700 text-sm py-2 rounded-md hover:bg-gray-50 flex items-center justify-center gap-1"
                        onClick={() => {
                          dispatch({
                            type: ACTIONS.INVITE_MODAL,
                            payload: true,
                          });
                          setIsSheetOpen(false);
                        }}
                      >
                        <UserPlus size={16} />
                        Invite
                      </button>
                    </RequirePermission>
                  </div>
                </div>

                {organisations?.length > 1 && (
                  <div className="border-b border-gray-300" />
                )}
                <ScrollArea className="h-[calc(100vh-250px)]">
                  <div className="bg-white">
                    {organisations.length > 1 && (
                      <>
                        <div className="py-3 px-6">
                          <p className="text-xs text-gray-400 mb-2">Pinned</p>
                          {!organisations.some(
                            (item: any) =>
                              item.pinned === true &&
                              item.name !== orgData?.name
                          ) && (
                            <span className="text-sm text-gray-400 px-3 flex items-center justify-center py-2">
                              No pinned organisations
                            </span>
                          )}
                          {organisations.map((item: any, index: number) => {
                            if (orgData?.name === item.name || !item.pinned)
                              return;
                            return (
                              <OrgList
                                key={index}
                                name={item.name}
                                pinned
                                logo_url={item.logo_url}
                                onClick={() => handleOrg(item)}
                                notificationCount={
                                  item?.total_messages_count ?? 0
                                }
                                onPin={
                                  item?.pinned
                                    ? () => handleDelete(item?.id)
                                    : () => handlePin(item?.id)
                                }
                              />
                            );
                          })}
                        </div>
                        {organisations.some(
                          (item: any) =>
                            item?.pinned === false &&
                            item.name !== orgData?.name
                        ) && (
                          <>
                            <div className="border-b border-gray-200" />
                            <div className="py-3 px-6">
                              <p className="text-xs text-gray-400 mb-2">
                                Others
                              </p>
                              {organisations.map((item: any, index: number) => {
                                if (orgData?.name === item.name) return;
                                if (item?.pinned) return;
                                return (
                                  <OrgList
                                    key={index}
                                    name={item.name}
                                    logo_url={item.logo_url}
                                    onClick={() => handleOrg(item)}
                                    onPin={() => handlePin(item?.id)}
                                    notificationCount={
                                      item?.total_messages_count ?? 0
                                    }
                                  />
                                );
                              })}
                            </div>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </ScrollArea>
                <div className="absolute bottom-0 left-0 right-0 h-14 w-full bg-white border-t px-3 py-2 flex items-center justify-center">
                  <Link
                    href={`/${orgSlug}/organization/create`}
                    className="border border-neutral-600 rounded-[8px] flex gap-2 text-neutral-600 w-full items-center justify-center py-1 hover:bg-neutral-100 transition-colors font-medium"
                    onClick={() => setIsSheetOpen(false)}
                  >
                    <AddIcon />
                    <span>Add organisation</span>
                  </Link>
                </div>
              </SheetContent>
            </Sheet>

            {/* Desktop Popover */}
            <Popover
              open={isWorkspaceModalOpen}
              onOpenChange={setIsWorkspaceModalOpen}
            >
              <div className="hidden lg:flex items-center justify-evenly gap-2">
                <PopoverTrigger asChild>
                  <Button className="bg-blue-300 text-white -ml-3 px-3 py-2 rounded-md flex items-center gap-2">
                    <div className="w-[23px] h-[23px] rounded-sm border flex items-center justify-center capitalize">
                      <OrgLogo
                        logo_url={orgData?.logo_url}
                        name={orgData?.name}
                      />
                    </div>
                    <span className="truncate max-w-44" title={orgData?.name}>
                      {orgData?.name ? orgData.name : ""}
                    </span>
                    <span className="h-full flex items-center justify-center mt-0.5">
                      {!isWorkspaceModalOpen ? <ChevronDown /> : <ChevronUp />}
                    </span>
                  </Button>
                </PopoverTrigger>
              </div>

              <PopoverContent
                className="w-[330px] overflow-hidden mt-1 rounded-xl flex flex-col gap-1 justify-between px-0 p-0 pt-4 z-50"
                align="start"
              >
                <div className="px-4">
                  <div className="flex items-center gap-2 pb-2">
                    <div className="w-[30px] h-[30px] rounded-sm bg-[#2e8dff] flex items-center justify-center">
                      <OrgLogo
                        logo_url={orgData?.logo_url}
                        name={orgData?.name}
                      />
                    </div>
                    <div className="flex-grow flex items-center justify-between">
                      <div className="flex flex-col">
                        <p className="text-black text-sm font-semibold truncate max-w-[180px]">
                          {orgData?.name ?? ""}
                        </p>
                        <span className=" text-xs text-gray-500">
                          {memberCount} {memberCount === 1 ? "user" : "users"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-0.5 items-center h-full">
                        <span className="text-xs text-gray-500">current</span>
                        <button
                          onClick={() => {
                            orgData?.pinned
                              ? handleDelete(orgData?.id)
                              : handlePin(orgData?.id);
                          }}
                          className="rounded-sm p-2 hover:bg-gray-200 z-10"
                        >
                          {orgData?.pinned ? (
                            <PinIcon />
                          ) : (
                            <Pin
                              size={16}
                              fontWeight={2}
                              className="text-gray-500"
                            />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                  {/* Buttons section */}
                  <div className="flex gap-2  pb-2 ">
                    <Link
                      href={settingsHref}
                      className="flex-grow border border-gray-300 text-gray-700 text-sm py-1 rounded-md hover:bg-gray-50 flex items-center justify-center gap-1"
                    >
                      <Settings size={16} />
                      Settings
                    </Link>
                    <RequirePermission permission="invite:members">
                      <button
                        className="flex-grow border border-gray-300 text-gray-700 text-sm py-1 rounded-md hover:bg-gray-50 flex items-center justify-center gap-1"
                        onClick={() =>
                          dispatch({
                            type: ACTIONS.INVITE_MODAL,
                            payload: true,
                          })
                        }
                      >
                        <UserPlus size={16} />
                        Invite
                      </button>
                    </RequirePermission>
                  </div>
                </div>

                {organisations?.length > 1 && (
                  <div className="border-b border-gray-300" />
                )}
                <ScrollArea className="h-44">
                  <div className="bg-white -mx-4">
                    {organisations.length > 1 && (
                      <>
                        <div className="py-2 px-8">
                          <p className="text-xs text-gray-400 mb-0.5 -mt-1">
                            Pinned
                          </p>
                          {!organisations.some(
                            (item: any) =>
                              item.pinned === true &&
                              item.name !== orgData?.name
                          ) && (
                            <span className="text-sm text-gray-400 px-3 flex items-center justify-center">
                              You have no pinned organisations yet!!
                            </span>
                          )}
                          {organisations.map((item: any, index: number) => {
                            if (orgData?.name === item.name || !item.pinned)
                              return;
                            return (
                              <OrgList
                                key={index}
                                name={item.name}
                                pinned
                                logo_url={item.logo_url}
                                onClick={() => handleOrg(item)}
                                notificationCount={
                                  item?.total_messages_count ?? 0
                                }
                                onPin={
                                  item?.pinned
                                    ? () => handleDelete(item?.id)
                                    : () => handlePin(item?.id)
                                }
                              />
                            );
                          })}
                        </div>
                        {organisations.some(
                          (item: any) =>
                            item?.pinned === false &&
                            item.name !== orgData?.name
                        ) && (
                          <>
                            <div className="border-b border-gray-200 -mx-4" />
                            <div className="mt-2 px-8">
                              <p className="text-xs text-gray-400 pb-0.5">
                                Others
                              </p>
                              {organisations.map((item: any, index: number) => {
                                if (orgData?.name === item.name) return;
                                if (item?.pinned) return;
                                return (
                                  <OrgList
                                    key={index}
                                    name={item.name}
                                    logo_url={item.logo_url}
                                    onClick={() => handleOrg(item)}
                                    onPin={() => handlePin(item?.id)}
                                    notificationCount={
                                      item?.total_messages_count ?? 0
                                    }
                                  />
                                );
                              })}
                            </div>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </ScrollArea>
                <div className="h-12 w-full bg-white px-3 py-2 flex items-center justify-center">
                  <Link
                    href={`/${orgSlug}/organization/create`}
                    className="border border-neutral-600 rounded-[8px] flex gap-2 text-neutral-600 w-full items-center justify-center py-1 hover:bg-neutral-100 transition-colors font-medium"
                  >
                    <AddIcon />
                    <span>Add a new organisation</span>
                  </Link>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )}

        <div
          className="flex lg:hidden"
          onClick={() =>
            dispatch({
              type: ACTIONS.OPEN_SIDEBAR,
              payload: !state?.openSidebar,
            })
          }
        >
          {!state?.openSidebar ? (
            <Menu />
          ) : (
            <XIcon
              className="text-white cursor-pointer"
              onClick={() =>
                dispatch({ type: ACTIONS.OPEN_SIDEBAR, payload: false })
              }
            />
          )}
        </div>
      </div>

      {!pathname.includes(`/${orgSlug}/welcome`) && (
        <div className="flex min-w-0 items-center sm:flex-1 sm:max-w-2xl">
          <NavigationHistory />
          <div className="hidden min-w-0 sm:block sm:flex-1">
            <SearchInput name={name} orgId={orgData?.id} />
          </div>
        </div>
      )}

      {/* Rightmost section: AI Credits */}
      <div className="flex h-full min-w-0 lg:w-auto items-center lg:py-1 mr-2 lg:mr-0 lg:gap-6">
        <PillWidget />
        <MiniWidget />
      </div>
    </div>
  );
};

export default Topbar;
