import { PlatformLoginForm } from "./platform-login-form";

export default function PlatformLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
        <div className="mb-6">
          <div className="text-xs uppercase tracking-[0.2em] text-amber-600">
            EPADM Ops
          </div>
          <h1 className="mt-2 text-2xl font-semibold text-zinc-950">
            Platform control plane
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            Super Admin access requires MFA when enabled on your operator account.
          </p>
        </div>
        <PlatformLoginForm />
      </div>
    </div>
  );
}
