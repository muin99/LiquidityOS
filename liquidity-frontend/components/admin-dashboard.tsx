"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import UsersIcon from "@heroicons/react/24/outline/UsersIcon";
import BuildingOfficeIcon from "@heroicons/react/24/outline/BuildingOfficeIcon";
import MapPinIcon from "@heroicons/react/24/outline/MapPinIcon";
import WalletIcon from "@heroicons/react/24/outline/WalletIcon";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import TitleCard from "@/components/title-card";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [pendingApplications, setPendingApplications] = useState<any[]>([]);
  const [areas, setAreas] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [actionError, setActionError] = useState("");

  // which tab is showing right now
  const [tab, setTab] = useState("pending");

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
    const response = await axios.get(
      "/api/coordinator-providers/pending",
      authHeader,
    );
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
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-700 border-t-blue-500" />
      </div>
    );
  }

  const inputClass =
    "w-full rounded-md border border-gray-600 bg-gray-900 px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";

  // picks the right look for whichever tab button is active right now
  function tabClass(name: string) {
    const base = "flex items-center border-b-2 px-1 py-3 text-sm font-medium";
    if (tab === name) {
      return `${base} border-blue-500 font-semibold text-blue-400`;
    }
    return `${base} border-transparent text-gray-400 hover:border-gray-600 hover:text-gray-200`;
  }

  const pendingCount = pendingUsers.length + pendingApplications.length;

  // Count how many people have each role, for the bar chart.
  const roleCounts: any = {};
  for (const user of users) {
    roleCounts[user.role] = (roleCounts[user.role] || 0) + 1;
  }
  const roleChartData = Object.keys(roleCounts).map((role) => ({
    role: role.charAt(0).toUpperCase() + role.slice(1),
    count: roleCounts[role],
  }));

  // Count how many people are in each area, for the heatmap.
  const areaCounts: any = {};
  for (const user of users) {
    if (!user.area) continue;
    areaCounts[user.area.name] = (areaCounts[user.area.name] || 0) + 1;
  }
  const areaChartData = Object.keys(areaCounts).map((name) => ({
    name,
    count: areaCounts[name],
  }));
  let maxAreaCount = 0;
  for (const area of areaChartData) {
    if (area.count > maxAreaCount) maxAreaCount = area.count;
  }

  // Darker blue means more people in that area. A basic heatmap,
  // just plain colored boxes, no chart library needed for this one.
  function heatColor(count: number) {
    const ratio = maxAreaCount === 0 ? 0 : count / maxAreaCount;
    const alpha = 0.15 + ratio * 0.65;
    return `rgba(59, 130, 246, ${alpha})`;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-px overflow-hidden rounded-lg bg-gray-700 shadow sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-gray-800 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Pending registrations</span>
            <UsersIcon className="h-6 w-6 text-blue-400" />
          </div>
          <div className="mt-1 text-2xl font-bold text-gray-100">
            {pendingUsers.length}
          </div>
        </div>
        <div className="bg-gray-800 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Pending join requests</span>
            <BuildingOfficeIcon className="h-6 w-6 text-blue-400" />
          </div>
          <div className="mt-1 text-2xl font-bold text-gray-100">
            {pendingApplications.length}
          </div>
        </div>
        <div className="bg-gray-800 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Areas</span>
            <MapPinIcon className="h-6 w-6 text-blue-400" />
          </div>
          <div className="mt-1 text-2xl font-bold text-gray-100">
            {areas.length}
          </div>
        </div>
        <div className="bg-gray-800 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Providers</span>
            <WalletIcon className="h-6 w-6 text-blue-400" />
          </div>
          <div className="mt-1 text-2xl font-bold text-gray-100">
            {providers.length}
          </div>
        </div>
      </div>

      <div className="border-b border-gray-700">
        <nav className="-mb-px flex gap-6 overflow-x-auto">
          <button
            onClick={() => setTab("pending")}
            className={tabClass("pending")}
          >
            Pending
            {pendingCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center rounded-full bg-blue-600 px-2 py-0.5 text-xs font-semibold text-white">
                {pendingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab("people")}
            className={tabClass("people")}
          >
            All people
          </button>
          <button onClick={() => setTab("setup")} className={tabClass("setup")}>
            Setup
          </button>
        </nav>
      </div>

      {actionError && <p className="text-sm text-red-400">{actionError}</p>}

      {tab === "pending" && (
        <div className="flex flex-col gap-8">
          <TitleCard title="Pending registrations">
            <p className="-mt-2 mb-3 text-sm text-gray-400">
              Agents, coordinators, and providers all start here — coordinator
              join requests to a specific provider are decided by that provider,
              not by admin.
            </p>
            {pendingUsers.length === 0 ? (
              <p className="text-gray-400">Nothing waiting for approval.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {pendingUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between rounded-lg border border-gray-700 bg-gray-800 px-4 py-3"
                  >
                    <div>
                      <p className="font-medium text-gray-100">
                        {user.fullName}
                      </p>
                      <p className="text-sm capitalize text-gray-400">
                        {user.role}
                        {user.area && <> — {user.area.name}</>}
                        {user.provider && <> — {user.provider.name}</>}
                      </p>
                      <p className="text-xs text-gray-500">
                        Registered {new Date(user.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => approveUser(user.id)}
                      className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700"
                    >
                      Approve
                    </button>
                  </div>
                ))}
              </div>
            )}
          </TitleCard>

          <TitleCard title="Pending coordinator join requests">
            {pendingApplications.length === 0 ? (
              <p className="text-gray-400">Nothing waiting for a decision.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {pendingApplications.map((app) => (
                  <div
                    key={app.id}
                    className="flex items-center justify-between rounded-lg border border-gray-700 bg-gray-800 px-4 py-3"
                  >
                    <div>
                      <p className="font-medium text-gray-100">
                        {app.coordinator.fullName}
                      </p>
                      <p className="text-sm text-gray-400">
                        wants to become a coordinator for {app.provider.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        Applied {new Date(app.appliedAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => decideApplication(app.id, "approved")}
                        className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => decideApplication(app.id, "rejected")}
                        className="rounded-md px-3 py-1.5 text-xs font-semibold text-gray-300 hover:bg-gray-700"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TitleCard>
        </div>
      )}

      {tab === "people" && (
        <div className="flex flex-col gap-8">
          <TitleCard title="People by role">
            {roleChartData.length === 0 ? (
              <p className="text-gray-400">No people yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={roleChartData}>
                  <CartesianGrid stroke="#374151" strokeDasharray="3 3" />
                  <XAxis dataKey="role" tick={{ fill: "#9ca3af", fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fill: "#9ca3af", fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "6px" }}
                    labelStyle={{ color: "#f3f4f6" }}
                    itemStyle={{ color: "#f3f4f6" }}
                  />
                  <Bar dataKey="count" name="People" fill="#60a5fa" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </TitleCard>

          <TitleCard title="People by area">
            <p className="-mt-2 mb-3 text-sm text-gray-400">
              Darker box means more agents and coordinators in that area.
            </p>
            {areaChartData.length === 0 ? (
              <p className="text-gray-400">No area data yet.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {areaChartData.map((area) => (
                  <div
                    key={area.name}
                    style={{ backgroundColor: heatColor(area.count) }}
                    className="rounded-lg border border-gray-700 p-4 text-center"
                  >
                    <div className="text-sm text-gray-100">{area.name}</div>
                    <div className="text-2xl font-bold text-white">{area.count}</div>
                  </div>
                ))}
              </div>
            )}
          </TitleCard>

        <TitleCard title="All people">
          <p className="-mt-2 mb-3 text-sm text-gray-400">
            Agents, coordinators, providers, and admins in one place.
          </p>
          <div className="overflow-x-auto rounded-lg border border-gray-700 bg-gray-800">
            <table className="w-full text-left text-sm">
              <thead>
                <tr>
                  <th className="border-b border-gray-700 px-4 py-2 font-medium text-gray-400">
                    Name
                  </th>
                  <th className="border-b border-gray-700 px-4 py-2 font-medium text-gray-400">
                    Role
                  </th>
                  <th className="border-b border-gray-700 px-4 py-2 font-medium text-gray-400">
                    Area / provider
                  </th>
                  <th className="border-b border-gray-700 px-4 py-2 font-medium text-gray-400">
                    Status
                  </th>
                  <th className="border-b border-gray-700 px-4 py-2 font-medium text-gray-400"></th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="odd:bg-gray-800 even:bg-gray-900/40"
                  >
                    <td className="border-b border-gray-700 px-4 py-2">
                      <div className="font-medium text-gray-100">
                        {user.fullName}
                      </div>
                      <div className="text-xs text-gray-400">
                        {user.email || user.phone}
                      </div>
                    </td>
                    <td className="border-b border-gray-700 px-4 py-2 capitalize">
                      {user.role}
                    </td>
                    <td className="border-b border-gray-700 px-4 py-2">
                      {user.provider?.name || user.area?.name || "-"}
                    </td>
                    <td className="border-b border-gray-700 px-4 py-2">
                      <span className="inline-flex items-center rounded-full border border-gray-600 px-2.5 py-0.5 text-xs font-medium capitalize text-gray-300">
                        {user.status}
                      </span>
                    </td>
                    <td className="border-b border-gray-700 px-4 py-2">
                      {(user.status === "pending" ||
                        user.status === "suspended") && (
                        <button
                          onClick={() => approveUser(user.id)}
                          className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700"
                        >
                          {user.status === "suspended" ? "Activate" : "Approve"}
                        </button>
                      )}
                      {user.status === "active" && (
                        <button
                          onClick={() => restrictUser(user.id)}
                          className="ml-2 rounded-md bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-600"
                        >
                          Restrict
                        </button>
                      )}
                      <button
                        onClick={() => deleteUser(user.id, user.fullName)}
                        className="ml-2 rounded-md px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-900/30"
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
        </div>
      )}

      {tab === "setup" && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <TitleCard title="Add an area">
            <p className="text-sm text-gray-400">
              Agents and coordinators need an area to pick when they sign up.
            </p>

            <form onSubmit={handleAddArea} className="mt-2 flex flex-col gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-300">
                  Name
                </label>
                <input
                  type="text"
                  value={areaName}
                  onChange={(e) => setAreaName(e.target.value)}
                  placeholder="Dhaka North"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-300">
                  Region
                </label>
                <input
                  type="text"
                  value={areaRegion}
                  onChange={(e) => setAreaRegion(e.target.value)}
                  placeholder="Dhaka"
                  className={inputClass}
                />
              </div>

              <button
                type="submit"
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Add area
              </button>
              {areaError && <p className="text-sm text-red-400">{areaError}</p>}
            </form>

            {areas.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {areas.map((area) => (
                  <span
                    key={area.id}
                    className="inline-flex items-center rounded-full border border-gray-600 px-2.5 py-0.5 text-xs font-medium text-gray-300"
                  >
                    {area.name}
                  </span>
                ))}
              </div>
            )}
          </TitleCard>

          <TitleCard title="Add a provider">
            <p className="text-sm text-gray-400">
              A "provider" role account needs to pick one of these when they
              sign up.
            </p>

            <form
              onSubmit={handleAddProvider}
              className="mt-2 flex flex-col gap-3"
            >
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-300">
                  Name
                </label>
                <input
                  type="text"
                  value={providerName}
                  onChange={(e) => setProviderName(e.target.value)}
                  placeholder="bKash"
                  className={inputClass}
                />
              </div>

              <button
                type="submit"
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Add provider
              </button>
              {providerError && (
                <p className="text-sm text-red-400">{providerError}</p>
              )}
            </form>

            {providers.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {providers.map((provider) => (
                  <span
                    key={provider.id}
                    className="inline-flex items-center rounded-full border border-gray-600 px-2.5 py-0.5 text-xs font-medium text-gray-300"
                  >
                    {provider.name}
                  </span>
                ))}
              </div>
            )}
          </TitleCard>
        </div>
      )}
    </div>
  );
}
