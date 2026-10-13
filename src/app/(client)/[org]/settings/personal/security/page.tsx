"use client";

import {
  ArrowLeft,
  ArrowRight,
  Laptop,
  Smartphone,
  HelpCircle,
  ShieldCheck,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import SettingsLabel from "../../components/settings-label";
import ChangePassword from "./components/change-password";
import { Button } from "~/components/ui/button";
import { GetRequest } from "~/utils/new-request";
import moment from "moment";
import UpdatePassword from "./components/update-password";

function getPaginationRange(currentPage: number, totalPages: number) {
  const range = [];
  const delta = 2;

  const start = Math.max(2, currentPage - delta);
  const end = Math.min(totalPages - 1, currentPage + delta);

  range.push(1);
  if (start > 2) range.push("...");

  for (let i = start; i <= end; i++) {
    range.push(i);
  }

  if (end < totalPages - 1) range.push("...");
  if (totalPages > 1) range.push(totalPages);

  return range;
}

const SkeletonCard = () => (
  <div className="relative overflow-hidden rounded-xl border border-gray-100 bg-white p-4 sm:p-5 shadow-sm ring-1 ring-gray-900/5 animate-pulse">
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-4 sm:gap-5 w-full">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-100 flex-shrink-0"></div>
        <div className="space-y-3 w-full max-w-[200px]">
          <div className="h-4 bg-gray-100 rounded-md w-3/4"></div>
          <div className="h-3 bg-gray-50 rounded-md w-1/2"></div>
        </div>
      </div>
    </div>
    <div className="mt-4 sm:mt-5 pt-4 sm:pt-5 border-t border-gray-50 flex justify-between">
      <div className="h-3 bg-gray-100 rounded-md w-24"></div>
      <div className="h-3 bg-gray-50 rounded-md w-32"></div>
    </div>
  </div>
);

const SecurityPage = () => {
  const itemsPerPage = 7;
  const [currentPage, setCurrentPage] = useState(1);
  const [changePasswordDialog, setChangePasswordDialog] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const getData = async () => {
      setLoading(true);
      try {
        const res = await GetRequest(
          `/users/${user?.id}/login-audit?page=${currentPage}&limit=${itemsPerPage}`
        );
        if (res?.status === 200 || res?.status === 201) {
          setLogs(res?.data?.data || []);
          const total = res?.data?.meta?.total || res?.data?.total || 0;
          setTotalPages(Math.ceil(total / itemsPerPage) || 1);
        } else {
          setLogs([]);
        }
      } catch {
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, [currentPage]);

  const getDeviceIcon = (device?: string) => {
    if (!device) return <HelpCircle className="w-5 h-5 text-gray-400" />;
    const d = device.toLowerCase();
    if (
      d.includes("mac") ||
      d.includes("windows") ||
      d.includes("linux") ||
      d.includes("chrome") ||
      d.includes("safari") ||
      d.includes("firefox") ||
      d.includes("edge") ||
      d.includes("browser") ||
      d.includes("desktop") ||
      d.includes("laptop")
    ) {
      return <Laptop className="w-5 h-5 text-blue-600" />;
    }
    if (
      d.includes("iphone") ||
      d.includes("android") ||
      d.includes("ios") ||
      d.includes("mobile") ||
      d.includes("phone")
    ) {
      return <Smartphone className="w-5 h-5 text-indigo-600" />;
    }
    return <HelpCircle className="w-5 h-5 text-gray-400" />;
  };

  return (
    <div>
      <SettingsLabel />
      <div className="p-4 lg:px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-base font-semibold">Your Account Security</h1>
          <p className="text-sm text-[#344054]">
            Keeping your data secure by staying in-the-know
          </p>
        </div>
        <UpdatePassword />
      </div>

      <div className="mx-2 md:m-4 lg:mx-8">
        {loading ? (
          <div className="space-y-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : logs?.length === 0 ? (
          <div className="group relative flex flex-col items-center justify-center py-16 md:py-20 rounded-2xl border border-dashed border-gray-300 bg-white">
            <div className="rounded-full bg-gray-50 p-4 ring-1 ring-gray-900/5 mb-4 shadow-sm">
              <ShieldCheck className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">
              No active sessions
            </h3>
            <p className="text-gray-500 text-sm max-w-sm text-center">
              You don&apos;t have any active sessions recorded. New logins will
              appear here.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {logs.map((detail: any, index: number) => (
              <div
                key={detail.id || index}
                className="group relative overflow-hidden rounded-xl border border-gray-100 bg-white p-4 sm:p-5 shadow-sm ring-1 ring-gray-900/5 transition-all duration-300 hover:shadow-md"
              >
                <div className="flex flex-row items-start sm:items-center justify-between gap-3 sm:gap-6">
                  <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                    <div className="flex h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 items-center justify-center rounded-full bg-gray-50 ring-1 ring-gray-900/5">
                      {getDeviceIcon(detail.device)}
                    </div>
                    <div className="space-y-0.5 sm:space-y-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm truncate">
                        {detail.device && detail.device !== "Unknown"
                          ? detail.device
                          : "Unknown Device"}
                      </h3>
                      <p className="text-xs font-medium text-gray-500 flex items-center gap-1.5 flex-wrap">
                        <span className="truncate">
                          {detail.location || "Unknown Location"}
                        </span>
                        {detail.ip_address && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-gray-300 hidden sm:block"></span>
                            <span className="font-mono text-[11px] tracking-tight text-gray-400 truncate">
                              {detail.ip_address}
                            </span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`flex-shrink-0 px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold flex items-center whitespace-nowrap shadow-sm border ${
                      detail.is_live
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200/60"
                        : "bg-gray-50 text-gray-600 border-gray-200/60"
                    }`}
                  >
                    {detail.is_live && (
                      <span className="mr-1.5 flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                    )}
                    {detail.is_live ? "Active Now" : "Expired"}
                  </div>
                </div>

                <div className="mt-4 sm:mt-5 pt-3 sm:pt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                      Date
                    </span>
                    <span className="text-xs font-semibold text-gray-600">
                      {moment(detail.created_at).format("MMM Do YYYY, h:mm a")}
                    </span>
                  </div>
                  <div className="flex flex-col items-end text-right">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                      Last Active
                    </span>
                    <span className="text-xs font-semibold text-gray-600">
                      {moment(detail.login_at).format("MMM Do YYYY, h:mm a")}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-3 md:p-5 border-t border-[#E6EAEF] mt-6">
            <Button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              variant="outline"
              className="w-full md:w-auto"
            >
              <ArrowLeft className="text-[#667085] w-4 h-4" /> Previous
            </Button>

            <div className="flex gap-1 overflow-x-auto">
              {getPaginationRange(currentPage, totalPages).map((page, idx) => (
                <button
                  key={idx}
                  className={`px-2 md:px-3 py-1 rounded text-sm ${
                    page === currentPage
                      ? "bg-[#E6EAEF] font-medium"
                      : "hover:bg-gray-100"
                  } ${page === "..." ? "cursor-default" : "cursor-pointer"}`}
                  onClick={() =>
                    typeof page === "number" && setCurrentPage(page)
                  }
                  disabled={page === "..."}
                >
                  {page}
                </button>
              ))}
            </div>

            <Button
              onClick={() =>
                setCurrentPage((prev) => (prev < totalPages ? prev + 1 : prev))
              }
              disabled={currentPage === totalPages}
              variant="outline"
              className="flex items-center gap-1 w-full md:w-auto"
            >
              Next <ArrowRight className="text-[#667085] w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Password Change Dialog */}
      {changePasswordDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/20">
          <div className="w-full max-w-md">
            <ChangePassword setChangePasswordDialog={setChangePasswordDialog} />
          </div>
        </div>
      )}
    </div>
  );
};

export default SecurityPage;
