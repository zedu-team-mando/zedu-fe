import React, { useState } from "react";
import {
  Folder as FolderIcon,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  truncateFileName,
  decodeFileName,
  formatDateCreated,
} from "./FileList";

interface FolderListProps {
  id: string;
  name: string;

  user_id: string;
  item_count: number;
  created_at?: string;
  folder_owner_name?: string;

  onEdit: (id: string) => void;

  onDelete: (id: string) => void;

  onClick?: (id: string) => void;
}

const FolderList: React.FC<FolderListProps> = ({
  id,
  name,
  item_count,
  created_at,

  user_id,
  folder_owner_name,
  onEdit,
  onDelete,
  onClick,
}) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const displayName = truncateFileName(name, 42);
  const fullName = decodeFileName(name);

  return (
    <div
      className="flex md:grid md:grid-cols-12 justify-between md:justify-start gap-4 px-3 py-2 md:px-6 md:py-4 hover:bg-blue-50 cursor-pointer transition-colors items-center text-sm border-b border-gray-100 overflow-hidden"
      onClick={() => onClick?.(id)}
    >
      {/* Name Column */}
      <div className="flex-1 md:flex-none md:col-span-6 flex items-center gap-3 min-w-0">
        <FolderIcon
          size={24}
          fill="#7141f8"
          stroke="none"
          className="flex-shrink-0"
        />
        <span
          className="text-[#1F2937] dark:text-zinc-100 font-medium min-w-0 flex-1 truncate block"
          title={fullName}
        >
          {displayName}
        </span>
      </div>

      {/* Owner Column - Hidden on mobile */}
      <div className="hidden md:flex md:col-span-2 items-center text-[#4B5563] min-w-0">
        <span className="truncate" title={folder_owner_name || "Unknown"}>
          {folder_owner_name || "Unknown"}
        </span>
      </div>

      {/* Date Created Column - Hidden on mobile */}
      <div className="hidden md:flex md:col-span-2 items-center text-[#4B5563]">
        {formatDateCreated(created_at)}
      </div>

      {/* Size Column - Hidden on mobile */}
      <div className="hidden md:flex md:col-span-1 items-center text-[#4B5563]">
        {item_count} {item_count === 1 ? "item" : "items"}
      </div>

      {/* Actions Column */}
      <div className="flex-shrink-0 md:col-span-1 flex justify-end">
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsPopoverOpen(!isPopoverOpen);
              }}
              className="p-1 rounded-full hover:bg-gray-200"
            >
              <MoreVertical size={20} className="flex-shrink-0" />
            </button>
          </PopoverTrigger>
          <PopoverContent
            className="w-48 p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col space-y-1">
              <button
                onClick={() => {
                  onEdit(id);
                  setIsPopoverOpen(false);
                }}
                className="flex items-center w-full p-2 text-sm text-left text-gray-700 rounded-md hover:bg-gray-100"
              >
                <Pencil size={16} className="mr-2" />
                <span>Edit Folder Name</span>
              </button>
              <button
                onClick={() => {
                  onDelete(id);
                  setIsPopoverOpen(false);
                }}
                className="flex items-center w-full p-2 text-sm text-left text-red-600 rounded-md hover:bg-red-50"
              >
                <Trash2 size={16} className="mr-2" />
                <span>Delete Folder</span>
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default FolderList;
