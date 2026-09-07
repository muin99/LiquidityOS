"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import UserGroupIcon from "@heroicons/react/24/outline/UserGroupIcon";
import TitleCard from "@/components/title-card";

export default function ProviderDashboard() {
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
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

  async function loadLogs() {
    const [requestsResponse, transactionsResponse, balancesResponse, summaryResponse] = await Promise.all([
      axios.get("/api/ecash-requests/provider-history", authHeader),
      axios.get("/api/wallets/provider-transactions", authHeader),
      axios.get("/api/wallets/provider-balances", authHeader),
      axios.get("/api/wallets/provider-daily-summary", authHeader),
    ]);
    setRequests(requestsResponse.data);
    setTransactions(transactionsResponse.data);
    setBalances(balancesResponse.data);
    setDailySummary(summaryResponse.data);
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
      await loadLogs();
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

  // --- provider reserve and coordinator supply ---
  const [reserveData, setReserveData] = useState({ type: "e_cash", amount: "" });
  const [supplyData, setSupplyData] = useState({
    coordinatorId: "",
    type: "e_cash",
    amount: "",
  });
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

  async function supplyCoordinator(e: any) {
    e.preventDefault();
    if (!supplyData.coordinatorId || !supplyData.amount || Number(supplyData.amount) <= 0) {
      setMoneyError("Please pick a coordinator and enter an amount");
      return;
    }

    try {
      await axios.post(
        "/api/wallets/provider-supply",
        { ...supplyData, amount: Number(supplyData.amount) },
        authHeader,
      );
      await loadLogs();
      setSupplyData({ coordinatorId: "", type: "e_cash", amount: "" });
      setMoneyError("");
    } catch (err) {
      setMoneyError("Could not supply this coordinator. Check your reserve balance.");
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
      <div className="alert">
        <span>
          You are managing <b>{providerName}</b>.
        </span>
      </div>

      <div className="stats shadow w-full">
        <div className="stat">
          <div className="stat-figure text-primary">
            <UserGroupIcon className="h-8 w-8" />
          </div>
          <div className="stat-title">Coordinator join requests</div>
          <div className="stat-value">{applications.length}</div>
        </div>
        <div className="stat">
          <div className="stat-title">Open liquidity requests</div>
          <div className="stat-value">
            {requests.filter((request) => request.status === "pending" || request.status === "accepted").length}
          </div>
        </div>
        <div className="stat">
          <div className="stat-title">Completed swaps</div>
          <div className="stat-value">{transactions.length}</div>
        </div>
        <div className="stat">
          <div className="stat-title">Today's cash in</div>
          <div className="stat-value">৳{dailySummary.cashIn}</div>
        </div>
        <div className="stat">
          <div className="stat-title">Today's cash out</div>
          <div className="stat-value">৳{dailySummary.cashOut}</div>
        </div>
      </div>

      <TitleCard title="Provider reserve balances">
        <p className="text-sm text-base-content/60 -mt-2 mb-3">
          Available liquidity held by {providerName} for its network.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="stats shadow">
            <div className="stat">
              <div className="stat-title">Physical cash reserve</div>
              <div className="stat-value">৳{balances.cash}</div>
            </div>
          </div>
          <div className="stats shadow">
            <div className="stat">
              <div className="stat-title">E-cash reserve</div>
              <div className="stat-value">৳{balances.ecash}</div>
            </div>
          </div>
        </div>
      </TitleCard>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <TitleCard title="Add provider reserve">
          <p className="text-sm text-base-content/60">
            Record cash or e-cash received from your external bank, vault, or MFS account.
          </p>
          <form onSubmit={addReserve} className="flex flex-col gap-3 mt-2">
            <select
              value={reserveData.type}
              onChange={(e) => setReserveData({ ...reserveData, type: e.target.value })}
              className="select w-full"
            >
              <option value="e_cash">E-cash</option>
              <option value="physical_cash">Physical cash</option>
            </select>
            <input
              type="number"
              value={reserveData.amount}
              onChange={(e) => setReserveData({ ...reserveData, amount: e.target.value })}
              placeholder="50000"
              className="input w-full"
            />
            <button type="submit" className="btn btn-primary">Add reserve</button>
          </form>
        </TitleCard>

        <TitleCard title="Supply a coordinator">
          <p className="text-sm text-base-content/60">
            Move one type of liquidity from your reserve to an approved coordinator.
          </p>
          <form onSubmit={supplyCoordinator} className="flex flex-col gap-3 mt-2">
            <select
              value={supplyData.coordinatorId}
              onChange={(e) => setSupplyData({ ...supplyData, coordinatorId: e.target.value })}
              className="select w-full"
            >
              <option value="">Pick an approved coordinator</option>
              {coordinators.map((item) => (
                <option key={item.id} value={item.coordinatorId}>
                  {item.coordinator.fullName}
                </option>
              ))}
            </select>
            <select
              value={supplyData.type}
              onChange={(e) => setSupplyData({ ...supplyData, type: e.target.value })}
              className="select w-full"
            >
              <option value="e_cash">E-cash</option>
              <option value="physical_cash">Physical cash</option>
            </select>
            <input
              type="number"
              value={supplyData.amount}
              onChange={(e) => setSupplyData({ ...supplyData, amount: e.target.value })}
              placeholder="10000"
              className="input w-full"
            />
            <button type="submit" className="btn btn-primary">Supply coordinator</button>
          </form>
        </TitleCard>
      </div>

      {moneyError && <p className="text-error text-sm">{moneyError}</p>}

      <TitleCard title="Coordinator join requests">
        {applications.length === 0 ? (
          <p className="text-base-content/60">Nothing waiting for a decision.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {applications.map((app) => (
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
                    onClick={() => handleDecide(app.id, "approved")}
                    className="btn btn-success btn-sm"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleDecide(app.id, "rejected")}
                    className="btn btn-ghost btn-sm"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {actionError && <p className="text-error text-sm mt-1">{actionError}</p>}
      </TitleCard>

      <TitleCard title="Liquidity request history">
        {requests.length === 0 ? (
          <p className="text-base-content/60">No liquidity requests yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-box border border-base-300 bg-base-100">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>Agent</th>
                  <th>Need</th>
                  <th>Amount</th>
                  <th>Coordinator</th>
                  <th>Status</th>
                  <th>Requested</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request.id}>
                    <td>{request.agent.fullName}</td>
                    <td>{request.type === "physical_cash" ? "Physical cash" : "E-cash"}</td>
                    <td>৳{request.amount}</td>
                    <td>{request.coordinator?.fullName || "Not assigned"}</td>
                    <td>
                      <span className="badge badge-outline capitalize">
                        {request.status}
                      </span>
                    </td>
                    <td>{new Date(request.requestedAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </TitleCard>

      <TitleCard title="Completed liquidity swaps">
        {transactions.length === 0 ? (
          <p className="text-base-content/60">No completed swaps yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-box border border-base-300 bg-base-100">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>Agent</th>
                  <th>Coordinator</th>
                  <th>Amount</th>
                  <th>Completed</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>{transaction.agent.fullName}</td>
                    <td>{transaction.coordinator?.fullName || "-"}</td>
                    <td>৳{transaction.amount}</td>
                    <td>{new Date(transaction.createdAt).toLocaleString()}</td>
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
