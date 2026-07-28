import AttendanceModulePage from "@/lib/modules/pages/attendance";
import { PrototypeBanner } from "@/components/ui/prototype-banner";

export default function Page() {
  return (
    <>
      <div className="px-6 pt-4">
        <PrototypeBanner feature="Attendance workspace" phase={6} />
      </div>
      <AttendanceModulePage />
    </>
  );
}
