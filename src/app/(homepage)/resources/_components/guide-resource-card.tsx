import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface GuideResourceProps {
  id: number;
  title: string;
  description: string;
  image: string;
  link: string;
}

export const GuideResourceCard = ({
  id,
  title,
  description,
  image,
  link,
}: GuideResourceProps) => {
  return (
    <div
      key={id}
      className="group flex flex-col rounded-lg bg-white overflow-hidden transition-all duration-300 shadow-md text-left"
    >
      <div className="relative w-full h-48 overflow-hidden bg-neutral-100">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-102"
        />
      </div>

      <div className="flex flex-col flex-grow p-4 gap-4">
        <span className="inline-block w-fit text-xs font-medium p-2 rounded-full bg-primary-50/50 text-primary-500">
          Guide
        </span>

        <div className="space-y-3">
          <h3 className="text-base font-semibold text-neutral-900 mb-2 line-clamp-2">
            {title}
          </h3>
          <p className="text-sm text-neutral-600 mb-4 line-clamp-2 flex-grow">
            {description}
          </p>
        </div>

        {link === "#" ? (
          <span className="inline-flex items-center gap-2 text-sm font-medium text-neutral-500 mt-3">
            Coming soon
          </span>
        ) : (
          <Link
            href={link}
            className="inline-flex items-center gap-2 text-sm font-medium text-primary-500 hover:text-primary-600 transition-colors mt-3"
          >
            Read article <ArrowRight size={16} />
          </Link>
        )}
      </div>
    </div>
  );
};
