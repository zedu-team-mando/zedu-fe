"use client";
import React, { useState, useRef, useContext, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Upload } from "lucide-react";
import Image from "next/image";
import { DataContext } from "~/store/GlobalState";
import images from "~/assets/images";
import Loading from "~/components/ui/loading";
import axios from "axios";
import { ACTIONS } from "~/store/Actions";
import { timezones } from "./timezones";
import { showError, showSuccess } from "~/components/toast/sonner";
import { compressImage } from "~/utils/compress-image";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const EditProfileDialog = ({ isOpen, onClose }: any) => {
  const { state, dispatch } = useContext(DataContext);
  const { user } = state;
  const [fullName, setFullName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [title, setTitle] = useState("");
  const [avatar, setAvatar] = useState<any>("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [namePronunciation, setNamePronunciation] = useState("");
  const [timezone, setTimezone] = useState(user?.timezone);
  const [avatarKey, setAvatarKey] = useState(Date.now());
  const [buttonLoading, setButtonLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // set default values
  useEffect(() => {
    setFullName(user?.full_name || "");
    setDisplayName(user?.display_name || "");
    setUsername(user?.username || "");
    setEmail(user?.email || "");
    setPhone(user?.phone || "");
    setAvatar(user?.avatar_url || user?.default_avatar_url || images?.user);

    setTitle(user?.title || "");
    setNamePronunciation(user?.name_pronounciation);
  }, [user]);

  const handleSave = async () => {
    const formData = new FormData();
    formData.append("full_name", fullName);
    formData.append("display_name", displayName);
    formData.append("username", username);
    formData.append("email", email);
    formData.append("phone", phone);
    formData.append("title", title);
    formData.append("timezone", timezone);
    formData.append("name_pronounciation", namePronunciation);
    if (avatarFile) {
      const compressedAvatar = await compressImage(avatarFile);
      formData.append("avatar_file", compressedAvatar);
    }

    setButtonLoading(true);

    try {
      const res = await axios.patch(BASE_URL + "/profile", formData, {
        headers: {
          Authorization: `Bearer ${state?.token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (res?.status === 200 || res?.status === 201) {
        dispatch({
          type: ACTIONS.PROFILE_CALLBACK,
          payload: !state?.profileCallback,
        });
        showSuccess(res?.data?.message);
      }

      setTimeout(() => {
        setButtonLoading(false);
        onClose();
      }, 1000);
    } catch (err) {
      setButtonLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file?.type !== "image/jpeg" && file?.type !== "image/png") {
      return showError("Image type is not supported");
    }

    if (file) {
      const url = URL.createObjectURL(file);
      setAvatar(url);
      setAvatarKey(Date.now());
      setAvatarFile(file);
    }
  };

  const handleRemovePhoto = async () => {
    try {
      await axios.delete(BASE_URL + "/profile/image", {
        headers: {
          Authorization: `Bearer ${state?.token}`,
          "Content-Type": "application/json",
        },
      });

      dispatch({
        type: ACTIONS.PROFILE_CALLBACK,
        payload: !state?.profileCallback,
      });

      setAvatar(images?.user);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      setAvatar(images?.user);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden max-h-[90vh]">
        <DialogHeader className={`p-6 pb-0`}>
          <DialogTitle className="text-[#1D2939] text-lg lg:text-xl font-black">
            Edit your profile
          </DialogTitle>
        </DialogHeader>

        <div
          ref={contentRef}
          className={`max-h-[calc(90vh-180px)] border-t border-[#E6EAEF] space-y-5 pb-6 overflow-y-auto`}
        >
          <div className="flex flex-col-reverse md:flex-row">
            <div className="flex-1 py-3 px-6 space-y-5">
              {/* Full Name */}
              <div className="space-y-2">
                <label
                  htmlFor="fullName"
                  className="text-sm text-[#101828] font-bold"
                >
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E6EAEF] rounded-md text-[15px] text-[#344054] focus:outline-none focus:ring-2 focus:ring-[#6868F7]"
                />
              </div>

              {/* Display Name */}
              <div className="space-y-2">
                <label
                  htmlFor="displayName"
                  className="text-sm text-[#101828] font-bold"
                >
                  Display Name
                </label>
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E6EAEF] rounded-md text-[15px] text-[#344054] focus:outline-none focus:ring-2 focus:ring-[#6868F7]"
                />
                <p className="text-xs text-[#667085]">
                  This could be your first name, or a nickname - however
                  you&apos;d like people to refer to you.
                </p>
              </div>

              {/* Username */}
              <div className="space-y-2">
                <label
                  htmlFor="username"
                  className="text-sm text-[#101828] font-bold"
                >
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E6EAEF] rounded-md text-[15px] text-[#344054] focus:outline-none focus:ring-2 focus:ring-[#6868F7]"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm text-[#101828] font-bold"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E6EAEF] rounded-md text-[15px] text-[#344054] focus:outline-none focus:ring-2 focus:ring-[#6868F7]"
                />
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <label
                  htmlFor="phone"
                  className="text-sm text-[#101828] font-bold"
                >
                  Phone Number
                </label>
                <PhoneInput
                  country={"ng"}
                  value={phone.replace(/\D/g, "")}
                  onChange={(value) => setPhone(value ? `+${value}` : "")}
                  placeholder="801 234 5678"
                  enableSearch
                  containerClass="!w-full"
                  inputClass="!w-full !h-[42px] !border !border-[#E6EAEF] !rounded-md !text-[15px] !text-[#344054] focus:!outline-none focus:!ring-2 focus:!ring-[#6868F7]"
                  buttonClass="!border !border-[#E6EAEF] !rounded-l-md"
                  dropdownClass="!z-[9999]"
                  inputProps={{ id: "phone" }}
                />
              </div>

              {/* Title/Role */}
              <div className="space-y-2">
                <label
                  htmlFor="title"
                  className="text-sm text-[#101828] font-bold"
                >
                  Title
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E6EAEF] rounded-md text-[15px] text-[#344054] focus:outline-none focus:ring-2 focus:ring-[#6868F7]"
                />
              </div>
            </div>

            {/* Right side - Profile Picture */}
            <div className="w-[230px] pl-6 pr-3 py-3 space-y-6">
              <div className="space-y-2">
                <h3 className="text-sm text-[#101828] font-bold">
                  Profile Photo
                </h3>
                <div className="flex flex-col items-start gap-4">
                  <div className="relative w-[192px] h-[192px] border rounded-[9px]">
                    <Image
                      key={avatarKey}
                      src={avatar}
                      alt={fullName}
                      width={192}
                      height={192}
                      className="rounded-[9px] object-cover w-full h-full"
                    />
                  </div>
                  <div className="space-y-1 w-full">
                    <Button
                      variant="outline"
                      onClick={triggerFileInput}
                      className="text-[13px] h-8 text-[#344054] border-[#E6EAEF] gap-2 w-full flex items-center justify-center"
                    >
                      <Upload size={14} />
                      <span>Upload photo</span>
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                    <Button
                      onClick={handleRemovePhoto}
                      className="text-[13px] h-8 text-[#6868F7] gap-2 py-0 w-full"
                    >
                      Remove photo
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Name Recording */}
          {/* <div className="space-y-2 px-6">
                        <label
                            htmlFor="nameRecording"
                            className="text-sm text-[#101828] font-bold"
                        >
                            Name Recording
                        </label>
                        <Button
                            variant="outline"
                            className="text-sm h-8 text-[#344054] border-[#E6EAEF] gap-1 w-fit flex"
                        >
                            <Mic size={14} />
                            <span>Record Audio Clip</span>
                        </Button>
                    </div> */}

          {/* Name Pronunciation */}
          <div className="space-y-2 px-6">
            <label
              htmlFor="namePronunciation"
              className="text-sm text-[#101828] font-bold"
            >
              Name Pronunciation
            </label>
            <input
              id="namePronunciation"
              type="text"
              value={namePronunciation}
              onChange={(e) => setNamePronunciation(e.target.value)}
              placeholder="Zoe (pronounced 'zo-ee')"
              className="w-full px-3 py-2 border border-[#E6EAEF] rounded-md text-[15px] text-[#344054] focus:outline-none focus:ring-2 focus:ring-[#6868F7]"
            />
            <p className="text-xs text-[#667085]">
              This could be a phonetic pronunciation, or an example of something
              your name sounds like.
            </p>
          </div>

          {/* Timezone */}
          <div className="space-y-2 px-6">
            <label
              htmlFor="timezone"
              className="text-sm text-[#101828] font-bold"
            >
              Timezone
            </label>
            <select
              id="timezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full form-select px-3 py-2 border border-[#E6EAEF] rounded-md text-[15px] text-[#344054] focus:outline-none focus:ring-2 focus:ring-[#6868F7]"
            >
              {timezones.map((tz, index) => (
                <option key={index} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-5 border-t border-[#E6EAEF] sticky bottom-0 bg-white">
          <Button
            variant="outline"
            onClick={onClose}
            className="text-sm text-[#344054] h-9 border-[#E6EAEF]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="d-flex items-center gap-2 bg-[#6868F7] text-white h-9 text-sm hover:bg-[#5151d3]"
            disabled={buttonLoading}
          >
            Save Changes {buttonLoading && <Loading />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileDialog;
