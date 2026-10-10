import { Sparkles } from "lucide-react";
import { DynamicFooter } from "../../_components/footer/dynamic-footer";
import { FlamingoTable } from "./_components/flamingo-table";
import { getFlamingoContributors } from "./_lib/contributors";

export default async function FlamingoBoardPage() {
  const contributors = await getFlamingoContributors();

  return (
    <div className="min-h-screen w-full bg-[#FAFAFC] pb-24 pt-12">
      <div className="mx-auto max-w-7xl space-y-10 px-4 sm:px-6 lg:px-8">
        <div className="space-y-3 pt-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#7141F8]/20 bg-[#7141F8]/10 px-4 py-1 text-xs font-semibold text-[#7141F8]">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Flamingo Contributor Registry</span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-5xl">
            Flamingo Contributors Board
          </h1>
          <p className="mx-auto max-w-2xl text-sm text-neutral-600 sm:text-base">
            Everyone contributing to the Zedu Flamingo project.
          </p>
        </div>

        <FlamingoTable contributors={contributors} />
      </div>

      <div className="mt-16">
        <DynamicFooter
          text="Empowering Collaborative Learning"
          description="Connect and build together on the Zedu platform."
        />
      </div>
    </div>
  );
}
