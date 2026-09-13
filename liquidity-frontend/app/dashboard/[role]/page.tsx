"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getUser } from "@/lib/auth";
import AgentDashboard from "@/components/agent-dashboard";
import CoordinatorDashboard from "@/components/coordinator-dashboard";
import ProviderDashboard from "@/components/provider-dashboard";
import AdminDashboard from "@/components/admin-dashboard";

// These are the only role names we know how to show a dashboard for.
const VALID_ROLES = ["agent", "coordinator", "provider", "admin"];

export default function DashboardPage() {
  const router = useRouter();

  // useParams reads whatever is in the [role] part of the URL.
  // e.g. visiting "/dashboard/agent" makes role equal to "agent".
  const params = useParams<{ role: string }>();
  const role = params.role;

  // We start "checking" until we've had a chance to look at
  // localStorage in the browser. Only after that do we know if this
  // person is actually allowed to see this page.
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const user = getUser();

    // Not logged in at all -> go log in first.
    if (!user) {
      router.replace("/login");
      return;
    }

    // Logged in, but trying to look at someone else's dashboard
    // (e.g. an agent typing /dashboard/admin in the address bar).
    if (user.role !== role) {
      router.replace(`/dashboard/${user.role}`);
      return;
    }

    setAllowed(true);
    setChecking(false);
  }, [role, router]);

  if (!VALID_ROLES.includes(role)) {
    return (
      <main className="flex-1 flex items-center justify-center bg-base-200">
        <p className="text-lg">Unknown dashboard: {role}</p>
      </main>
    );
  }

  if (checking || !allowed) {
    return (
      <main className="flex-1 flex items-center justify-center bg-base-200">
        <span className="loading loading-spinner loading-lg" />
      </main>
    );
  }

  return (
    <main className="flex-1 bg-base-200 px-6 py-10">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        <h1 className="text-2xl font-bold capitalize">{role} dashboard</h1>

        {role === "agent" && <AgentDashboard />}
        {role === "coordinator" && <CoordinatorDashboard />}
        {role === "admin" && <AdminDashboard />}
        {role === "provider" && (
          <Suspense fallback={null}>
            <ProviderDashboard />
          </Suspense>
        )}
      </div>
    </main>
  );
}
