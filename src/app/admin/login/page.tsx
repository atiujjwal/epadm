import { PlatformLoginForm } from "./platform-login-form";

export default function PlatformLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 py-12">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-8 shadow-2xl sm:p-10">
        <div className="flex flex-col items-center text-center">
          <div className="text-xs font-bold uppercase tracking-[0.25em] text-amber-500">
            EPADM Ops
          </div>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white">
            Platform Control Plane
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Super Admin access requires MFA when enabled on your operator account.
          </p>
        </div>
        <PlatformLoginForm />
      </div>
    </div>
  );
}
