import { MessageSquare } from "lucide-react";

const People = () => {
  return (
    <div className="h-[80vh] flex flex-col items-center justify-center">
      <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-[#F2F4F7]">
        <MessageSquare className="size-8 text-[#98A2B3]" strokeWidth={1.5} />
      </div>
      <h2 className="font-bold text-2xl text-blue-500">Select a person to start a conversation</h2>
    </div>
  );
};
export default People;
