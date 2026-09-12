"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import UserGroupIcon from "@heroicons/react/24/outline/UserGroupIcon";
import TitleCard from "@/components/title-card";

export default function ProviderDashboard() {
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<any[]>([]);
  const [providerName, setProviderName] = useState("");
  const [actionError, setActionError] = useState("");

  // Every request that needs to prove who we are just sends this
  // header by hand, no auto-attaching magic behind the scenes.
  const token = localStorage.getItem("access_token");
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  async function loadApplications() {
    const response = await axios.get("/api/coordinator-providers/pending", authHeader);
    setApplications(response.data);
  }

  useEffect(() => {
    async function loadEverything() {
      // The logged in user (saved at login time) already knows which
      // provider this account represents.
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      await loadApplications();

      const providersResponse = await axios.get("/api/providers");
      const mine = providersResponse.data.find((p: any) => p.id === user.providerId);
      if (mine) {
        setProviderName(mine.name);
      }

      setLoading(false);
    }

    loadEverything();
  }, []);

  async function handleDecide(id: string, status: "approved" | "rejected") {
    try {
      await axios.patch(`/api/coordinator-providers/${id}/decide`, { status }, authHeader);
      await loadApplications();
      setActionError("");
    } catch (err) {
      setActionError("Something went wrong, please try again");
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="alert">
        <span>
          You are managing <b>{providerName}</b>.
        </span>
      </div>

      <div className="stats shadow w-full">
        <div className="stat">
          <div className="stat-figure text-primary">
            <UserGroupIcon className="h-8 w-8" />
          </div>
          <div className="stat-title">Coordinator join requests</div>
          <div className="stat-value">{applications.length}</div>
        </div>
      </div>

      <TitleCard title="Coordinator join requests">
        {applications.length === 0 ? (
          <p className="text-base-content/60">Nothing waiting for a decision.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {applications.map((app) => (
              <div
                key={app.id}
                className="flex items-center justify-between bg-base-100 border border-base-300 px-4 py-3 rounded-box"
              >
                <div>
                  <p className="font-medium">{app.coordinator.fullName}</p>
                  <p className="text-sm text-base-content/60">
                    wants to become a coordinator for {app.provider.name}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDecide(app.id, "approved")}
                    className="btn btn-success btn-sm"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleDecide(app.id, "rejected")}
                    className="btn btn-ghost btn-sm"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {actionError && <p className="text-error text-sm mt-1">{actionError}</p>}
      </TitleCard>
    </div>
  );
}
