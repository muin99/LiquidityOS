"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import InboxArrowDownIcon from "@heroicons/react/24/outline/InboxArrowDownIcon";
import BuildingOfficeIcon from "@heroicons/react/24/outline/BuildingOfficeIcon";
import TitleCard from "@/components/title-card";

export default function CoordinatorDashboard() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [actionError, setActionError] = useState("");

  // Every request that needs to prove who we are just sends this
  // header by hand, no auto-attaching magic behind the scenes.
  const token = localStorage.getItem("access_token");
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  async function loadRequests() {
    const response = await axios.get("/api/ecash-requests/pending", authHeader);
    setRequests(response.data);
  }

  async function loadApplications() {
    const response = await axios.get("/api/coordinator-providers/mine", authHeader);
    setApplications(response.data);
  }

  useEffect(() => {
    async function loadEverything() {
      await loadRequests();
      await loadApplications();

      const providersResponse = await axios.get("/api/providers");
      setProviders(providersResponse.data);

      setLoading(false);
    }

    loadEverything();
  }, []);

  // Fulfilling a request on the real backend is actually two steps:
  // first you "accept" it (claim it as yours), then you "fulfill" it
  // (actually send the e-cash). We just do both, one after the
  // other, when the coordinator clicks the one "Fulfill" button.
  async function handleFulfill(id: string) {
    try {
      await axios.patch(`/api/ecash-requests/${id}/accept`, {}, authHeader);
      await axios.patch(`/api/ecash-requests/${id}/fulfill`, {}, authHeader);
      await loadRequests();
      setActionError("");
    } catch (err) {
      setActionError("Something went wrong, please try again");
    }
  }

  // --- apply to become a coordinator for a provider ---
  const [selectedProvider, setSelectedProvider] = useState("");
  const [applyError, setApplyError] = useState("");

  async function handleApply(e: any) {
    e.preventDefault();

    if (!selectedProvider) {
      setApplyError("Please pick a provider");
      return;
    }

    try {
      await axios.post(
        "/api/coordinator-providers/apply",
        { providerId: selectedProvider },
        authHeader,
      );
      await loadApplications();
      setApplyError("");
      setSelectedProvider("");
    } catch (err) {
      setApplyError("Something went wrong, please try again");
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  // Just picks a daisyUI badge color to match the status word, so
  // its easier to scan a long list at a glance.
  function statusBadgeClass(status: string) {
    if (status === "pending") return "badge-warning";
    if (status === "accepted") return "badge-info";
    if (status === "fulfilled" || status === "approved") return "badge-success";
    if (status === "rejected") return "badge-error";
    return "badge-outline";
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="stats shadow w-full">
        <div className="stat">
          <div className="stat-figure text-primary">
            <InboxArrowDownIcon className="h-8 w-8" />
          </div>
          <div className="stat-title">Pending requests</div>
          <div className="stat-value">{requests.length}</div>
        </div>
        <div className="stat">
          <div className="stat-figure text-primary">
            <BuildingOfficeIcon className="h-8 w-8" />
          </div>
          <div className="stat-title">My applications</div>
          <div className="stat-value">{applications.length}</div>
        </div>
      </div>

      <TitleCard title="Liquidity requests from agents">
        <p className="text-sm text-base-content/60 -mt-2 mb-3">
          Only shows requests for providers you're an approved coordinator
          for.
        </p>
        {requests.length === 0 ? (
          <p className="text-base-content/60">Nothing waiting right now.</p>
        ) : (
          <div className="overflow-x-auto rounded-box border border-base-300 bg-base-100">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>Agent</th>
                  <th>Provider</th>
                  <th>Amount</th>
                  <th>Need</th>
                  <th>Status</th>
                  <th>Requested</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.id}>
                    <td>{req.agent.fullName}</td>
                    <td>{req.provider.name}</td>
                    <td>৳{req.amount}</td>
                    <td>{req.type === "physical_cash" ? "Physical cash" : "E-cash"}</td>
                    <td>
                      <span className={`badge ${statusBadgeClass(req.status)} capitalize`}>
                        {req.status}
                      </span>
                    </td>
                    <td>{new Date(req.requestedAt).toLocaleString()}</td>
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
      </TitleCard>

      <TitleCard title="Apply to a provider">
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

          <button type="submit" className="btn btn-primary sm:mt-6">
            Apply
          </button>
        </form>

        {applyError && (
          <p className="text-error text-sm mt-1">{applyError}</p>
        )}
      </TitleCard>

      <TitleCard title="My provider applications">
        {applications.length === 0 ? (
          <p className="text-base-content/60">You haven't applied to any providers yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-box border border-base-300 bg-base-100">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>Provider</th>
                  <th>Status</th>
                  <th>Applied on</th>
                  <th>Decided on</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id}>
                    <td>{app.provider.name}</td>
                    <td>
                      <span className={`badge ${statusBadgeClass(app.status)} capitalize`}>
                        {app.status}
                      </span>
                    </td>
                    <td>{new Date(app.appliedAt).toLocaleString()}</td>
                    <td>{app.decidedAt ? new Date(app.decidedAt).toLocaleString() : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </TitleCard>
    </div>
  );
}
