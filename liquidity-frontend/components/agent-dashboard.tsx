"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function AgentDashboard() {
  const [loading, setLoading] = useState(true);

  // Real data from the backend now, not fake mock data.
  const [drawerBalance, setDrawerBalance] = useState(0);
  const [wallets, setWallets] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);

  // Go ask the backend "what does my stuff look like right now" and
  // put the answer into state. We call this again after every
  // cash-in / cash-out / request, so the numbers on screen stay fresh.
  function loadWallets() {
    return api.get("/wallets/me").then((response) => {
      setDrawerBalance(Number(response.data.cashDrawer.balance));
      setWallets(response.data.ecashWallets);
    });
  }

  function loadRequests() {
    return api.get("/ecash-requests/mine").then((response) => {
      setRequests(response.data);
    });
  }

  useEffect(() => {
    Promise.all([
      loadWallets(),
      loadRequests(),
      api.get("/providers").then((response) => setProviders(response.data)),
    ]).then(() => {
      setLoading(false);
    });
  }, []);

  // --- cash-in / cash-out form ---
  const [moveData, setMoveData] = useState({
    type: "cash-in",
    providerId: "",
    amount: "",
  });
  const [moveError, setMoveError] = useState("");
  const [moveSubmitting, setMoveSubmitting] = useState(false);

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

    setMoveError("");
    setMoveSubmitting(true);

    try {
      // moveData.type is either "cash-in" or "cash-out", which
      // happen to also be the names of the two backend routes.
      await api.post(`/wallets/${moveData.type}`, {
        providerId: moveData.providerId,
        amount,
      });

      await loadWallets();
      setMoveData({ ...moveData, amount: "" });
    } catch (err: any) {
      const backendMessage = err.response && err.response.data && err.response.data.message;
      setMoveError(backendMessage || "Something went wrong, please try again");
    }

    setMoveSubmitting(false);
  }

  // --- e-cash request form ---
  const [formData, setFormData] = useState({
    providerId: "",
    amount: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

    setError("");
    setSubmitting(true);

    try {
      await api.post("/ecash-requests", {
        providerId: formData.providerId,
        amount: Number(formData.amount),
      });

      await loadRequests();
      setFormData({ providerId: "", amount: "" });
    } catch (err: any) {
      const backendMessage = err.response && err.response.data && err.response.data.message;
      setError(backendMessage || "Something went wrong, please try again");
    }

    setSubmitting(false);
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
          <div className="stat-title">Cash drawer</div>
          <div className="stat-value">৳{drawerBalance}</div>
          <div className="stat-desc">Physical cash on hand</div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">E-cash wallets</h2>
        {wallets.length === 0 ? (
          <p className="text-base-content/60">
            No e-cash yet — ask a coordinator to send some using the form below.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {wallets.map((wallet) => (
              <div key={wallet.id} className="card bg-base-100 shadow">
                <div className="card-body">
                  <h3 className="card-title text-base">{wallet.provider.name}</h3>
                  <p className="text-2xl font-bold">৳{wallet.balance}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <h2 className="card-title text-lg">Cash in / Cash out</h2>
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

            <button type="submit" disabled={moveSubmitting} className="btn btn-primary sm:mt-6">
              Confirm
            </button>
          </form>

          {moveError && <p className="text-error text-sm mt-1">{moveError}</p>}
        </div>
      </div>

      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <h2 className="card-title text-lg">Request e-cash</h2>
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

            <button type="submit" disabled={submitting} className="btn btn-primary sm:mt-6">
              Send request
            </button>
          </form>

          {error && <p className="text-error text-sm mt-1">{error}</p>}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">My e-cash requests</h2>
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
      </div>
    </div>
  );
}
