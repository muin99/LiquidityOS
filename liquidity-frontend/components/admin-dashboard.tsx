"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [pendingApplications, setPendingApplications] = useState<any[]>([]);
  const [areas, setAreas] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [actionError, setActionError] = useState("");

  // Every request that needs to prove who we are just sends this
  // header by hand, no auto-attaching magic behind the scenes.
  const token = localStorage.getItem("access_token");
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  function loadPendingUsers() {
    return axios.get("/api/users/pending", authHeader).then((response) => {
      setPendingUsers(response.data);
    });
  }

  function loadPendingApplications() {
    return axios.get("/api/coordinator-providers/pending", authHeader).then((response) => {
      setPendingApplications(response.data);
    });
  }

  function loadAreas() {
    return axios.get("/api/areas").then((response) => {
      setAreas(response.data);
    });
  }

  function loadProviders() {
    return axios.get("/api/providers").then((response) => {
      setProviders(response.data);
    });
  }

  useEffect(() => {
    Promise.all([
      loadPendingUsers(),
      loadPendingApplications(),
      loadAreas(),
      loadProviders(),
    ]).then(() => {
      setLoading(false);
    });
  }, []);

  async function approveUser(id: string) {
    try {
      await axios.patch(`/api/users/${id}/approve`, {}, authHeader);
      await loadPendingUsers();
      setActionError("");
    } catch (err: any) {
      setActionError(err.response?.data?.message || "Something went wrong, please try again");
    }
  }

  async function decideApplication(id: string, status: "approved" | "rejected") {
    try {
      await axios.patch(`/api/coordinator-providers/${id}/decide`, { status }, authHeader);
      await loadPendingApplications();
      setActionError("");
    } catch (err: any) {
      setActionError(err.response?.data?.message || "Something went wrong, please try again");
    }
  }

  // --- add a new area ---
  const [areaName, setAreaName] = useState("");
  const [areaRegion, setAreaRegion] = useState("");
  const [areaError, setAreaError] = useState("");

  async function handleAddArea(e: any) {
    e.preventDefault();

    if (!areaName || !areaRegion) {
      setAreaError("Please fill in both fields");
      return;
    }

    try {
      await axios.post("/api/areas", { name: areaName, region: areaRegion }, authHeader);
      await loadAreas();
      setAreaError("");
      setAreaName("");
      setAreaRegion("");
    } catch (err: any) {
      setAreaError(err.response?.data?.message || "Something went wrong, please try again");
    }
  }

  // --- add a new provider ---
  const [providerName, setProviderName] = useState("");
  const [providerError, setProviderError] = useState("");

  async function handleAddProvider(e: any) {
    e.preventDefault();

    if (!providerName) {
      setProviderError("Please enter a name");
      return;
    }

    try {
      await axios.post("/api/providers", { name: providerName }, authHeader);
      await loadProviders();
      setProviderError("");
      setProviderName("");
    } catch (err: any) {
      setProviderError(err.response?.data?.message || "Something went wrong, please try again");
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
      <div>
        <h2 className="text-lg font-semibold mb-3">Pending registrations</h2>
        <p className="text-sm text-base-content/60 -mt-2 mb-3">
          Agents, coordinators, and providers all start here — coordinator
          join requests to a specific provider are decided by that
          provider, not by admin.
        </p>
        {pendingUsers.length === 0 ? (
          <p className="text-base-content/60">Nothing waiting for approval.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {pendingUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between bg-base-100 border border-base-300 px-4 py-3 rounded-box"
              >
                <div>
                  <p className="font-medium">{user.fullName}</p>
                  <p className="text-sm text-base-content/60 capitalize">
                    {user.role}
                    {user.area && <> — {user.area.name}</>}
                    {user.provider && <> — {user.provider.name}</>}
                  </p>
                </div>
                <button onClick={() => approveUser(user.id)} className="btn btn-success btn-sm">
                  Approve
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Pending coordinator join requests</h2>
        {pendingApplications.length === 0 ? (
          <p className="text-base-content/60">Nothing waiting for a decision.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {pendingApplications.map((app) => (
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
                    onClick={() => decideApplication(app.id, "approved")}
                    className="btn btn-success btn-sm"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => decideApplication(app.id, "rejected")}
                    className="btn btn-ghost btn-sm"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {actionError && <p className="text-error text-sm">{actionError}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title text-lg">Add an area</h2>
            <p className="text-sm text-base-content/60">
              Agents and coordinators need an area to pick when they sign up.
            </p>

            <form onSubmit={handleAddArea} className="flex flex-col gap-3 mt-2">
              <fieldset className="fieldset">
                <label className="label">Name</label>
                <input
                  type="text"
                  value={areaName}
                  onChange={(e) => setAreaName(e.target.value)}
                  placeholder="Dhaka North"
                  className="input w-full"
                />
              </fieldset>

              <fieldset className="fieldset">
                <label className="label">Region</label>
                <input
                  type="text"
                  value={areaRegion}
                  onChange={(e) => setAreaRegion(e.target.value)}
                  placeholder="Dhaka"
                  className="input w-full"
                />
              </fieldset>

              <button type="submit" className="btn btn-primary">
                Add area
              </button>
              {areaError && <p className="text-error text-sm">{areaError}</p>}
            </form>

            {areas.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {areas.map((area) => (
                  <span key={area.id} className="badge badge-outline">
                    {area.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title text-lg">Add a provider</h2>
            <p className="text-sm text-base-content/60">
              A "provider" role account needs to pick one of these when they
              sign up.
            </p>

            <form onSubmit={handleAddProvider} className="flex flex-col gap-3 mt-2">
              <fieldset className="fieldset">
                <label className="label">Name</label>
                <input
                  type="text"
                  value={providerName}
                  onChange={(e) => setProviderName(e.target.value)}
                  placeholder="bKash"
                  className="input w-full"
                />
              </fieldset>

              <button type="submit" className="btn btn-primary">
                Add provider
              </button>
              {providerError && <p className="text-error text-sm">{providerError}</p>}
            </form>

            {providers.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {providers.map((provider) => (
                  <span key={provider.id} className="badge badge-outline">
                    {provider.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
