"use client";

import { UserPlus, ChevronDown, MoreVertical } from "lucide-react";

const SkeletonRow = () => (
  <div className="p-4 flex items-center justify-between animate-pulse">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-gray-200 rounded" />
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-32" />
        <div className="h-3 bg-gray-100 rounded w-48" />
      </div>
    </div>
    <div className="h-8 bg-gray-50 rounded w-20" />
  </div>
);

export default function UserGroupsTab({
  groups,
  loading,
}: {
  groups: any[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="border border-gray-200 rounded-lg divide-y divide-gray-100">
        {[...Array(6)].map((_, i) => (
          <SkeletonRow key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden divide-y divide-gray-200">
      {groups?.length > 0 ? (
        groups.map((group, index) => (
          <div
            key={index}
            className="group flex items-center justify-between p-4 hover:bg-[#f8f8f8] cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#f8f8f8] rounded flex items-center justify-center border border-gray-200">
                <UserPlus size={20} className="text-gray-600" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-[15px]">
                  {group.handle || group.name}
                </span>
                <div className="flex items-center gap-2 text-[13px] text-gray-500">
                  <span className="font-medium text-black">
                    {group.members_count || 0}{" "}
                    {(group.members_count || 0) === 1 ? "member" : "members"}
                  </span>
                  <span>•</span>
                  <span className="truncate max-w-[300px]">
                    {group.description || "No description"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="px-3 py-1.5 bg-white border border-gray-300 rounded font-bold text-[13px] hover:shadow-sm">
                View Members
              </button>
              <button className="p-1.5 hover:bg-gray-200 rounded">
                <MoreVertical size={18} className="text-gray-600" />
              </button>
            </div>
          </div>
        ))
      ) : (
        <div className="p-20 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <UserPlus size={30} className="text-gray-400" />
          </div>
          <h3 className="text-[18px] font-bold">No user groups yet</h3>
          <p className="text-gray-500 text-[15px]">
            User groups are a great way to notify whole teams at once.
          </p>
        </div>
      )}
    </div>
  );
}
