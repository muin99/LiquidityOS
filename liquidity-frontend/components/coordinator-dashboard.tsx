"use client";

import { useEffect, useState } from "react";
import {
  mockCoordinatorRequests,
  mockCoordinatorApplications,
  mockProviders,
} from "@/lib/mock-data";

export default function CoordinatorDashboard() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState(mockCoordinatorRequests);
  const [applications, setApplications] = useState(mockCoordinatorApplications);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // Pretend to fulfill a request: mark it as "fulfilled" right here in
  // the browser. Nothing is saved anywhere, so refreshing resets it.
  function handleFulfill(id: string) {
    setRequests((current) =>
      current.map((req) =>
        req.id === id ? { ...req, status: "fulfilled" } : req,
      ),
    );
  }

  // --- apply to become a coordinator for a provider ---
  const [selectedProvider, setSelectedProvider] = useState(mockProviders[0]);
  const [applyError, setApplyError] = useState("");

  function handleApply(e: any) {
    e.preventDefault();

    const alreadyApplied = applications.some(
      (app) => app.provider === selectedProvider,
    );

    if (alreadyApplied) {
      setApplyError("You already applied to this provider");
      return;
    }

    const newApplication = {
      id: `app-${Date.now()}`,
      provider: selectedProvider,
      status: "pending",
    };

    // No backend yet — the application just appears in the list below,
    // waiting for an admin to approve it.
    setApplications([...applications, newApplication]);
    setApplyError("");
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
      <div>
        <h2 className="text-lg font-semibold mb-3">
          E-cash requests from agents
        </h2>
        <div className="overflow-x-auto rounded-box border border-base-300 bg-base-100">
          <table className="table">
            <thead>
              <tr>
                <th>Agent</th>
                <th>Provider</th>
                <th>Amount</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.id}>
                  <td>{req.agent}</td>
                  <td>{req.provider}</td>
                  <td>৳{req.amount}</td>
                  <td>
                    <span className="badge badge-outline capitalize">
                      {req.status}
                    </span>
                  </td>
                  <td>
                    {req.status === "pending" && (
                      <button
                        onClick={() => handleFulfill(req.id)}
                        className="btn btn-primary btn-sm"
                      >
                        Fulfill
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <h2 className="card-title text-lg">Apply to a provider</h2>
          <p className="text-sm text-base-content/60">
            Ask to become the coordinator for a provider. An admin has to
            approve it before you can fulfill requests for them.
          </p>

          <form onSubmit={handleApply} className="flex flex-col sm:flex-row gap-3 mt-2 items-start">
            <fieldset className="fieldset w-full sm:w-40">
              <label className="label">Provider</label>
              <select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                className="select w-full"
              >
                {mockProviders.map((provider) => (
                  <option key={provider} value={provider}>
                    {provider}
                  </option>
                ))}
              </select>
            </fieldset>

            <button type="submit" className="btn btn-primary sm:mt-6">
              Apply
            </button>
          </form>

          {applyError && <p className="text-error text-sm mt-1">{applyError}</p>}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">My provider applications</h2>
        <div className="flex flex-wrap gap-3">
          {applications.map((app) => (
            <div key={app.id} className="badge badge-lg gap-2">
              {app.provider}
              <span className="opacity-60 capitalize">({app.status})</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
