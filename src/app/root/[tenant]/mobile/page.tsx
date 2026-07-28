import MobileModulePage from "@/lib/modules/pages/mobile";
import { PrototypeBanner } from "@/components/ui/prototype-banner";

export default function Page() {
  return (
    <>
      <div className="px-6 pt-4">
        <PrototypeBanner feature="Portals & Mobile" phase={12} />
      </div>
      <MobileModulePage />
    </>
  );
}
