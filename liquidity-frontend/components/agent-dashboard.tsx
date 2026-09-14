"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import BanknotesIcon from "@heroicons/react/24/outline/BanknotesIcon";
import WalletIcon from "@heroicons/react/24/outline/WalletIcon";
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
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
const PIE_COLORS = [
  "#60a5fa",
  "#4ade80",
  "#fbbf24",
  "#f472b6",
  "#c084fc",
  "#22d3ee",
];

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
    <text
      x={x}
      y={y}
      fill="#e5e7eb"
      fontSize={12}
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
    >
      {`${name} ${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

export default function AgentDashboard() {
  const [loading, setLoading] = useState(true);

  // Real data from the backend now, not fake mock data.
  const [drawerBalance, setDrawerBalance] = useState(0);
  const [wallets, setWallets] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [allProviders, setAllProviders] = useState<any[]>([]);
  const [providerApplications, setProviderApplications] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);

  // which tab is showing right now
  const [tab, setTab] = useState("wallets");

  // Every request that needs to prove who we are just sends this
  // header by hand, no auto-attaching magic behind the scenes.
  const token = localStorage.getItem("access_token");
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  // Go ask the backend "what does my stuff look like right now" and
  // put the answer into state. We call this again after every
  // cash-in / cash-out / request, so the numbers on screen stay fresh.
  async function loadWallets() {
    const response = await axios.get("/api/wallets/me", authHeader);
    setDrawerBalance(Number(response.data.cashDrawer.balance));
    setWallets(response.data.ecashWallets);
  }

  async function loadRequests() {
    const response = await axios.get("/api/ecash-requests/mine", authHeader);
    setRequests(response.data);
  }

  // The agent's own cash-in/cash-out log, so they can see exactly
  // what happened and when, not just the current balances.
  async function loadTransactions() {
    const response = await axios.get("/api/wallets/transactions", authHeader);
    setTransactions(response.data);
  }

  async function loadProviderApplications() {
    const [approvedResponse, mineResponse, allResponse] = await Promise.all([
      axios.get("/api/agent-providers/approved", authHeader),
      axios.get("/api/agent-providers/mine", authHeader),
      axios.get("/api/providers"),
    ]);
    setProviders(approvedResponse.data.map((item: any) => item.provider));
    setProviderApplications(mineResponse.data);
    setAllProviders(allResponse.data);
  }

  useEffect(() => {
    async function loadEverything() {
      await loadWallets();
      await loadRequests();
      await loadTransactions();

      await loadProviderApplications();

      setLoading(false);
    }

    loadEverything();
  }, []);

  // --- cash-in / cash-out form ---
  const [moveData, setMoveData] = useState({
    type: "cash-in",
    providerId: "",
    amount: "",
  });
  const [moveError, setMoveError] = useState("");

  function handleMoveChange(e: any) {
    const { name, value } = e.target;
    setMoveData({
      ...moveData,
      [name]: value,
    });
  }

  async function handleMoveSubmit(e: any) {
    e.preventDefault();

    const amount = Number(moveData.amount);

    if (!moveData.providerId) {
      setMoveError("Please pick a provider");
      return;
    }
    if (!moveData.amount || amount <= 0) {
      setMoveError("Please enter an amount greater than 0");
      return;
    }

    try {
      // moveData.type is either "cash-in" or "cash-out", which
      // happen to also be the names of the two backend routes.
      await axios.post(
        `/api/wallets/${moveData.type}`,
        { providerId: moveData.providerId, amount },
        authHeader,
      );

      await loadWallets();
      await loadTransactions();
      setMoveError("");
      setMoveData({ ...moveData, amount: "" });
    } catch (err) {
      setMoveError("Something went wrong, please try again");
    }
  }

  // --- e-cash request form ---
  const [formData, setFormData] = useState({
    providerId: "",
    amount: "",
    type: "e_cash",
  });
  const [error, setError] = useState("");

  function handleChange(e: any) {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  }

  async function handleSubmit(e: any) {
    e.preventDefault();

    if (!formData.providerId) {
      setError("Please pick a provider");
      return;
    }
    if (!formData.amount || Number(formData.amount) <= 0) {
      setError("Please enter an amount greater than 0");
      return;
    }

    try {
      await axios.post(
        "/api/ecash-requests",
        {
          providerId: formData.providerId,
          amount: Number(formData.amount),
          type: formData.type,
        },
        authHeader,
      );

      await loadRequests();
      setError("");
      setFormData({ providerId: "", amount: "", type: "e_cash" });
    } catch (err) {
      setError("Something went wrong, please try again");
    }
  }

  async function cancelRequest(id: string) {
    try {
      await axios.patch(`/api/ecash-requests/${id}/cancel`, {}, authHeader);
      await loadRequests();
      setError("");
    } catch (err) {
      setError("This request can no longer be cancelled");
    }
  }

  const [selectedProvider, setSelectedProvider] = useState("");
  const [providerError, setProviderError] = useState("");

  async function applyToProvider(e: any) {
    e.preventDefault();
    if (!selectedProvider) {
      setProviderError("Please pick a provider");
      return;
    }

    try {
      await axios.post(
        "/api/agent-providers/apply",
        { providerId: selectedProvider },
        authHeader,
      );
      await loadProviderApplications();
      setSelectedProvider("");
      setProviderError("");
    } catch (err) {
      setProviderError("You already applied to this provider");
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-700 border-t-blue-500" />
      </div>
    );
  }

  // A couple of simple totals, worked out from the data we already
  // loaded above — nothing new fetched, just plain addition/counting.
  let totalEcash = 0;
  for (const wallet of wallets) {
    totalEcash += Number(wallet.balance);
  }

  let pendingCount = 0;
  let fulfilledCount = 0;
  for (const req of requests) {
    if (req.status === "pending") pendingCount++;
    if (req.status === "fulfilled") fulfilledCount++;
  }

  // Just picks a plain Tailwind badge color to match the status word,
  // so its easier to scan a long list at a glance.
  function statusBadgeClass(status: string) {
    if (status === "pending") return "bg-amber-900/40 text-amber-300";
    if (status === "accepted") return "bg-sky-900/40 text-sky-300";
    if (status === "fulfilled") return "bg-green-900/40 text-green-300";
    if (status === "rejected") return "bg-red-900/40 text-red-300";
    return "bg-gray-700 text-gray-300";
  }

  const inputClass =
    "w-full rounded-md border border-gray-600 bg-gray-900 px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";

  // Turn the wallet list into the {name, value} shape the pie chart wants.
  const pieData = wallets
    .filter((wallet) => Number(wallet.balance) > 0)
    .map((wallet) => ({
      name: wallet.provider.name,
      value: Number(wallet.balance),
    }));

  // Turn the transaction log into {date, drawer, wallet} points for the
  // line chart, oldest first so the line reads left to right.
  const historyChartData = transactions.map((tx) => ({
    date: new Date(tx.createdAt).toLocaleDateString(),
    drawer: Number(tx.drawerBalanceAfter),
    wallet: Number(tx.walletBalanceAfter),
  }));

  // picks the right look for whichever tab button is active right now
  function tabClass(name: string) {
    const base = "flex items-center border-b-2 px-1 py-3 text-sm font-medium";
    if (tab === name) {
      return `${base} border-blue-500 font-semibold text-blue-400`;
    }
    return `${base} border-transparent text-gray-400 hover:border-gray-600 hover:text-gray-200`;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-px overflow-hidden rounded-lg bg-gray-700 shadow sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-gray-800 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Cash drawer</span>
            <BanknotesIcon className="h-6 w-6 text-blue-400" />
          </div>
          <div className="mt-1 text-2xl font-bold text-gray-100">
            ৳{drawerBalance}
          </div>
          <div className="text-xs text-gray-500">Physical cash on hand</div>
        </div>
        <div className="bg-gray-800 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Total e-cash</span>
            <WalletIcon className="h-6 w-6 text-blue-400" />
          </div>
          <div className="mt-1 text-2xl font-bold text-gray-100">
            ৳{totalEcash}
          </div>
          <div className="text-xs text-gray-500">Across all wallets</div>
        </div>
        <div className="bg-gray-800 p-4">
          <span className="text-xs text-gray-400">Pending requests</span>
          <div className="mt-1 text-2xl font-bold text-gray-100">
            {pendingCount}
          </div>
        </div>
        <div className="bg-gray-800 p-4">
          <span className="text-xs text-gray-400">Fulfilled requests</span>
          <div className="mt-1 text-2xl font-bold text-gray-100">
            {fulfilledCount}
          </div>
        </div>
      </div>

      <div className="border-b border-gray-700">
        <nav className="-mb-px flex gap-6 overflow-x-auto">
          <button
            onClick={() => setTab("wallets")}
            className={tabClass("wallets")}
          >
            Wallets
          </button>
          <button onClick={() => setTab("move")} className={tabClass("move")}>
            Cash in / out
          </button>
          <button
            onClick={() => setTab("requests")}
            className={tabClass("requests")}
          >
            Requests
            {pendingCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center rounded-full bg-blue-600 px-2 py-0.5 text-xs font-semibold text-white">
                {pendingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab("history")}
            className={tabClass("history")}
          >
            History
          </button>
        </nav>
      </div>

      {tab === "wallets" && (
        <div className="flex flex-col gap-8">
          <TitleCard title="E-cash wallets">
            {wallets.length === 0 ? (
              <p className="text-gray-400">
                No e-cash yet — ask a coordinator to send some using the form
                below.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {wallets.map((wallet) => (
                  <div
                    key={wallet.id}
                    className="rounded-lg bg-gray-900 p-4 shadow"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">
                        {wallet.provider.name}
                      </span>
                      <WalletIcon className="h-6 w-6 text-blue-400" />
                    </div>
                    <div className="mt-1 text-2xl font-bold text-gray-100">
                      ৳{wallet.balance}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TitleCard>

          <TitleCard title="E-cash balance breakdown">
            {pieData.length === 0 ? (
              <p className="text-gray-400">Nothing to chart yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={{ stroke: "#6b7280" }}
                    label={renderPieLabel}
                    outerRadius={110}
                    dataKey="value"
                    isAnimationActive={false}
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: "6px",
                    }}
                    labelStyle={{ color: "#f3f4f6" }}
                    itemStyle={{ color: "#f3f4f6" }}
                    formatter={(value: any) => `৳${value}`}
                  />
                  <Legend wrapperStyle={{ color: "#d1d5db" }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </TitleCard>

          <TitleCard title="My provider applications">
            <p className="-mt-2 mb-3 text-sm text-gray-400">
              Apply to a provider first. You can request and transact only with
              providers that approve you.
            </p>
            <form
              onSubmit={applyToProvider}
              className="flex flex-col items-start gap-3 sm:flex-row"
            >
              <select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                className={`${inputClass} sm:w-64`}
              >
                <option value="">Pick a provider</option>
                {allProviders.map((provider) => (
                  <option key={provider.id} value={provider.id}>
                    {provider.name}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Apply
              </button>
            </form>
            {providerError && (
              <p className="mt-2 text-sm text-red-400">{providerError}</p>
            )}
            {providerApplications.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {providerApplications.map((application) => (
                  <span
                    key={application.id}
                    className="inline-flex items-center gap-2 rounded-full border border-gray-600 px-3 py-1 text-sm text-gray-300"
                  >
                    {application.provider.name}
                    <span className="capitalize text-gray-500">
                      ({application.status})
                    </span>
                  </span>
                ))}
              </div>
            )}
          </TitleCard>
        </div>
      )}

      {tab === "move" && (
        <TitleCard title="Cash in / Cash out">
          <div>
            <p className="text-sm text-gray-400">
              Cash-in moves money from e-cash into your drawer. Cash-out moves
              it back the other way.
            </p>

            <form
              onSubmit={handleMoveSubmit}
              className="mt-2 flex flex-col items-start gap-3 sm:flex-row"
            >
              <div className="w-full sm:w-36">
                <label className="mb-1 block text-sm font-medium text-gray-300">
                  Type
                </label>
                <select
                  name="type"
                  value={moveData.type}
                  onChange={handleMoveChange}
                  className={inputClass}
                >
                  <option value="cash-in">Cash in</option>
                  <option value="cash-out">Cash out</option>
                </select>
              </div>

              <div className="w-full sm:w-40">
                <label className="mb-1 block text-sm font-medium text-gray-300">
                  Provider
                </label>
                <select
                  name="providerId"
                  value={moveData.providerId}
                  onChange={handleMoveChange}
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

              <div className="w-full sm:w-40">
                <label className="mb-1 block text-sm font-medium text-gray-300">
                  Amount
                </label>
                <input
                  type="number"
                  name="amount"
                  value={moveData.amount}
                  onChange={handleMoveChange}
                  placeholder="1000"
                  className={inputClass}
                />
              </div>

              <button
                type="submit"
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 sm:mt-6"
              >
                Confirm
              </button>
            </form>

            {moveError && (
              <p className="mt-1 text-sm text-red-400">{moveError}</p>
            )}
          </div>
        </TitleCard>
      )}

      {tab === "requests" && (
        <div className="flex flex-col gap-8">
          <TitleCard title="Request liquidity">
            <div>
              <p className="text-sm text-gray-400">
                Choose whether you need e-cash or physical cash.
              </p>

              <form
                onSubmit={handleSubmit}
                className="mt-2 flex flex-col items-start gap-3 sm:flex-row"
              >
                <div className="w-full sm:w-40">
                  <label className="mb-1 block text-sm font-medium text-gray-300">
                    I need
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="e_cash">E-cash</option>
                    <option value="physical_cash">Physical cash</option>
                  </select>
                </div>

                <div className="w-full sm:w-40">
                  <label className="mb-1 block text-sm font-medium text-gray-300">
                    Provider
                  </label>
                  <select
                    name="providerId"
                    value={formData.providerId}
                    onChange={handleChange}
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

                <div className="w-full sm:w-40">
                  <label className="mb-1 block text-sm font-medium text-gray-300">
                    Amount
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    placeholder="5000"
                    className={inputClass}
                  />
                </div>

                <button
                  type="submit"
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 sm:mt-6"
                >
                  Send request
                </button>
              </form>

              {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
            </div>
          </TitleCard>

          <TitleCard title="My liquidity requests">
            {requests.length === 0 ? (
              <p className="text-gray-400">You haven't asked for e-cash yet.</p>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-gray-700 bg-gray-800">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr>
                      <th className="border-b border-gray-700 px-4 py-2 font-medium text-gray-400">
                        Provider
                      </th>
                      <th className="border-b border-gray-700 px-4 py-2 font-medium text-gray-400">
                        Amount
                      </th>
                      <th className="border-b border-gray-700 px-4 py-2 font-medium text-gray-400">
                        Type
                      </th>
                      <th className="border-b border-gray-700 px-4 py-2 font-medium text-gray-400">
                        Status
                      </th>
                      <th className="border-b border-gray-700 px-4 py-2 font-medium text-gray-400"></th>
                      <th className="border-b border-gray-700 px-4 py-2 font-medium text-gray-400">
                        Requested
                      </th>
                      <th className="border-b border-gray-700 px-4 py-2 font-medium text-gray-400">
                        Fulfilled
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((req) => (
                      <tr
                        key={req.id}
                        className="odd:bg-gray-800 even:bg-gray-900/40"
                      >
                        <td className="border-b border-gray-700 px-4 py-2">
                          {req.provider.name}
                        </td>
                        <td className="border-b border-gray-700 px-4 py-2">
                          ৳{req.amount}
                        </td>
                        <td className="border-b border-gray-700 px-4 py-2">
                          {req.type === "physical_cash"
                            ? "Physical cash"
                            : "E-cash"}
                        </td>
                        <td className="border-b border-gray-700 px-4 py-2">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusBadgeClass(req.status)}`}
                          >
                            {req.status}
                          </span>
                        </td>
                        <td className="border-b border-gray-700 px-4 py-2">
                          {req.status === "pending" && (
                            <button
                              onClick={() => cancelRequest(req.id)}
                              className="rounded-md px-2.5 py-1 text-xs font-semibold text-red-400 hover:bg-red-900/30"
                            >
                              Cancel
                            </button>
                          )}
                        </td>
                        <td className="border-b border-gray-700 px-4 py-2">
                          {new Date(req.requestedAt).toLocaleString()}
                        </td>
                        <td className="border-b border-gray-700 px-4 py-2">
                          {req.fulfilledAt
                            ? new Date(req.fulfilledAt).toLocaleString()
                            : "—"}
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
          <TitleCard title="Balance over time">
            {historyChartData.length === 0 ? (
              <p className="text-gray-400">No cash-in/cash-out yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={historyChartData}>
                  <CartesianGrid stroke="#374151" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "#9ca3af", fontSize: 12 }}
                  />
                  <YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: "6px",
                    }}
                    labelStyle={{ color: "#f3f4f6" }}
                    itemStyle={{ color: "#f3f4f6" }}
                    formatter={(value: any) => `৳${value}`}
                  />
                  <Legend wrapperStyle={{ color: "#d1d5db" }} />
                  <Line
                    type="monotone"
                    dataKey="drawer"
                    name="Cash drawer"
                    stroke="#60a5fa"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="wallet"
                    name="E-cash wallet"
                    stroke="#4ade80"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </TitleCard>

          <TitleCard title="Transaction history">
            {transactions.length === 0 ? (
              <p className="text-gray-400">No cash-in/cash-out yet.</p>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-gray-700 bg-gray-800">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr>
                      <th className="border-b border-gray-700 px-4 py-2 font-medium text-gray-400">
                        Date
                      </th>
                      <th className="border-b border-gray-700 px-4 py-2 font-medium text-gray-400">
                        Type
                      </th>
                      <th className="border-b border-gray-700 px-4 py-2 font-medium text-gray-400">
                        Provider
                      </th>
                      <th className="border-b border-gray-700 px-4 py-2 font-medium text-gray-400">
                        Amount
                      </th>
                      <th className="border-b border-gray-700 px-4 py-2 font-medium text-gray-400">
                        Drawer after
                      </th>
                      <th className="border-b border-gray-700 px-4 py-2 font-medium text-gray-400">
                        Wallet after
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...transactions].reverse().map((tx) => (
                      <tr
                        key={tx.id}
                        className="odd:bg-gray-800 even:bg-gray-900/40"
                      >
                        <td className="border-b border-gray-700 px-4 py-2">
                          {new Date(tx.createdAt).toLocaleString()}
                        </td>
                        <td className="border-b border-gray-700 px-4 py-2">
                          <span
                            className={
                              "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize " +
                              (tx.type === "cash_in"
                                ? "bg-green-900/40 text-green-300"
                                : "bg-amber-900/40 text-amber-300")
                            }
                          >
                            {tx.type === "cash_in" ? "Cash in" : "Cash out"}
                          </span>
                        </td>
                        <td className="border-b border-gray-700 px-4 py-2">
                          {tx.provider.name}
                        </td>
                        <td className="border-b border-gray-700 px-4 py-2">
                          ৳{tx.amount}
                        </td>
                        <td className="border-b border-gray-700 px-4 py-2">
                          ৳{tx.drawerBalanceAfter}
                        </td>
                        <td className="border-b border-gray-700 px-4 py-2">
                          ৳{tx.walletBalanceAfter}
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
    </div>
  );
}
