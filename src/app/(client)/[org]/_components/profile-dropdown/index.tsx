import React, { useContext, useEffect, useState } from "react";
import Image from "next/image";
import { Pencil, Rocket, Smile } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import images from "~/assets/images";
import { DataContext } from "~/store/GlobalState";
import { ACTIONS } from "~/store/Actions";
import StatusModal from "../status";
import { PostRequest } from "~/utils/new-request";
import Link from "next/link";

interface ProfileDropdownProps {
  user: any;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ user }) => {
  const { state, dispatch } = useContext(DataContext);
  const { orgData, user: userData, orgSlug } = state;
  const [showDropdown, setShowDropdown] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [emoji, setEmoji] = useState("");

  useEffect(() => {
    setStatusText(userData?.text || "");
    setEmoji(userData?.icon || "");
  }, [userData]);

  const showProfile = () => {
    dispatch({ type: ACTIONS.PROFILE, payload: user });
    dispatch({ type: ACTIONS.SHOW_USER_PROFILE, payload: true });
  };

  // logout user
  const handleLogout = async () => {
    localStorage.clear();
    window.location.href = "/auth/login";
  };

  // clear status
  const handleClear = async () => {
    setEmoji("");
    setStatusText("");

    const payload = {
      icon: "",
      text: "",
      status_timeout: "",
      pause_notification: false,
      clear_status: true,
      online: false,
    };

    const res = await PostRequest("/profile/change-status", payload);
    if (res?.status === 200 || res?.status === 201) {
      dispatch({
        type: ACTIONS.PROFILE_CALLBACK,
        payload: !state?.profileCallback,
      });
      dispatch({
        type: ACTIONS.STATUS_CALLBACK,
        payload: !state?.statusCallback,
      });
    }
  };

  const handleAway = async () => {
    const payload = {
      icon: userData?.icon,
      text: userData?.text,
      status_timeout: userData?.status_timeout || "",
      pause_notification: false,
      clear_status: false,
      online: userData?.online === false ? true : false,
    };

    const res = await PostRequest("/profile/change-status", payload);
    if (res?.status === 200 || res?.status === 201) {
      dispatch({
        type: ACTIONS.PROFILE_CALLBACK,
        payload: !state?.profileCallback,
      });
      dispatch({
        type: ACTIONS.STATUS_CALLBACK,
        payload: !state?.statusCallback,
      });
    }
  };

  const handleClick = () => {
    dispatch({ type: ACTIONS.STATUS, payload: true });
    setShowDropdown(false);
  };

  const toggleStatus = userData?.online === false ? "active" : "away";

  //

  return (
    <div className="relative">
      <DropdownMenu open={showDropdown} onOpenChange={setShowDropdown}>
        <DropdownMenuTrigger asChild>
          <div
            className={`flex items-center justify-center flex-col rounded-md cursor-pointer bg-blue-300 ${emoji || statusText ? "pt-2" : ""}`}
          >
            <span className="text-sm">{emoji}</span>

            <div
              className="rounded-md h-[36px] w-[36px] cursor-pointer hover:opacity-90"
              onClick={() => setShowDropdown(true)}
            >
              <Image
                src={
                  user?.avatar_url || user?.default_avatar_url || images?.user
                }
                alt=""
                width={36}
                height={36}
                className="rounded-md w-full h-full"
              />
            </div>
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className="w-[300px] p-0 mb-8 ml-2"
          side="right"
          align="start"
          sideOffset={5}
        >
          {/* User Info */}
          <div className="p-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-[36px] h-[36px] rounded-md overflow-hidden border">
                <Image
                  src={
                    user?.avatar_url || user?.default_avatar_url || images?.user
                  }
                  alt=""
                  width={36}
                  height={36}
                  className="rounded-md"
                />
              </div>
              <div>
                <h3 className="font-semibold text-sm">
                  {user?.username || user?.full_name}
                </h3>
                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-2 h-2 rounded-full ${userData?.online === false ? "bg-gray-500" : "bg-green-600"}`}
                  />
                  <span className="text-xs text-gray-500">
                    {userData?.online === false ? "Away" : "Active"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Status Update */}
          <div className="px-5 py-1 mb-2">
            <div
              className={`rounded-md border px-3 h-[40px] flex items-center cursor-pointer transition-all ${
                hovered ? "bg-gray-50 border-gray-300" : "border-gray-200"
              }`}
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
              onClick={handleClick}
            >
              {(emoji || statusText) && (
                <div className="flex items-center gap-2 text-gray-500">
                  {hovered ? (
                    <Pencil className="w-[18px] h-[18px]" />
                  ) : (
                    <span className="text-lg">{emoji}</span>
                  )}

                  <span className="text-sm truncate w-[180px]">
                    {statusText}
                  </span>
                </div>
              )}

              {!emoji && !statusText && (
                <div className="flex items-center gap-2 text-gray-500">
                  {hovered ? (
                    <span className="text-lg">😊</span>
                  ) : (
                    <Smile className="w-[22px] h-[22px]" />
                  )}
                  <span className="text-sm truncate">Update your status</span>
                </div>
              )}
            </div>
          </div>

          {/* Set Away */}
          {(emoji || statusText) && (
            <DropdownMenuItem
              onClick={handleClear}
              className="px-5 py-1.5 cursor-pointer hover:bg-blue-500 hover:text-white"
            >
              <span>Clear status</span>
            </DropdownMenuItem>
          )}

          <DropdownMenuItem
            className="px-5 py-1.5 cursor-pointer hover:bg-blue-500 hover:text-white"
            onClick={handleAway}
          >
            <span>
              Set yourself as{" "}
              <span className="font-semibold">{toggleStatus}</span>
            </span>
          </DropdownMenuItem>

          {/* Pause Notifications */}
          <Link href={`/${orgSlug}/settings/personal/notifications`}>
            <DropdownMenuItem className="px-5 py-1.5 cursor-pointer hover:bg-blue-500 hover:text-white">
              <div className="flex items-center justify-between w-full">
                <span>Pause notifications</span>
              </div>
            </DropdownMenuItem>
          </Link>

          <DropdownMenuSeparator className="my-2 bg-gray-200" />

          {/* Profile & Preferences */}
          <DropdownMenuItem
            onClick={showProfile}
            className="px-5 py-1.5 cursor-pointer hover:bg-blue-500 hover:text-white"
          >
            <span className="w-full">Profile...</span>
          </DropdownMenuItem>

          <Link href={`/${orgSlug}/settings/personal/appearance`}>
            <DropdownMenuItem className="px-5 py-1.5 cursor-pointer hover:bg-blue-500 hover:text-white">
              <span className="w-full">Preferences...</span>
            </DropdownMenuItem>
          </Link>

          <DropdownMenuSeparator className="my-1 bg-gray-200" />

          {/* Sign Out */}
          <Link href={`/${orgSlug}/settings/organisation/billing/all-plans`}>
            <DropdownMenuItem className="px-5 py-2 cursor-pointer hover:bg-blue-500 hover:text-white">
              <div className="flex items-center gap-2">
                <Rocket size={18} />
                <span>Buy AI Credits</span>
              </div>
            </DropdownMenuItem>
          </Link>

          <DropdownMenuItem
            onClick={handleLogout}
            className="px-5 py-2 cursor-pointer hover:bg-blue-500 hover:text-white"
          >
            <span>Sign out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <StatusModal />
    </div>
  );
};

export default ProfileDropdown;
