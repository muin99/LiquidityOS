"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { getUser } from "@/lib/auth";

export default function ProviderDashboard() {
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<any[]>([]);
  const [providerName, setProviderName] = useState("");
  const [actionError, setActionError] = useState("");

  function loadApplications() {
    return api.get("/coordinator-providers/pending").then((response) => {
      setApplications(response.data);
    });
  }

  useEffect(() => {
    // The logged in user (saved at login time) already knows which
    // provider this account represents.
    const user = getUser();

    Promise.all([
      loadApplications(),
      api.get("/providers").then((response) => {
        const mine = response.data.find((p: any) => p.id === user.providerId);
        if (mine) {
          setProviderName(mine.name);
        }
      }),
    ]).then(() => {
      setLoading(false);
    });
  }, []);

  async function handleDecide(id: string, status: "approved" | "rejected") {
    setActionError("");

    try {
      await api.patch(`/coordinator-providers/${id}/decide`, { status });
      await loadApplications();
    } catch (err: any) {
      const backendMessage = err.response && err.response.data && err.response.data.message;
      setActionError(backendMessage || "Something went wrong, please try again");
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

      <div>
        <h2 className="text-lg font-semibold mb-3">Coordinator join requests</h2>
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
      </div>
    </div>
  );
}
