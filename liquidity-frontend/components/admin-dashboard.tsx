"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import UsersIcon from "@heroicons/react/24/outline/UsersIcon";
import BuildingOfficeIcon from "@heroicons/react/24/outline/BuildingOfficeIcon";
import MapPinIcon from "@heroicons/react/24/outline/MapPinIcon";
import WalletIcon from "@heroicons/react/24/outline/WalletIcon";
import TitleCard from "@/components/title-card";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [pendingApplications, setPendingApplications] = useState<any[]>([]);
  const [areas, setAreas] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [actionError, setActionError] = useState("");

  // Every request that needs to prove who we are just sends this
  // header by hand, no auto-attaching magic behind the scenes.
  const token = localStorage.getItem("access_token");
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  async function loadPendingUsers() {
    const response = await axios.get("/api/users/pending", authHeader);
    setPendingUsers(response.data);
  }

  async function loadUsers() {
    const response = await axios.get("/api/users", authHeader);
    setUsers(response.data);
  }

  async function loadPendingApplications() {
    const response = await axios.get("/api/coordinator-providers/pending", authHeader);
    setPendingApplications(response.data);
  }

  async function loadAreas() {
    const response = await axios.get("/api/areas");
    setAreas(response.data);
  }

  async function loadProviders() {
    const response = await axios.get("/api/providers");
    setProviders(response.data);
  }

  useEffect(() => {
    async function loadEverything() {
      await loadPendingUsers();
      await loadUsers();
      await loadPendingApplications();
      await loadAreas();
      await loadProviders();

      setLoading(false);
    }

    loadEverything();
  }, []);

  async function approveUser(id: string) {
    try {
      await axios.patch(`/api/users/${id}/approve`, {}, authHeader);
      await loadPendingUsers();
      await loadUsers();
      setActionError("");
    } catch (err) {
      setActionError("Something went wrong, please try again");
    }
  }

  async function deleteUser(id: string, name: string) {
    if (!window.confirm(`Delete ${name}? This cannot be undone.`)) {
      return;
    }

    try {
      await axios.delete(`/api/users/${id}`, authHeader);
      await loadPendingUsers();
      await loadUsers();
      setActionError("");
    } catch (err) {
      setActionError("Could not delete this user");
    }
  }

  async function restrictUser(id: string) {
    try {
      await axios.patch(`/api/users/${id}/restrict`, {}, authHeader);
      await loadPendingUsers();
      await loadUsers();
      setActionError("");
    } catch (err) {
      setActionError("Could not restrict this user");
    }
  }

  async function decideApplication(
    id: string,
    status: "approved" | "rejected",
  ) {
    try {
      await axios.patch(
        `/api/coordinator-providers/${id}/decide`,
        { status },
        authHeader,
      );
      await loadPendingApplications();
      setActionError("");
    } catch (err) {
      setActionError("Something went wrong, please try again");
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
      await axios.post(
        "/api/areas",
        { name: areaName, region: areaRegion },
        authHeader,
      );
      await loadAreas();
      setAreaError("");
      setAreaName("");
      setAreaRegion("");
    } catch (err) {
      setAreaError("Something went wrong, please try again");
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
    } catch (err) {
      setProviderError("Something went wrong, please try again");
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
      <div className="stats shadow w-full">
        <div className="stat">
          <div className="stat-figure text-primary">
            <UsersIcon className="h-8 w-8" />
          </div>
          <div className="stat-title">Pending registrations</div>
          <div className="stat-value">{pendingUsers.length}</div>
        </div>
        <div className="stat">
          <div className="stat-figure text-primary">
            <BuildingOfficeIcon className="h-8 w-8" />
          </div>
          <div className="stat-title">Pending join requests</div>
          <div className="stat-value">{pendingApplications.length}</div>
        </div>
        <div className="stat">
          <div className="stat-figure text-primary">
            <MapPinIcon className="h-8 w-8" />
          </div>
          <div className="stat-title">Areas</div>
          <div className="stat-value">{areas.length}</div>
        </div>
        <div className="stat">
          <div className="stat-figure text-primary">
            <WalletIcon className="h-8 w-8" />
          </div>
          <div className="stat-title">Providers</div>
          <div className="stat-value">{providers.length}</div>
        </div>
      </div>

      <TitleCard title="Pending registrations">
        <p className="text-sm text-base-content/60 -mt-2 mb-3">
          Agents, coordinators, and providers all start here — coordinator join
          requests to a specific provider are decided by that provider, not by
          admin.
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
                  <p className="text-xs text-base-content/50">
                    Registered {new Date(user.createdAt).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => approveUser(user.id)}
                  className="btn btn-success btn-sm"
                >
                  Approve
                </button>
              </div>
            ))}
          </div>
        )}
      </TitleCard>

      <TitleCard title="All people">
        <p className="text-sm text-base-content/60 -mt-2 mb-3">
          Agents, coordinators, providers, and admins in one place.
        </p>
        <div className="overflow-x-auto rounded-box border border-base-300 bg-base-100">
          <table className="table table-zebra">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Area / provider</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="font-medium">{user.fullName}</div>
                    <div className="text-xs text-base-content/60">
                      {user.email || user.phone}
                    </div>
                  </td>
                  <td className="capitalize">{user.role}</td>
                  <td>{user.provider?.name || user.area?.name || "-"}</td>
                  <td>
                    <span className="badge badge-outline capitalize">
                      {user.status}
                    </span>
                  </td>
                  <td>
                    {user.status === "pending" && (
                      <button
                        onClick={() => approveUser(user.id)}
                        className="btn btn-success btn-sm"
                      >
                        Approve
                      </button>
                    )}
                    {user.status === "active" && (
                      <button
                        onClick={() => restrictUser(user.id)}
                        className="btn btn-warning btn-sm ml-2"
                      >
                        Restrict
                      </button>
                    )}
                    <button
                      onClick={() => deleteUser(user.id, user.fullName)}
                      className="btn btn-ghost btn-error btn-sm ml-2"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TitleCard>

      <TitleCard title="Pending coordinator join requests">
        {pendingApplications.length === 0 ? (
          <p className="text-base-content/60">
            Nothing waiting for a decision.
          </p>
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
                  <p className="text-xs text-base-content/50">
                    Applied {new Date(app.appliedAt).toLocaleString()}
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
      </TitleCard>

      {actionError && <p className="text-error text-sm">{actionError}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <TitleCard title="Add an area">
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
        </TitleCard>

        <TitleCard title="Add a provider">
          <p className="text-sm text-base-content/60">
            A "provider" role account needs to pick one of these when they
            sign up.
          </p>

          <form
            onSubmit={handleAddProvider}
            className="flex flex-col gap-3 mt-2"
          >
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
            {providerError && (
              <p className="text-error text-sm">{providerError}</p>
            )}
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
        </TitleCard>
      </div>
    </div>
  );
}
