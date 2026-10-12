import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import type { Contributor } from "~/app/(homepage)/contributors/zedu-osprey/_lib/contributors";

function getInitials(name: string): string {
  const words = name.replace(/[^\p{L}\p{N}\s]/gu, "").split(/\s+/);
  const initials = words
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]);
  return initials.join("").toUpperCase();
}

export const ContributorCard = ({ name, username }: Contributor) => {
  return (
    <article className="flex h-full flex-col items-center gap-4 rounded-xl border border-neutral-200 bg-white p-6 text-center transition-shadow hover:shadow-md">
      <Avatar className="size-20">
        <AvatarFallback className="bg-primary-50 text-xl font-semibold text-primary-500">
          {getInitials(name)}
        </AvatarFallback>
      </Avatar>
      <div className="flex w-full flex-col gap-1">
        <h3 className="truncate text-base font-semibold text-neutral-900 sm:text-lg">
          {name}
        </h3>
        <p className="truncate text-sm text-neutral-600">@{username}</p>
      </div>
    </article>
  );
};
