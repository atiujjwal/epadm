import { PageHeader } from "@/components/layout/page-header";
import { PrototypeBanner } from "@/components/ui/prototype-banner";

export default function LabsPage() {
  return (
    <>
      <PageHeader
        title="Laboratories"
        description="Lab management, bookings, equipment and safety."
      />
      <div className="p-6">
        <PrototypeBanner
          feature="Laboratories"
          phase={9}
          message="Lab catalog, experiment bookings, equipment inventory, and safety incident tracking are under development."
        />
      </div>
    </>
  );
}
