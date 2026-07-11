import { PlatformLoginForm } from "./platform-login-form";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function PlatformLoginPage() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-zinc-950 px-4 py-12">
      <Card variant="outlined" padding="lg" className="w-full space-y-8 shadow-2xl sm:p-10" style={{ maxWidth: "620px" }}>
        <div className="flex flex-col items-center text-center">
          <Badge variant="outline" className="mb-2">EPADM Ops</Badge>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white">
            Platform Control Plane
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Super Admin access requires MFA when enabled on your operator account.
          </p>
        </div>
        <PlatformLoginForm />
      </Card>
    </div>
  );
}