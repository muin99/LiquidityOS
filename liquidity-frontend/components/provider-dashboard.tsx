"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { mockProviders, mockAdminPendingApplications } from "@/lib/mock-data";

export default function ProviderDashboard() {
  const searchParams = useSearchParams();
  // Which provider is "you" in this demo — picked at login,
  // falling back to the first one if it's missing from the URL.
  const provider = searchParams.get("provider") || mockProviders[0];

  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState(mockAdminPendingApplications);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // A provider can only see and decide on requests sent to THEM —
  // never another provider's join requests.
  const myApplications = applications.filter((app) => app.provider === provider);

  function handleDecide(id: string) {
    setApplications((current) => current.filter((app) => app.id !== id));
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
          You are managing <b>{provider}</b>.
        </span>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Coordinator join requests</h2>
        {myApplications.length === 0 ? (
          <p className="text-base-content/60">Nothing waiting for a decision.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {myApplications.map((app) => (
              <div
                key={app.id}
                className="flex items-center justify-between bg-base-100 border border-base-300 px-4 py-3 rounded-box"
              >
                <div>
                  <p className="font-medium">{app.coordinator}</p>
                  <p className="text-sm text-base-content/60">
                    wants to become a coordinator for {app.provider}
                  </p>
                </div>
                <button onClick={() => handleDecide(app.id)} className="btn btn-success btn-sm">
                  Approve
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
