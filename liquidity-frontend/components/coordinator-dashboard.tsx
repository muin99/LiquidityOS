"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function CoordinatorDashboard() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [actionError, setActionError] = useState("");

  function loadRequests() {
    return api.get("/ecash-requests/pending").then((response) => {
      setRequests(response.data);
    });
  }

  function loadApplications() {
    return api.get("/coordinator-providers/mine").then((response) => {
      setApplications(response.data);
    });
  }

  useEffect(() => {
    Promise.all([
      loadRequests(),
      loadApplications(),
      api.get("/providers").then((response) => setProviders(response.data)),
    ]).then(() => {
      setLoading(false);
    });
  }, []);

  // Fulfilling a request on the real backend is actually two steps:
  // first you "accept" it (claim it as yours), then you "fulfill" it
  // (actually send the e-cash). We just do both, one after the
  // other, when the coordinator clicks the one "Fulfill" button.
  async function handleFulfill(id: string) {
    setActionError("");

    try {
      await api.patch(`/ecash-requests/${id}/accept`);
      await api.patch(`/ecash-requests/${id}/fulfill`);
      await loadRequests();
    } catch (err: any) {
      const backendMessage = err.response && err.response.data && err.response.data.message;
      setActionError(backendMessage || "Something went wrong, please try again");
    }
  }

  // --- apply to become a coordinator for a provider ---
  const [selectedProvider, setSelectedProvider] = useState("");
  const [applyError, setApplyError] = useState("");
  const [applying, setApplying] = useState(false);

  async function handleApply(e: any) {
    e.preventDefault();

    if (!selectedProvider) {
      setApplyError("Please pick a provider");
      return;
    }

    setApplyError("");
    setApplying(true);

    try {
      await api.post("/coordinator-providers/apply", {
        providerId: selectedProvider,
      });
      await loadApplications();
      setSelectedProvider("");
    } catch (err: any) {
      const backendMessage = err.response && err.response.data && err.response.data.message;
      setApplyError(backendMessage || "Something went wrong, please try again");
    }

    setApplying(false);
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
        <p className="text-sm text-base-content/60 -mt-2 mb-3">
          Only shows requests for providers you're an approved coordinator
          for.
        </p>
        {requests.length === 0 ? (
          <p className="text-base-content/60">Nothing waiting right now.</p>
        ) : (
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
                    <td>{req.agent.fullName}</td>
                    <td>{req.provider.name}</td>
                    <td>৳{req.amount}</td>
                    <td>
                      <span className="badge badge-outline capitalize">
                        {req.status}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleFulfill(req.id)}
                        className="btn btn-primary btn-sm"
                      >
                        Fulfill
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {actionError && <p className="text-error text-sm mt-1">{actionError}</p>}
      </div>

      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <h2 className="card-title text-lg">Apply to a provider</h2>
          <p className="text-sm text-base-content/60">
            Ask to become the coordinator for a provider. An admin (or that
            provider) has to approve it before you can fulfill requests
            for them.
          </p>

          <form
            onSubmit={handleApply}
            className="flex flex-col sm:flex-row gap-3 mt-2 items-start"
          >
            <fieldset className="fieldset w-full sm:w-40">
              <label className="label">Provider</label>
              <select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                className="select w-full"
              >
                <option value="">Pick a provider</option>
                {providers.map((provider) => (
                  <option key={provider.id} value={provider.id}>
                    {provider.name}
                  </option>
                ))}
              </select>
            </fieldset>

            <button type="submit" disabled={applying} className="btn btn-primary sm:mt-6">
              Apply
            </button>
          </form>

          {applyError && (
            <p className="text-error text-sm mt-1">{applyError}</p>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">My provider applications</h2>
        {applications.length === 0 ? (
          <p className="text-base-content/60">You haven't applied to any providers yet.</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {applications.map((app) => (
              <div key={app.id} className="badge badge-lg gap-2">
                {app.provider.name}
                <span className="opacity-60 capitalize">({app.status})</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
