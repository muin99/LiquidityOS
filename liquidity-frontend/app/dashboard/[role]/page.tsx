"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
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

  // Only show the dashboard once we've checked whos logged in.
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function checkLogin() {
      const token = localStorage.getItem("access_token");

      // No token saved at all -> go log in first.
      if (!token) {
        router.push("/login");
        return;
      }

      // Don't just trust whatever's sitting in localStorage — actually
      // ask the backend "is this token still good, and who does it
      // belong to". GET /auth/me checks the token is real/not expired
      // and sends back the fresh user info for whoever it belongs to.
      try {
        const response = await axios.get("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const user = response.data;

        // Keep localStorage's copy of "user" up to date too, so the
        // navbar etc. show the same fresh info.
        localStorage.setItem("user", JSON.stringify(user));

        // Logged in, but trying to look at someone else's dashboard
        // (e.g. an agent typing /dashboard/admin in the address bar).
        if (user.role !== role) {
          router.push(`/dashboard/${user.role}`);
          return;
        }

        setReady(true);
      } catch (error) {
        // The token was rejected (expired, tampered with, whatever) —
        // it's useless now, so throw it away and send them to log in.
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        router.push("/login");
      }
    }

    checkLogin();
  }, [role, router]);

  if (!VALID_ROLES.includes(role)) {
    return (
      <main className="flex-1 flex items-center justify-center bg-base-200">
        <p className="text-lg">Unknown dashboard: {role}</p>
      </main>
    );
  }

  if (!ready) {
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
        {role === "provider" && <ProviderDashboard />}
      </div>
    </main>
  );
}
