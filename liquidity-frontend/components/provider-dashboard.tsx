"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import UserGroupIcon from "@heroicons/react/24/outline/UserGroupIcon";
import TitleCard from "@/components/title-card";

export default function ProviderDashboard() {
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<any[]>([]);
  const [agentApplications, setAgentApplications] = useState<any[]>([]);
  const [approvedAgents, setApprovedAgents] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [supplyRequests, setSupplyRequests] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [reserveHistory, setReserveHistory] = useState<any[]>([]);
  const [coordinators, setCoordinators] = useState<any[]>([]);
  const [balances, setBalances] = useState({ cash: 0, ecash: 0 });
  const [dailySummary, setDailySummary] = useState({ cashIn: 0, cashOut: 0 });
  const [providerName, setProviderName] = useState("");
  const [actionError, setActionError] = useState("");

  // Every request that needs to prove who we are just sends this
  // header by hand, no auto-attaching magic behind the scenes.
  const token = localStorage.getItem("access_token");
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  async function loadApplications() {
    const response = await axios.get("/api/coordinator-providers/pending", authHeader);
    setApplications(response.data);
  }

  async function loadAgentApplications() {
    const response = await axios.get("/api/agent-providers/pending", authHeader);
    setAgentApplications(response.data);
  }

  async function loadApprovedAgents() {
    const response = await axios.get("/api/agent-providers/approved-for-provider", authHeader);
    setApprovedAgents(response.data);
  }

  async function loadLogs() {
    const [requestsResponse, transactionsResponse, historyResponse, balancesResponse, summaryResponse] = await Promise.all([
      axios.get("/api/ecash-requests/provider-history", authHeader),
      axios.get("/api/wallets/provider-transactions", authHeader),
      axios.get("/api/wallets/provider-reserve-history", authHeader),
      axios.get("/api/wallets/provider-balances", authHeader),
      axios.get("/api/wallets/provider-daily-summary", authHeader),
    ]);
    setRequests(requestsResponse.data);
    setTransactions(transactionsResponse.data);
    setReserveHistory(historyResponse.data);
    setBalances(balancesResponse.data);
    setDailySummary(summaryResponse.data);
  }

  async function loadSupplyRequests() {
    const response = await axios.get("/api/provider-supply-requests/pending", authHeader);
    setSupplyRequests(response.data);
  }

  async function loadCoordinators() {
    const response = await axios.get("/api/coordinator-providers/approved", authHeader);
    setCoordinators(response.data);
  }

  useEffect(() => {
    async function loadEverything() {
      // The logged in user (saved at login time) already knows which
      // provider this account represents.
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      await loadApplications();
      await loadAgentApplications();
      await loadApprovedAgents();
      await loadLogs();
      await loadSupplyRequests();
      await loadCoordinators();

      const providersResponse = await axios.get("/api/providers");
      const mine = providersResponse.data.find((p: any) => p.id === user.providerId);
      if (mine) {
        setProviderName(mine.name);
      }

      setLoading(false);
    }

    loadEverything();
  }, []);

  async function handleDecide(id: string, status: "approved" | "rejected") {
    try {
      await axios.patch(`/api/coordinator-providers/${id}/decide`, { status }, authHeader);
      await loadApplications();
      await loadLogs();
      await loadCoordinators();
      setActionError("");
    } catch (err) {
      setActionError("Something went wrong, please try again");
    }
  }

  async function decideAgent(id: string, status: "approved" | "rejected") {
    try {
      await axios.patch(`/api/agent-providers/${id}/decide`, { status }, authHeader);
      await loadAgentApplications();
      await loadApprovedAgents();
      setActionError("");
    } catch (err) {
      setActionError("Something went wrong, please try again");
    }
  }

  async function restrictAgent(id: string) {
    try {
      await axios.patch(`/api/agent-providers/${id}/restrict`, {}, authHeader);
      await loadAgentApplications();
      await loadApprovedAgents();
      setActionError("");
    } catch (err) {
      setActionError("Could not restrict this agent");
    }
  }

  async function restrictCoordinator(id: string) {
    try {
      await axios.patch(`/api/coordinator-providers/${id}/restrict`, {}, authHeader);
      await loadApplications();
      await loadCoordinators();
      setActionError("");
    } catch (err) {
      setActionError("Could not restrict this coordinator");
    }
  }

  // --- provider reserve ---
  const [reserveData, setReserveData] = useState({ type: "e_cash", amount: "" });
  const [moneyError, setMoneyError] = useState("");

  async function addReserve(e: any) {
    e.preventDefault();
    if (!reserveData.amount || Number(reserveData.amount) <= 0) {
      setMoneyError("Please enter an amount greater than 0");
      return;
    }

    try {
      await axios.post(
        "/api/wallets/provider-reserve",
        { type: reserveData.type, amount: Number(reserveData.amount) },
        authHeader,
      );
      await loadLogs();
      setReserveData({ type: "e_cash", amount: "" });
      setMoneyError("");
    } catch (err) {
      setMoneyError("Could not add this reserve");
    }
  }

  async function decideSupplyRequest(id: string, action: "fulfill" | "reject") {
    try {
      await axios.patch(`/api/provider-supply-requests/${id}/${action}`, {}, authHeader);
      await loadLogs();
      await loadSupplyRequests();
      setMoneyError("");
    } catch (err) {
      setMoneyError(action === "fulfill" ? "Could not fulfill this request. Check your reserve balance." : "Could not reject this request.");
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

  return (
    <div className="flex flex-col gap-8">
      <div className="rounded-lg bg-blue-900/30 p-4 text-blue-200">
        You are managing <b>{providerName}</b>.
      </div>

      <div className="grid grid-cols-1 gap-px overflow-hidden rounded-lg bg-gray-700 shadow sm:grid-cols-3 lg:grid-cols-6">
        <div className="bg-gray-800 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Coordinator join requests</span>
            <UserGroupIcon className="h-6 w-6 text-blue-400" />
          </div>
          <div className="mt-1 text-2xl font-bold text-gray-100">{applications.length}</div>
        </div>
        <div className="bg-gray-800 p-4">
          <span className="text-xs text-gray-400">Agent join requests</span>
          <div className="mt-1 text-2xl font-bold text-gray-100">{agentApplications.length}</div>
        </div>
        <div className="bg-gray-800 p-4">
          <span className="text-xs text-gray-400">Open liquidity requests</span>
          <div className="mt-1 text-2xl font-bold text-gray-100">
            {requests.filter((request) => request.status === "pending" || request.status === "accepted").length}
          </div>
        </div>
        <div className="bg-gray-800 p-4">
          <span className="text-xs text-gray-400">Completed swaps</span>
          <div className="mt-1 text-2xl font-bold text-gray-100">{transactions.length}</div>
        </div>
        <div className="bg-gray-800 p-4">
          <span className="text-xs text-gray-400">Today's cash in</span>
          <div className="mt-1 text-2xl font-bold text-gray-100">৳{dailySummary.cashIn}</div>
        </div>
        <div className="bg-gray-800 p-4">
          <span className="text-xs text-gray-400">Today's cash out</span>
          <div className="mt-1 text-2xl font-bold text-gray-100">৳{dailySummary.cashOut}</div>
        </div>
      </div>

      <TitleCard title="Provider reserve balances">
        <p className="-mt-2 mb-3 text-sm text-gray-400">
          Available liquidity held by {providerName} for its network.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-lg bg-gray-900 p-4 shadow">
            <span className="text-xs text-gray-400">Physical cash reserve</span>
            <div className="mt-1 text-2xl font-bold text-gray-100">৳{balances.cash}</div>
          </div>
          <div className="rounded-lg bg-gray-900 p-4 shadow">
            <span className="text-xs text-gray-400">E-cash reserve</span>
            <div className="mt-1 text-2xl font-bold text-gray-100">৳{balances.ecash}</div>
          </div>
        </div>
      </TitleCard>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <TitleCard title="Add provider reserve">
          <p className="text-sm text-gray-400">
            Record cash or e-cash received from your external bank, vault, or MFS account.
          </p>
          <form onSubmit={addReserve} className="mt-2 flex flex-col gap-3">
            <select
              value={reserveData.type}
              onChange={(e) => setReserveData({ ...reserveData, type: e.target.value })}
              className={inputClass}
            >
              <option value="e_cash">E-cash</option>
              <option value="physical_cash">Physical cash</option>
            </select>
            <input
              type="number"
              value={reserveData.amount}
              onChange={(e) => setReserveData({ ...reserveData, amount: e.target.value })}
              placeholder="50000"
              className={inputClass}
            />
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Add reserve
            </button>
          </form>
        </TitleCard>

        <TitleCard title="Coordinator funding requests">
          <p className="text-sm text-gray-400">
            Coordinators request what they need; fulfill the request from your reserve.
          </p>
          {supplyRequests.length === 0 ? (
            <p className="mt-3 text-gray-400">No funding requests waiting.</p>
          ) : (
            <div className="mt-3 flex flex-col gap-2">
              {supplyRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-gray-700 px-3 py-2"
                >
                  <div>
                    <p className="font-medium text-gray-100">{request.coordinator.fullName}</p>
                    <p className="text-sm text-gray-400">
                      Needs ৳{request.amount} {request.type === "physical_cash" ? "physical cash" : "e-cash"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => decideSupplyRequest(request.id, "fulfill")}
                      className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700"
                    >
                      Fulfill
                    </button>
                    <button
                      onClick={() => decideSupplyRequest(request.id, "reject")}
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

      {moneyError && <p className="text-sm text-red-400">{moneyError}</p>}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <TitleCard title="Approved agents">
          {approvedAgents.length === 0 ? (
            <p className="text-gray-400">No approved agents yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {approvedAgents.map((application) => (
                <div
                  key={application.id}
                  className="flex items-center justify-between rounded-lg border border-gray-700 px-3 py-2"
                >
                  <span className="text-gray-100">{application.agent.fullName}</span>
                  <button
                    onClick={() => restrictAgent(application.id)}
                    className="rounded-md bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-600"
                  >
                    Restrict
                  </button>
                </div>
              ))}
            </div>
          )}
        </TitleCard>

        <TitleCard title="Approved coordinators">
          {coordinators.length === 0 ? (
            <p className="text-gray-400">No approved coordinators yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {coordinators.map((application) => (
                <div
                  key={application.id}
                  className="flex items-center justify-between rounded-lg border border-gray-700 px-3 py-2"
                >
                  <span className="text-gray-100">{application.coordinator.fullName}</span>
                  <button
                    onClick={() => restrictCoordinator(application.id)}
                    className="rounded-md bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-600"
                  >
                    Restrict
                  </button>
                </div>
              ))}
            </div>
          )}
        </TitleCard>
      </div>

      <TitleCard title="Agent join requests">
        {agentApplications.length === 0 ? (
          <p className="text-gray-400">Nothing waiting for a decision.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {agentApplications.map((application) => (
              <div
                key={application.id}
                className="flex items-center justify-between rounded-lg border border-gray-700 bg-gray-800 px-4 py-3"
              >
                <div>
                  <p className="font-medium text-gray-100">{application.agent.fullName}</p>
                  <p className="text-xs text-gray-500">
                    Applied {new Date(application.appliedAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => decideAgent(application.id, "approved")}
                    className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => decideAgent(application.id, "rejected")}
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

      <TitleCard title="Provider reserve and supply history">
        {reserveHistory.length === 0 ? (
          <p className="text-gray-400">No reserve top-up or coordinator supply yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-700 bg-gray-800">
            <table className="w-full text-left text-sm">
              <thead>
                <tr>
                  <th className="border-b border-gray-700 px-4 py-2 font-medium text-gray-400">Date</th>
                  <th className="border-b border-gray-700 px-4 py-2 font-medium text-gray-400">Activity</th>
                  <th className="border-b border-gray-700 px-4 py-2 font-medium text-gray-400">Coordinator</th>
                  <th className="border-b border-gray-700 px-4 py-2 font-medium text-gray-400">Amount</th>
                </tr>
              </thead>
              <tbody>
                {reserveHistory.map((transaction) => (
                  <tr key={transaction.id} className="odd:bg-gray-800 even:bg-gray-900/40">
                    <td className="border-b border-gray-700 px-4 py-2">
                      {new Date(transaction.createdAt).toLocaleString()}
                    </td>
                    <td className="border-b border-gray-700 px-4 py-2">
                      {transaction.type === "provider_top_up" ? "Reserve top-up" : "Coordinator supply"}
                    </td>
                    <td className="border-b border-gray-700 px-4 py-2">{transaction.coordinator?.fullName || "-"}</td>
                    <td className="border-b border-gray-700 px-4 py-2">৳{transaction.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </TitleCard>

      <TitleCard title="Coordinator join requests">
        {applications.length === 0 ? (
          <p className="text-gray-400">Nothing waiting for a decision.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {applications.map((app) => (
              <div
                key={app.id}
                className="flex items-center justify-between rounded-lg border border-gray-700 bg-gray-800 px-4 py-3"
              >
                <div>
                  <p className="font-medium text-gray-100">{app.coordinator.fullName}</p>
                  <p className="text-sm text-gray-400">
                    wants to become a coordinator for {app.provider.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    Applied {new Date(app.appliedAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDecide(app.id, "approved")}
                    className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleDecide(app.id, "rejected")}
                    className="rounded-md px-3 py-1.5 text-xs font-semibold text-gray-300 hover:bg-gray-700"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {actionError && <p className="mt-1 text-sm text-red-400">{actionError}</p>}
      </TitleCard>

      <TitleCard title="Liquidity request history">
        {requests.length === 0 ? (
          <p className="text-gray-400">No liquidity requests yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-700 bg-gray-800">
            <table className="w-full text-left text-sm">
              <thead>
                <tr>
                  <th className="border-b border-gray-700 px-4 py-2 font-medium text-gray-400">Agent</th>
                  <th className="border-b border-gray-700 px-4 py-2 font-medium text-gray-400">Need</th>
                  <th className="border-b border-gray-700 px-4 py-2 font-medium text-gray-400">Amount</th>
                  <th className="border-b border-gray-700 px-4 py-2 font-medium text-gray-400">Coordinator</th>
                  <th className="border-b border-gray-700 px-4 py-2 font-medium text-gray-400">Status</th>
                  <th className="border-b border-gray-700 px-4 py-2 font-medium text-gray-400">Requested</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request.id} className="odd:bg-gray-800 even:bg-gray-900/40">
                    <td className="border-b border-gray-700 px-4 py-2">{request.agent.fullName}</td>
                    <td className="border-b border-gray-700 px-4 py-2">
                      {request.type === "physical_cash" ? "Physical cash" : "E-cash"}
                    </td>
                    <td className="border-b border-gray-700 px-4 py-2">৳{request.amount}</td>
                    <td className="border-b border-gray-700 px-4 py-2">{request.coordinator?.fullName || "Not assigned"}</td>
                    <td className="border-b border-gray-700 px-4 py-2">
                      <span className="inline-flex items-center rounded-full border border-gray-600 px-2.5 py-0.5 text-xs font-medium capitalize text-gray-300">
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

      <TitleCard title="Completed liquidity swaps">
        {transactions.length === 0 ? (
          <p className="text-gray-400">No completed swaps yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-700 bg-gray-800">
            <table className="w-full text-left text-sm">
              <thead>
                <tr>
                  <th className="border-b border-gray-700 px-4 py-2 font-medium text-gray-400">Agent</th>
                  <th className="border-b border-gray-700 px-4 py-2 font-medium text-gray-400">Coordinator</th>
                  <th className="border-b border-gray-700 px-4 py-2 font-medium text-gray-400">Amount</th>
                  <th className="border-b border-gray-700 px-4 py-2 font-medium text-gray-400">Completed</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="odd:bg-gray-800 even:bg-gray-900/40">
                    <td className="border-b border-gray-700 px-4 py-2">{transaction.agent.fullName}</td>
                    <td className="border-b border-gray-700 px-4 py-2">{transaction.coordinator?.fullName || "-"}</td>
                    <td className="border-b border-gray-700 px-4 py-2">৳{transaction.amount}</td>
                    <td className="border-b border-gray-700 px-4 py-2">
                      {new Date(transaction.createdAt).toLocaleString()}
                    </td>
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
