import Link from "next/link";
import { CheckIcon } from "../../_components/svgs";
import { contactSalesBenefits } from "./contactSalesData";

export const ContactSalesBenefits = () => {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4 text-left sm:gap-5 lg:pl-4">
      <h1 className="text-3xl font-semibold leading-tight text-[#171717] sm:text-4xl lg:text-5xl">
        Talk with our <span className="text-[#6f4ef6]">sales team</span>
      </h1>

      <p className="text-base text-[#4b4b4b] sm:text-lg">
        Get expert guidance to unlock the full potential of Zedu.
      </p>

      <ul className="ml-0 flex flex-col gap-2 text-sm leading-relaxed text-[#3f3f46] sm:ml-3 sm:gap-3 sm:text-base">
        {contactSalesBenefits.map((benefit) => (
          <li key={benefit} className="flex items-start gap-2">
            <span className="mt-1 shrink-0">
              <CheckIcon />
            </span>
            <span>{benefit}</span>
          </li>
        ))}
      </ul>

      <p className="text-sm text-[#595959] sm:text-base">
        Looking for product or customer support? Visit our{" "}
        <Link href="mailto:support@zedu.chat" className="text-[#6f4ef6]">
          Help Center.
        </Link>
      </p>
    </div>
  );
};
