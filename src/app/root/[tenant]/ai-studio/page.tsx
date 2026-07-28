import AiStudioModulePage from "@/lib/modules/pages/ai-studio";
import { PrototypeBanner } from "@/components/ui/prototype-banner";

export default function Page() {
  return (
    <>
      <div className="px-6 pt-4">
        <PrototypeBanner feature="AI Studio" phase={13} />
      </div>
      <AiStudioModulePage />
    </>
  );
}
