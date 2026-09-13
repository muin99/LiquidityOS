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

  useEffect(() => {
    async function loadEverything() {
      await loadWallets();
      await loadRequests();

      const providersResponse = await axios.get("/api/providers");
      setProviders(providersResponse.data);

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
        { providerId: formData.providerId, amount: Number(formData.amount) },
        authHeader,
      );

      await loadRequests();
      setError("");
      setFormData({ providerId: "", amount: "" });
    } catch (err) {
      setError("Something went wrong, please try again");
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
            <BanknotesIcon className="h-8 w-8" />
          </div>
          <div className="stat-title">Cash drawer</div>
          <div className="stat-value">৳{drawerBalance}</div>
          <div className="stat-desc">Physical cash on hand</div>
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

      <TitleCard title="Request e-cash">
        <div>
          <p className="text-sm text-base-content/60">
            Running low on a wallet? Ask a coordinator to top it up.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 mt-2 items-start">
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

      <TitleCard title="My e-cash requests">
        <div className="overflow-x-auto rounded-box border border-base-300 bg-base-100">
          <table className="table">
            <thead>
              <tr>
                <th>Provider</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.id}>
                  <td>{req.provider.name}</td>
                  <td>৳{req.amount}</td>
                  <td>
                    <span className="badge badge-outline capitalize">{req.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TitleCard>
    </div>
  );
}
