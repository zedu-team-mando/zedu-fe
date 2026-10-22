"use client";

import { ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";
import React, { useEffect, useState } from "react";
import SettingsLabel from "../../components/settings-label";
import ChangePassword from "./components/change-password";
import { Button } from "~/components/ui/button";
import { GetRequest } from "~/utils/new-request";
import moment from "moment";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import UpdatePassword from "./components/update-password";
import { isSessionActive } from "./session-status";
import { cn } from "~/lib/utils";

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

const SecurityPage = () => {
  const itemsPerPage = 7;
  const [currentPage, setCurrentPage] = useState(1);
  const [changePasswordDialog, setChangePasswordDialog] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const getData = async () => {
      const res = await GetRequest(
        `/users/${user?.id}/login-audit?page=${currentPage}&limit=${itemsPerPage}`
      );
      if (res?.status === 200 || res?.status === 201) {
        setLogs(res?.data?.data || []);
        const total = res?.data?.meta?.total || res?.data?.total || 0;
        setTotalPages(Math.ceil(total / itemsPerPage));
      }
    };
    getData();
  }, [currentPage]);

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

      <div className="mx-2 md:m-4 lg:mx-8 border rounded-md overflow-x-auto">
        <div className="min-w-[800px]">
          <Table>
            <TableHeader className="bg-[#f6f7f9] text-[#667085]">
              <TableRow>
                <TableHead className="text-xs md:text-sm">Device</TableHead>
                <TableHead className="text-xs md:text-sm">Location</TableHead>
                <TableHead className="text-xs md:text-sm">
                  <div className="flex items-center gap-1">
                    Date
                    <ArrowDown className="text-[#98A2B3] w-3 h-3 md:w-4 md:h-4" />
                  </div>
                </TableHead>
                <TableHead className="text-xs md:text-sm">
                  <div className="flex items-center gap-1">
                    Last Active
                    <ArrowDown className="text-[#98A2B3] w-3 h-3 md:w-4 md:h-4" />
                  </div>
                </TableHead>
                <TableHead className="text-xs md:text-sm">Status</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {logs.map((detail: any, index: number) => {
                const active = isSessionActive(detail);
                return (
                  <TableRow
                    key={index}
                    className="text-xs md:text-sm text-[#344054]"
                  >
                    <TableCell>{detail.device}</TableCell>
                    <TableCell>{detail.location}</TableCell>
                    <TableCell>
                      {moment(detail.created_at).format("lll")}
                    </TableCell>
                    <TableCell>
                      {moment(detail.login_at).format("lll")}
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                          active
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        )}
                      >
                        {active ? "Active" : "Expired"}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {logs?.length === 0 && (
          <p className="text-center mt-10 mb-10 md:mt-20 md:mb-20 text-gray-500">
            No available data
          </p>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-3 md:p-5 border-t border-[#E6EAEF]">
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
        <div className="fixed inset-0 z-20 flex items-center justify-center p-4 backdrop-blur-sm bg-black/10">
          <div className="w-full max-w-md">
            <ChangePassword setChangePasswordDialog={setChangePasswordDialog} />
          </div>
        </div>
      )}
    </div>
  );
};

export default SecurityPage;
