"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import BanknotesIcon from "@heroicons/react/24/outline/BanknotesIcon";
import WalletIcon from "@heroicons/react/24/outline/WalletIcon";
import TitleCard from "@/components/title-card";

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
        <span className="loading loading-spinner loading-lg" />
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

  // Just picks a daisyUI badge color to match the status word, so
  // its easier to scan a long list at a glance.
  function statusBadgeClass(status: string) {
    if (status === "pending") return "badge-warning";
    if (status === "accepted") return "badge-info";
    if (status === "fulfilled") return "badge-success";
    if (status === "rejected") return "badge-error";
    return "badge-outline";
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="stats shadow w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <div className="stat">
          <div className="stat-figure text-primary">
            <BanknotesIcon className="h-8 w-8" />
          </div>
          <div className="stat-title">Cash drawer</div>
          <div className="stat-value">৳{drawerBalance}</div>
          <div className="stat-desc">Physical cash on hand</div>
        </div>
        <div className="stat">
          <div className="stat-figure text-primary">
            <WalletIcon className="h-8 w-8" />
          </div>
          <div className="stat-title">Total e-cash</div>
          <div className="stat-value">৳{totalEcash}</div>
          <div className="stat-desc">Across all wallets</div>
        </div>
        <div className="stat">
          <div className="stat-title">Pending requests</div>
          <div className="stat-value">{pendingCount}</div>
        </div>
        <div className="stat">
          <div className="stat-title">Fulfilled requests</div>
          <div className="stat-value">{fulfilledCount}</div>
        </div>
      </div>

      <TitleCard title="E-cash wallets">
        {wallets.length === 0 ? (
          <p className="text-base-content/60">
            No e-cash yet — ask a coordinator to send some using the form below.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {wallets.map((wallet) => (
              <div key={wallet.id} className="stats shadow">
                <div className="stat">
                  <div className="stat-figure text-primary">
                    <WalletIcon className="h-8 w-8" />
                  </div>
                  <div className="stat-title">{wallet.provider.name}</div>
                  <div className="stat-value">৳{wallet.balance}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </TitleCard>

      <TitleCard title="My provider applications">
        <p className="text-sm text-base-content/60 -mt-2 mb-3">
          Apply to a provider first. You can request and transact only with providers that approve you.
        </p>
        <form onSubmit={applyToProvider} className="flex flex-col sm:flex-row gap-3 items-start">
          <select
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value)}
            className="select w-full sm:w-64"
          >
            <option value="">Pick a provider</option>
            {allProviders.map((provider) => (
              <option key={provider.id} value={provider.id}>{provider.name}</option>
            ))}
          </select>
          <button type="submit" className="btn btn-primary">Apply</button>
        </form>
        {providerError && <p className="text-error text-sm mt-2">{providerError}</p>}
        {providerApplications.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {providerApplications.map((application) => (
              <span key={application.id} className="badge badge-lg gap-2">
                {application.provider.name}
                <span className="opacity-60 capitalize">({application.status})</span>
              </span>
            ))}
          </div>
        )}
      </TitleCard>

      <TitleCard title="Cash in / Cash out">
        <div>
          <p className="text-sm text-base-content/60">
            Cash-in moves money from e-cash into your drawer. Cash-out
            moves it back the other way.
          </p>

          <form onSubmit={handleMoveSubmit} className="flex flex-col sm:flex-row gap-3 mt-2 items-start">
            <fieldset className="fieldset w-full sm:w-36">
              <label className="label">Type</label>
              <select
                name="type"
                value={moveData.type}
                onChange={handleMoveChange}
                className="select w-full"
              >
                <option value="cash-in">Cash in</option>
                <option value="cash-out">Cash out</option>
              </select>
            </fieldset>

            <fieldset className="fieldset w-full sm:w-40">
              <label className="label">Provider</label>
              <select
                name="providerId"
                value={moveData.providerId}
                onChange={handleMoveChange}
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

            <fieldset className="fieldset w-full sm:w-40">
              <label className="label">Amount</label>
              <input
                type="number"
                name="amount"
                value={moveData.amount}
                onChange={handleMoveChange}
                placeholder="1000"
                className="input w-full"
              />
            </fieldset>

            <button type="submit" className="btn btn-primary sm:mt-6">
              Confirm
            </button>
          </form>

          {moveError && <p className="text-error text-sm mt-1">{moveError}</p>}
        </div>
      </TitleCard>

      <TitleCard title="Request liquidity">
        <div>
          <p className="text-sm text-base-content/60">
            Choose whether you need e-cash or physical cash.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 mt-2 items-start">
            <fieldset className="fieldset w-full sm:w-40">
              <label className="label">I need</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="select w-full"
              >
                <option value="e_cash">E-cash</option>
                <option value="physical_cash">Physical cash</option>
              </select>
            </fieldset>

            <fieldset className="fieldset w-full sm:w-40">
              <label className="label">Provider</label>
              <select
                name="providerId"
                value={formData.providerId}
                onChange={handleChange}
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

            <fieldset className="fieldset w-full sm:w-40">
              <label className="label">Amount</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="5000"
                className="input w-full"
              />
            </fieldset>

            <button type="submit" className="btn btn-primary sm:mt-6">
              Send request
            </button>
          </form>

          {error && <p className="text-error text-sm mt-1">{error}</p>}
        </div>
      </TitleCard>

      <TitleCard title="My liquidity requests">
        {requests.length === 0 ? (
          <p className="text-base-content/60">You haven't asked for e-cash yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-box border border-base-300 bg-base-100">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>Provider</th>
                  <th>Amount</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th></th>
                  <th>Requested</th>
                  <th>Fulfilled</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.id}>
                    <td>{req.provider.name}</td>
                    <td>৳{req.amount}</td>
                    <td>{req.type === "physical_cash" ? "Physical cash" : "E-cash"}</td>
                  <td>
                    <span className={`badge ${statusBadgeClass(req.status)} capitalize`}>
                      {req.status}
                    </span>
                  </td>
                  <td>
                    {req.status === "pending" && (
                      <button
                        onClick={() => cancelRequest(req.id)}
                        className="btn btn-ghost btn-error btn-sm"
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                    <td>{new Date(req.requestedAt).toLocaleString()}</td>
                    <td>{req.fulfilledAt ? new Date(req.fulfilledAt).toLocaleString() : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </TitleCard>

      <TitleCard title="Transaction history">
        {transactions.length === 0 ? (
          <p className="text-base-content/60">No cash-in/cash-out yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-box border border-base-300 bg-base-100">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Provider</th>
                  <th>Amount</th>
                  <th>Drawer after</th>
                  <th>Wallet after</th>
                </tr>
              </thead>
              <tbody>
                {[...transactions].reverse().map((tx) => (
                  <tr key={tx.id}>
                    <td>{new Date(tx.createdAt).toLocaleString()}</td>
                    <td>
                      <span
                        className={
                          "badge capitalize " +
                          (tx.type === "cash_in" ? "badge-success" : "badge-warning")
                        }
                      >
                        {tx.type === "cash_in" ? "Cash in" : "Cash out"}
                      </span>
                    </td>
                    <td>{tx.provider.name}</td>
                    <td>৳{tx.amount}</td>
                    <td>৳{tx.drawerBalanceAfter}</td>
                    <td>৳{tx.walletBalanceAfter}</td>
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
