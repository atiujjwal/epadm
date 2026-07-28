import IntelligenceModulePage from "@/lib/modules/pages/intelligence";
import { PrototypeBanner } from "@/components/ui/prototype-banner";

export default function Page() {
  return (
    <>
      <div className="px-6 pt-4">
        <PrototypeBanner feature="Analytics & Reports" phase={15} />
      </div>
      <IntelligenceModulePage />
    </>
  );
}
