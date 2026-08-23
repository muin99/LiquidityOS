"use client";

import { useParams } from "next/navigation";
import AgentDashboard from "@/components/agent-dashboard";
import CoordinatorDashboard from "@/components/coordinator-dashboard";
import AdminDashboard from "@/components/admin-dashboard";

// These are the only role names we know how to show a dashboard for.
const VALID_ROLES = ["agent", "coordinator", "admin"];

export default function DashboardPage() {
  // useParams reads whatever is in the [role] part of the URL.
  // e.g. visiting "/dashboard/agent" makes role equal to "agent".
  const params = useParams<{ role: string }>();
  const role = params.role;

  if (!VALID_ROLES.includes(role)) {
    return (
      <main className="flex-1 flex items-center justify-center bg-base-200">
        <p className="text-lg">Unknown dashboard: {role}</p>
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
      </div>
    </main>
  );
}
