"use client";

import { PhoneCallIcon } from "lucide-react";
import React, { useContext, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { DataContext } from "~/store/GlobalState";
import { ACTIONS } from "~/store/Actions";
import {
  BellIcon,
  DMsIcon,
  GearIcon,
  HomeIcon,
  PeopleIcon,
  AgentsIcon,
  FileIcon,
} from "~/svgs";
import ProfileDropdown from "~/app/(client)/[org]/_components/profile-dropdown";
import UseHomeChannel from "~/app/(client)/[org]/home/channels/hooks/home-channels";
import SidebarPopouts from "./popouts/sidebar-popouts";
import {
  clearNotificationBadgeRegistry,
  isHomeRoute,
  isNotificationsRoute,
} from "~/lib/notifications/notification-badge";

const SideBar: React.FC = () => {
  const pathname = usePathname();
  const { state, dispatch } = useContext(DataContext);
  const { user, orgSlug, notificationBadgeState } = state;
  const channelId = localStorage.getItem("channelId") || "";
  const notificationBadgeCount = notificationBadgeState?.count ?? 0;

  useEffect(() => {
    if (!isHomeRoute(pathname) && !isNotificationsRoute(pathname)) return;

    clearNotificationBadgeRegistry();
    dispatch({ type: ACTIONS.CLEAR_NOTIFICATION_BADGE });
  }, [pathname, dispatch]);

  // set channel name to empty string
  const searchValue = () => {
    localStorage.setItem("channelName", "");
    dispatch({ type: ACTIONS.OPEN_SIDEBAR, payload: false });
  };

  //

  return (
    <>
      <UseHomeChannel />
      <SidebarPopouts />
      <div
        className={`fixed w-[80px] min-w-[90px] h-screen bg-blue-500 top-[40px] z-30 lg:translate-x-0 transition-transform duration-300 ease-in-out
               ${state?.openSidebar === true ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div
          className="flex h-[calc(100dvh-50px)] mt-4 pt-1 pb-3 justify-center"
          onClick={searchValue}
        >
          <div
            data-sidebar-rail
            className={`bg-blue-300 h-full rounded-[8px] px-[10px] py-4 flex flex-col items-center overflow-y-auto no-scrollbar`}
          >
            {!pathname.includes(`/${orgSlug}/welcome`) &&
              !pathname.includes(`/${orgSlug}/invited`) && (
                <div className="h-full w-full text-[#344054] rounded-[16px] z-auto flex flex-col justify-between">
                  <div className="relative flex flex-col h-full justify-between">
                    <div
                      className="flex flex-col gap-3 md:gap-0.5 items-center text-[12px]"
                      onClick={() =>
                        dispatch({ type: ACTIONS.OPEN_SIDEBAR, payload: false })
                      }
                    >
                      <Link
                        href={
                          channelId
                            ? `/${orgSlug}/home/channels/${channelId}`
                            : `/${orgSlug}`
                        }
                        className={`flex flex-col group items-center justify-center p-1 ${
                          pathname === `/${orgSlug}/home`
                            ? "font-medium scale-[1.05]"
                            : "hover:font-medium "
                        } `}
                      >
                        <span
                          className={` rounded-[7px] p-2 ${
                            pathname === `/${orgSlug}` ||
                            pathname?.includes("/home")
                              ? "bg-blue-200"
                              : "group-hover:bg-blue-200"
                          }`}
                        >
                          <HomeIcon />
                        </span>
                        <span className="text-white text-[12px]">Home</span>
                      </Link>

                      <Link
                        href={`/${orgSlug}/dm`}
                        data-sidebar-preview="dms"
                        className={`flex flex-col group items-center justify-center p-1 ${
                          pathname === `/${orgSlug}`
                            ? "font-medium scale-[1.05]"
                            : "hover:font-medium "
                        } `}
                      >
                        <span
                          className={` rounded-[7px] p-2 ${
                            pathname?.includes(`/${orgSlug}/dm`)
                              ? "bg-blue-200"
                              : "group-hover:bg-blue-200"
                          }`}
                        >
                          <DMsIcon />
                        </span>
                        <span className="text-white  text-[12px]">DMs</span>
                      </Link>

                      <Link
                        href={`/${orgSlug}/people`}
                        data-sidebar-preview="people"
                        className={`flex flex-col group items-center justify-center p-1 ${
                          pathname?.includes(`/${orgSlug}/people`)
                            ? "font-medium scale-[1.05]"
                            : "hover:font-medium "
                        } `}
                      >
                        <span
                          className={`rounded-[7px] p-2 ${
                            pathname?.includes(`/${orgSlug}/people`)
                              ? "bg-blue-200"
                              : "group-hover:bg-blue-200"
                          }`}
                        >
                          <PeopleIcon />
                        </span>
                        <span className="text-white  text-[12px]">People</span>
                      </Link>

                      {/* <Link
                        href={`/${orgSlug}/colleagues`}
                        className={`flex flex-col group items-center justify-center p-1 ${
                          pathname === `/${orgSlug}/colleagues`
                            ? "font-medium scale-[1.05]"
                            : "hover:font-medium "
                        } `}
                      >
                        <span
                          className={` rounded-[7px] p-2 ${
                            pathname?.includes(`/${orgSlug}/colleagues`)
                              ? "bg-blue-200"
                              : "group-hover:bg-blue-200"
                          }`}
                        >
                          <AgentsIcon />
                        </span>
                        <div className="text-white  text-[12px] text-center">
                          Agents
                        </div>
                      </Link> */}

                      {/* <Link
                        href={`/${orgSlug}/later`}
                        className={`flex flex-col group items-center justify-center p-1 ${
                          pathname === `/${orgSlug}/later`
                            ? "font-medium scale-[1.05]"
                            : "hover:font-medium "
                        } `}
                      >
                        <span
                          className={` rounded-[7px] p-2 ${
                            pathname?.includes(`/${orgSlug}/later`)
                              ? "bg-blue-200"
                              : "group-hover:bg-blue-200"
                          }`}
                        >
                          <Bookmark color="white" size={20} />
                        </span>
                        <span className="text-white  text-[12px]">Later</span>
                      </Link> */}

                      <Link
                        href={`/${orgSlug}/files`}
                        className={`flex flex-col group items-center justify-center p-1 ${
                          pathname === `/${orgSlug}/files`
                            ? "font-medium scale-[1.05]"
                            : "hover:font-medium "
                        } `}
                      >
                        <span
                          className={` rounded-[7px] p-2 block ${
                            pathname?.includes(`/${orgSlug}/files`)
                              ? "bg-blue-200"
                              : "group-hover:bg-blue-200"
                          }`}
                        >
                          <FileIcon />
                        </span>
                        <span className="text-white  text-[12px]">Files</span>
                      </Link>

                      <Link
                        href={`/${orgSlug}/buzz`}
                        className={`flex flex-col group items-center justify-center p-1 ${
                          pathname === `/${orgSlug}/buzz`
                            ? "font-medium scale-[1.05]"
                            : "hover:font-medium "
                        } `}
                      >
                        <span
                          className={` rounded-[7px] p-2 block ${
                            pathname?.includes(`/${orgSlug}/buzz`)
                              ? "bg-blue-200"
                              : "group-hover:bg-blue-200"
                          }`}
                        >
                          <PhoneCallIcon color="white" size={20} />
                        </span>
                        <span className="text-white  text-[12px]">Buzz</span>
                      </Link>
                    </div>

                    <div className="relative flex flex-col items-center overflow-visible">
                      <Link
                        href={`/${orgSlug}/notifications`}
                        className={`flex flex-col group z-50 cursor-pointer items-center justify-center w-full p-1 ${
                          pathname === `/${orgSlug}/notifications`
                            ? "font-medium scale-[1.05]"
                            : "hover:font-medium "
                        } `}
                      >
                        <span
                          className={`relative overflow-visible p-2 rounded-[7px]  ${
                            pathname?.includes(`/${orgSlug}/notifications`)
                              ? "bg-blue-200"
                              : "group-hover:bg-blue-200"
                          }`}
                        >
                          <BellIcon />
                          {notificationBadgeCount > 0 && (
                            <span className="pointer-events-none absolute -right-1 -top-1 z-10 flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-blue-300 bg-[#F04438] px-1 text-[10px] font-semibold leading-none text-white">
                              {notificationBadgeCount > 99
                                ? "99+"
                                : notificationBadgeCount}
                            </span>
                          )}
                        </span>
                      </Link>

                      <Link
                        href={`/${orgSlug}/settings/personal/account`}
                        aria-label="Settings"
                        className={`flex flex-col group z-50 cursor-pointer mb-2 items-center justify-center w-full ${
                          pathname === `/${orgSlug}/settings`
                            ? "font-medium scale-[1.05]"
                            : "hover:font-medium "
                        } `}
                      >
                        <span
                          className={`p-2 rounded-[7px]  ${
                            pathname?.includes(`/${orgSlug}/settings`)
                              ? "bg-blue-200"
                              : "group-hover:bg-blue-200"
                          }`}
                        >
                          <GearIcon />
                        </span>
                      </Link>

                      <ProfileDropdown user={user} />
                    </div>
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SideBar;
