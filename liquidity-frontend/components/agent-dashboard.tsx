"use client";

import { useEffect, useState } from "react";
import { mockAgentDrawer, mockAgentWallets, mockAgentRequests } from "@/lib/mock-data";

export default function AgentDashboard() {
  // We pretend to "load" the agent's data, just like a real API call would.
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

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
              {mockAgentRequests.map((req) => (
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
