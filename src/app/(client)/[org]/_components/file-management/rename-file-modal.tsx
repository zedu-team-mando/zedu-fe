import { X } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
} from "~/components/ui/dialog";

interface RenameFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  // eslint-disable-next-line no-unused-vars
  onRename: (value: string) => void;
  oldName: string;
}

interface RenameFileFormData {
  rename: string;
}

const RenameFileModal: React.FC<RenameFileModalProps> = ({
  isOpen,
  onClose,
  onRename,
  oldName,
}) => {
  const {
    register,
    formState: { errors },
    handleSubmit,
    watch,
  } = useForm<RenameFileFormData>({
    defaultValues: {
      rename: oldName,
    },
  });

  const handleRename = (data: RenameFileFormData) => {
    const newName = data.rename.trim();
    if (!newName) {
      return;
    }
    if (newName === oldName) {
      onClose();
      return;
    }
    onRename(newName);
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogOverlay>
          <DialogContent className="w-fit px-0">
            <DialogHeader className="flex flex-row justify-between items-center border-b border-[#5F5FE1] px-6 pb-4">
              <DialogTitle className="tracking-wide  ">Rename file</DialogTitle>
              <DialogClose className=" text-[#344054] p-1 border border-[#5F5FE1] rounded-[0.3125rem]">
                <X className="size-5 text-[#344054]" />
              </DialogClose>
            </DialogHeader>
            <form
              onSubmit={handleSubmit(handleRename)}
              className="px-6 mt-2 w-full"
            >
              <input
                {...register("rename", {
                  validate: (value) => value.trim().length > 0,
                })}
                type="text"
                aria-invalid={errors.rename ? "true" : "false"}
                className="w-[324px] border border-[#7141F8] outline-[#7141F8] px-3 py-2  rounded-lg"
              />
              {errors.rename && (
                <span role="alert" className="block text-red-500">
                  Filename cannot be empty
                </span>
              )}
              <div className="place-self-end mt-5 ">
                <button
                  type="button"
                  className="px-4 py-2 text-sm bg-transparent border border-[#D0D5DD] text-[#344054] rounded-lg mr-2"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <input
                  type="submit"
                  disabled={!watch("rename")?.trim()}
                  value="Rename"
                  className="disabled:opacity-50 px-4 py-2 text-sm bg-[#7141F8] text-white rounded-lg"
                />
              </div>
            </form>
          </DialogContent>
        </DialogOverlay>
      </Dialog>
    </>
  );
};

export default RenameFileModal;
