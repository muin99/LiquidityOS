"use client";

import { useEffect, useState } from "react";
import { mockAgentDrawer, mockAgentWallets, mockAgentRequests, mockProviders } from "@/lib/mock-data";

export default function AgentDashboard() {
  // We pretend to "load" the agent's data, just like a real API call would.
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // The request list now lives in state, so a new request can be added to it.
  const [requests, setRequests] = useState(mockAgentRequests);

  const [formData, setFormData] = useState({
    provider: mockProviders[0],
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

  function handleSubmit(e: any) {
    e.preventDefault();

    // Very basic check — no zod here, just a plain if.
    if (!formData.amount || Number(formData.amount) <= 0) {
      setError("Please enter an amount greater than 0");
      return;
    }

    const newRequest = {
      id: `req-${Date.now()}`,
      provider: formData.provider,
      amount: Number(formData.amount),
      status: "pending",
    };

    // Add the new request to the top of the list, right on this screen.
    // There is no backend yet, so refreshing the page resets this.
    setRequests([newRequest, ...requests]);
    setFormData({ provider: mockProviders[0], amount: "" });
    setError("");
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
          <div className="stat-value">৳{mockAgentDrawer.balance}</div>
          <div className="stat-desc">Physical cash on hand</div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">E-cash wallets</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {mockAgentWallets.map((wallet) => (
            <div key={wallet.provider} className="card bg-base-100 shadow">
              <div className="card-body">
                <h3 className="card-title text-base">{wallet.provider}</h3>
                <p className="text-2xl font-bold">৳{wallet.balance}</p>
              </div>
            </div>
          ))}
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
                name="provider"
                value={formData.provider}
                onChange={handleChange}
                className="select w-full"
              >
                {mockProviders.map((provider) => (
                  <option key={provider} value={provider}>
                    {provider}
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
                  <td>{req.provider}</td>
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
