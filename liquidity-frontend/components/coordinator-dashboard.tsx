"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import InboxArrowDownIcon from "@heroicons/react/24/outline/InboxArrowDownIcon";
import BuildingOfficeIcon from "@heroicons/react/24/outline/BuildingOfficeIcon";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import TitleCard from "@/components/title-card";

// One color per pie slice. If there are more wallets than colors, it
// just loops back around to the start.
const PIE_COLORS = ["#60a5fa", "#4ade80", "#fbbf24", "#f472b6", "#c084fc", "#22d3ee"];

// Recharts draws its default slice labels in dark gray, which is
// invisible on our dark cards — so we draw the label text ourselves
// in a light color instead.
function renderPieLabel(props: any) {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, outerRadius, percent, name } = props;
  const radius = outerRadius + 22;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#e5e7eb" fontSize={12} textAnchor={x > cx ? "start" : "end"} dominantBaseline="central">
      {`${name} ${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

export default function CoordinatorDashboard() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [balances, setBalances] = useState({ cash: 0, ecashWallets: [] as any[] });
  const [transactions, setTransactions] = useState<any[]>([]);
  const [supplyRequests, setSupplyRequests] = useState<any[]>([]);
  const [actionError, setActionError] = useState("");

  // which tab is showing right now
  const [tab, setTab] = useState("liquidity");

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

  async function loadBalances() {
    const [balancesResponse, transactionsResponse] = await Promise.all([
      axios.get("/api/wallets/coordinator-balances", authHeader),
      axios.get("/api/wallets/coordinator-transactions", authHeader),
    ]);
    setBalances(balancesResponse.data);
    setTransactions(transactionsResponse.data);
  }

  async function loadSupplyRequests() {
    const response = await axios.get("/api/provider-supply-requests/mine", authHeader);
    setSupplyRequests(response.data);
  }

  useEffect(() => {
    async function loadEverything() {
      await loadRequests();
      await loadApplications();
      await loadBalances();
      await loadSupplyRequests();

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
  async function handleFulfill(request: any) {
    try {
      if (request.status === "pending") {
        await axios.patch(`/api/ecash-requests/${request.id}/accept`, {}, authHeader);
      }
      await axios.patch(`/api/ecash-requests/${request.id}/fulfill`, {}, authHeader);
      await loadRequests();
      await loadBalances();
      setActionError("");
    } catch (err: any) {
      const message = err.response?.data?.message;
      setActionError(Array.isArray(message) ? message[0] : message || "Could not fulfill this request");
      await loadRequests();
    }
  }

  // --- apply to become a coordinator for a provider ---
  const [selectedProvider, setSelectedProvider] = useState("");
  const [applyError, setApplyError] = useState("");
  const [supplyData, setSupplyData] = useState({ providerId: "", type: "e_cash", amount: "" });
  const [supplyError, setSupplyError] = useState("");

  async function requestSupply(e: any) {
    e.preventDefault();
    if (!supplyData.providerId || !supplyData.amount || Number(supplyData.amount) <= 0) {
      setSupplyError("Please pick a provider and enter an amount");
      return;
    }
    try {
      await axios.post("/api/provider-supply-requests", {
        ...supplyData,
        amount: Number(supplyData.amount),
      }, authHeader);
      await loadSupplyRequests();
      setSupplyData({ providerId: "", type: "e_cash", amount: "" });
      setSupplyError("");
    } catch (err) {
      setSupplyError("Could not send this funding request. Check that the provider approved you.");
    }
  }

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
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-700 border-t-blue-500" />
      </div>
    );
  }

  // Just picks a plain Tailwind badge color to match the status word,
  // so its easier to scan a long list at a glance.
  function statusBadgeClass(status: string) {
    if (status === "pending") return "bg-amber-900/40 text-amber-300";
    if (status === "accepted") return "bg-sky-900/40 text-sky-300";
    if (status === "fulfilled" || status === "approved") return "bg-green-900/40 text-green-300";
    if (status === "rejected") return "bg-red-900/40 text-red-300";
    return "bg-gray-700 text-gray-300";
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

  // Turn cash + e-cash wallets into the {name, value} shape the pie chart wants.
  const liquidityPieData = [
    { name: "Physical cash", value: Number(balances.cash) },
    ...balances.ecashWallets.map((wallet) => ({
      name: wallet.provider.name,
      value: Number(wallet.balance),
    })),
  ].filter((entry) => entry.value > 0);

  // Turn the funding/fulfillment log into {date, amount} points, oldest
  // first, for the bar chart.
  const historyChartData = [...transactions].reverse().map((t) => ({
    date: new Date(t.createdAt).toLocaleDateString(),
    amount: Number(t.amount),
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-px overflow-hidden rounded-lg bg-gray-700 shadow sm:grid-cols-3">
        <div className="bg-gray-800 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Pending requests</span>
            <InboxArrowDownIcon className="h-6 w-6 text-blue-400" />
          </div>
          <div className="mt-1 text-2xl font-bold text-gray-100">{requests.length}</div>
        </div>
        <div className="bg-gray-800 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">My applications</span>
            <BuildingOfficeIcon className="h-6 w-6 text-blue-400" />
          </div>
          <div className="mt-1 text-2xl font-bold text-gray-100">{applications.length}</div>
        </div>
        <div className="bg-gray-800 p-4">
          <span className="text-xs text-gray-400">Cash on hand</span>
          <div className="mt-1 text-2xl font-bold text-gray-100">৳{balances.cash}</div>
        </div>
      </div>

      <div className="border-b border-gray-700">
        <nav className="-mb-px flex gap-6 overflow-x-auto">
          <button onClick={() => setTab("liquidity")} className={tabClass("liquidity")}>
            Liquidity
          </button>
          <button onClick={() => setTab("requests")} className={tabClass("requests")}>
            Agent requests
            {requests.length > 0 && (
              <span className="ml-2 inline-flex items-center justify-center rounded-full bg-blue-600 px-2 py-0.5 text-xs font-semibold text-white">
                {requests.length}
              </span>
            )}
          </button>
          <button onClick={() => setTab("providers")} className={tabClass("providers")}>
            Providers
          </button>
          <button onClick={() => setTab("history")} className={tabClass("history")}>
            History
          </button>
        </nav>
      </div>

      {tab === "liquidity" && (
        <div className="flex flex-col gap-8">
          <TitleCard title="My available liquidity">
            <p className="-mt-2 mb-3 text-sm text-gray-400">
              Your provider supplies and completed swaps update these balances.
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-lg bg-gray-900 p-4 shadow">
                <span className="text-xs text-gray-400">Physical cash</span>
                <div className="mt-1 text-2xl font-bold text-gray-100">৳{balances.cash}</div>
              </div>
              {balances.ecashWallets.map((wallet) => (
                <div key={wallet.id} className="rounded-lg bg-gray-900 p-4 shadow">
                  <span className="text-xs text-gray-400">{wallet.provider.name} e-cash</span>
                  <div className="mt-1 text-2xl font-bold text-gray-100">৳{wallet.balance}</div>
                </div>
              ))}
            </div>
          </TitleCard>

          <TitleCard title="Liquidity breakdown">
            {liquidityPieData.length === 0 ? (
              <p className="text-gray-400">Nothing to chart yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={liquidityPieData}
                    cx="50%"
                    cy="50%"
                    labelLine={{ stroke: "#6b7280" }}
                    label={renderPieLabel}
                    outerRadius={110}
                    dataKey="value"
                    isAnimationActive={false}
                  >
                    {liquidityPieData.map((entry, index) => (
                      <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "6px" }}
                    labelStyle={{ color: "#f3f4f6" }}
                    itemStyle={{ color: "#f3f4f6" }}
                    formatter={(value: any) => `৳${value}`}
                  />
                  <Legend wrapperStyle={{ color: "#d1d5db" }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </TitleCard>

          <TitleCard title="Request liquidity from a provider">
            <p className="-mt-2 mb-3 text-sm text-gray-400">
              Request the cash or e-cash you need from an approved provider. The provider fulfills it from their reserve.
            </p>
            <form onSubmit={requestSupply} className="grid grid-cols-1 items-end gap-3 sm:grid-cols-4">
              <select
                value={supplyData.providerId}
                onChange={(e) => setSupplyData({ ...supplyData, providerId: e.target.value })}
                className={inputClass}
              >
                <option value="">Pick an approved provider</option>
                {applications.filter((app) => app.status === "approved").map((app) => (
                  <option key={app.id} value={app.providerId}>{app.provider.name}</option>
                ))}
              </select>
              <select
                value={supplyData.type}
                onChange={(e) => setSupplyData({ ...supplyData, type: e.target.value })}
                className={inputClass}
              >
                <option value="e_cash">E-cash</option>
                <option value="physical_cash">Physical cash</option>
              </select>
              <input
                type="number"
                value={supplyData.amount}
                onChange={(e) => setSupplyData({ ...supplyData, amount: e.target.value })}
                placeholder="10000"
                className={inputClass}
              />
              <button
                type="submit"
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Request funding
              </button>
            </form>
            {supplyError && <p className="mt-2 text-sm text-red-400">{supplyError}</p>}

            {supplyRequests.length > 0 && (
              <div className="mt-4 overflow-x-auto rounded-lg border border-gray-700 bg-gray-800">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr>
                      <th className="border-b border-gray-700 px-4 py-2 font-medium text-gray-400">Provider</th>
                      <th className="border-b border-gray-700 px-4 py-2 font-medium text-gray-400">Need</th>
                      <th className="border-b border-gray-700 px-4 py-2 font-medium text-gray-400">Amount</th>
                      <th className="border-b border-gray-700 px-4 py-2 font-medium text-gray-400">Status</th>
                      <th className="border-b border-gray-700 px-4 py-2 font-medium text-gray-400">Requested</th>
                    </tr>
                  </thead>
                  <tbody>
                    {supplyRequests.map((request) => (
                      <tr key={request.id} className="odd:bg-gray-800 even:bg-gray-900/40">
                        <td className="border-b border-gray-700 px-4 py-2">{request.provider.name}</td>
                        <td className="border-b border-gray-700 px-4 py-2">
                          {request.type === "physical_cash" ? "Physical cash" : "E-cash"}
                        </td>
                        <td className="border-b border-gray-700 px-4 py-2">৳{request.amount}</td>
                        <td className="border-b border-gray-700 px-4 py-2">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusBadgeClass(request.status)}`}
                          >
                            {request.status}
                          </span>
                        </td>
                        <td className="border-b border-gray-700 px-4 py-2">
                          {new Date(request.requestedAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TitleCard>
        </div>
      )}

      {tab === "requests" && (
        <TitleCard title="Liquidity requests from agents">
          <p className="-mt-2 mb-3 text-sm text-gray-400">
            Only shows requests for providers you're an approved coordinator
            for.
          </p>
          {requests.length === 0 ? (
            <p className="text-gray-400">Nothing waiting right now.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-700 bg-gray-800">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr>
                    <th className="border-b border-gray-700 px-4 py-2 font-medium text-gray-400">Agent</th>
                    <th className="border-b border-gray-700 px-4 py-2 font-medium text-gray-400">Provider</th>
                    <th className="border-b border-gray-700 px-4 py-2 font-medium text-gray-400">Amount</th>
                    <th className="border-b border-gray-700 px-4 py-2 font-medium text-gray-400">Need</th>
                    <th className="border-b border-gray-700 px-4 py-2 font-medium text-gray-400">Status</th>
                    <th className="border-b border-gray-700 px-4 py-2 font-medium text-gray-400">Requested</th>
                    <th className="border-b border-gray-700 px-4 py-2 font-medium text-gray-400"></th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((req) => (
                    <tr key={req.id} className="odd:bg-gray-800 even:bg-gray-900/40">
                      <td className="border-b border-gray-700 px-4 py-2">{req.agent.fullName}</td>
                      <td className="border-b border-gray-700 px-4 py-2">{req.provider.name}</td>
                      <td className="border-b border-gray-700 px-4 py-2">৳{req.amount}</td>
                      <td className="border-b border-gray-700 px-4 py-2">
                        {req.type === "physical_cash" ? "Physical cash" : "E-cash"}
                      </td>
                      <td className="border-b border-gray-700 px-4 py-2">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusBadgeClass(req.status)}`}
                        >
                          {req.status}
                        </span>
                      </td>
                      <td className="border-b border-gray-700 px-4 py-2">
                        {new Date(req.requestedAt).toLocaleString()}
                      </td>
                      <td className="border-b border-gray-700 px-4 py-2">
                        <button
                          onClick={() => handleFulfill(req)}
                          className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                        >
                          {req.status === "accepted" ? "Retry fulfill" : "Fulfill"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {actionError && <p className="mt-1 text-sm text-red-400">{actionError}</p>}
        </TitleCard>
      )}

      {tab === "providers" && (
        <div className="flex flex-col gap-8">
          <TitleCard title="Apply to a provider">
            <p className="text-sm text-gray-400">
              Ask to become the coordinator for a provider. An admin (or that
              provider) has to approve it before you can fulfill requests
              for them.
            </p>

            <form
              onSubmit={handleApply}
              className="mt-2 flex flex-col items-start gap-3 sm:flex-row"
            >
              <div className="w-full sm:w-40">
                <label className="mb-1 block text-sm font-medium text-gray-300">Provider</label>
                <select
                  value={selectedProvider}
                  onChange={(e) => setSelectedProvider(e.target.value)}
                  className={inputClass}
                >
                  <option value="">Pick a provider</option>
                  {providers.map((provider) => (
                    <option key={provider.id} value={provider.id}>
                      {provider.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 sm:mt-6"
              >
                Apply
              </button>
            </form>

            {applyError && (
              <p className="mt-1 text-sm text-red-400">{applyError}</p>
            )}
          </TitleCard>

          <TitleCard title="My provider applications">
            {applications.length === 0 ? (
              <p className="text-gray-400">You haven't applied to any providers yet.</p>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-gray-700 bg-gray-800">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr>
                      <th className="border-b border-gray-700 px-4 py-2 font-medium text-gray-400">Provider</th>
                      <th className="border-b border-gray-700 px-4 py-2 font-medium text-gray-400">Status</th>
                      <th className="border-b border-gray-700 px-4 py-2 font-medium text-gray-400">Applied on</th>
                      <th className="border-b border-gray-700 px-4 py-2 font-medium text-gray-400">Decided on</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((app) => (
                      <tr key={app.id} className="odd:bg-gray-800 even:bg-gray-900/40">
                        <td className="border-b border-gray-700 px-4 py-2">{app.provider.name}</td>
                        <td className="border-b border-gray-700 px-4 py-2">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusBadgeClass(app.status)}`}
                          >
                            {app.status}
                          </span>
                        </td>
                        <td className="border-b border-gray-700 px-4 py-2">
                          {new Date(app.appliedAt).toLocaleString()}
                        </td>
                        <td className="border-b border-gray-700 px-4 py-2">
                          {app.decidedAt ? new Date(app.decidedAt).toLocaleString() : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TitleCard>
        </div>
      )}

      {tab === "history" && (
        <div className="flex flex-col gap-8">
          <TitleCard title="Funding activity">
            {historyChartData.length === 0 ? (
              <p className="text-gray-400">No supply or fulfillment activity yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={historyChartData}>
                  <CartesianGrid stroke="#374151" strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fill: "#9ca3af", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "6px" }}
                    labelStyle={{ color: "#f3f4f6" }}
                    itemStyle={{ color: "#f3f4f6" }}
                    formatter={(value: any) => `৳${value}`}
                  />
                  <Bar dataKey="amount" name="Amount" fill="#60a5fa" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </TitleCard>

        <TitleCard title="My funding and fulfillment history">
          {transactions.length === 0 ? (
            <p className="text-gray-400">No supply or fulfillment activity yet.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-700 bg-gray-800">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr>
                    <th className="border-b border-gray-700 px-4 py-2 font-medium text-gray-400">Date</th>
                    <th className="border-b border-gray-700 px-4 py-2 font-medium text-gray-400">Type</th>
                    <th className="border-b border-gray-700 px-4 py-2 font-medium text-gray-400">Provider</th>
                    <th className="border-b border-gray-700 px-4 py-2 font-medium text-gray-400">Agent</th>
                    <th className="border-b border-gray-700 px-4 py-2 font-medium text-gray-400">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="odd:bg-gray-800 even:bg-gray-900/40">
                      <td className="border-b border-gray-700 px-4 py-2">
                        {new Date(transaction.createdAt).toLocaleString()}
                      </td>
                      <td className="border-b border-gray-700 px-4 py-2 capitalize">
                        {transaction.type.replaceAll("_", " ")}
                      </td>
                      <td className="border-b border-gray-700 px-4 py-2">{transaction.provider.name}</td>
                      <td className="border-b border-gray-700 px-4 py-2">{transaction.agent?.fullName || "-"}</td>
                      <td className="border-b border-gray-700 px-4 py-2">৳{transaction.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          </TitleCard>
        </div>
      )}
    </div>
  );
}
