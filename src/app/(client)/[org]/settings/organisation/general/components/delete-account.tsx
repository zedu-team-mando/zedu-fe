"use client";
import React, { useContext, useState } from "react";
import { X, Eye, EyeOff, CircleCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { DataContext } from "~/store/GlobalState";
import { DeleteRequest, GetRequest, PutRequest } from "~/utils/new-request";
import Loading from "~/components/ui/loading";
import { showSuccess } from "~/components/toast/sonner";
import { redirectAfterOrgSwitch } from "~/utils/org-switch";

const DeleteAccount = () => {
  const [isContinue, setIsContinue] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [open, setOpen] = useState(false);
  const { state } = useContext(DataContext);
  const [buttonLoading, setButtonLoading] = useState(false);
  const { orgSlug } = state;

  const isValid = password.length > 0 && agreed;

  const handleDelete = async () => {
    const orgId = localStorage.getItem("orgId") || "";
    setButtonLoading(true);
    const res = await DeleteRequest(`/organisations/${orgId}`);

    if (res?.status === 200 || res?.status === 201 || res?.status === 204) {
      showSuccess(res?.data.message ?? "Organisation deleted successfully");

      // get all organisations and set the first one to active
      const orgRes = await GetRequest("/users/organisations");
      const orgId = orgRes?.data?.data[0].id;

      if (orgId) {
        // after getting organisations switch ot it
        const payload = {
          current_org: orgId,
        };

        const res = await PutRequest("/users/switch-org", payload);

        if (res?.status === 200 || res?.status === 201) {
          localStorage.setItem("token", res?.data?.data?.access_token);
          localStorage.setItem("orgId", res?.data?.data?.organisation?.id);
          const slug = res.data.data.current_organisation_slug;
          localStorage.setItem("orgSlug", slug);

          redirectAfterOrgSwitch(slug);
        }
      } else {
        window.location.href = "/";
      }
    } else {
      setButtonLoading(false);
    }
  };

  const handleClick = () => {
    setOpen(false);
    setIsContinue(false);
  };

  //

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="inline-block py-2 px-4 mt-6 border rounded-[4px] border-[#F81404] text-[#F81404] text-sm font-semibold hover:bg-[#F81404] hover:text-white transition-colors duration-200">
          Delete this organisation
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-xl p-0 overflow-hidden max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between border-b p-4 text-[#1D2939] text-xl font-black">
            <h2 className="text-xl font-semibold ">Delete Organisation</h2>

            <X
              className="text-gray-500 hover:text-gray-700 text-xl font-bold cursor-pointers border"
              onClick={handleClick}
            />
          </DialogTitle>
        </DialogHeader>

        {!isContinue ? (
          <div className="p-6 pt-3 space-y-3">
            <h3 className="text-sm font-medium">
              Are you sure you want to delete this organisation{" "}
              <span className="text-[#667085]">{state?.orgData?.name}</span>?
              This action will:
            </h3>
            <div className="border-b pb-4 mb-4 space-y-2 text-sm">
              <p>
                <CircleCheck className="inline mr-2 text-green-500" size={18} />
                delete the organisation, all associated data and members.
              </p>
              <p>
                <CircleCheck className="inline mr-2 text-green-500" size={18} />
                remove the rest of your organisational perks
              </p>
            </div>

            <p className="text-xs text-gray-500">
              <strong>Note:</strong> This action cannot be undone. Consider
              waiting till the end of your billing cycle for the month
            </p>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-4 py-2 rounded-md border border-gray-300 text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => setIsContinue(true)}
                className={`px-4 py-2 rounded-md text-white bg-primary-500 hover:bg-blue-300`}
              >
                Continue
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-5 p-6 pt-3">
            <div className="mb-4">
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="password"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="w-full border rounded px-3 py-2 pr-10 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-start mb-6">
              <input
                id="consent"
                type="checkbox"
                checked={agreed}
                onChange={() => setAgreed((prev) => !prev)}
                className="mt-1 mr-2"
              />
              <label htmlFor="consent" className="text-sm text-gray-700">
                I agree to add my name and image to the deletion confirmation
                mail sent to the entire organisation.
              </label>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={handleClick}
                className="px-4 py-2 rounded-md border border-gray-300 text-gray-700"
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                disabled={!isValid}
                className={`flex items-center justify-center px-4 py-2 rounded text-white font-medium ${
                  isValid
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-red-300 cursor-not-allowed"
                }`}
              >
                Delete Account {buttonLoading && <Loading />}
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DeleteAccount;
