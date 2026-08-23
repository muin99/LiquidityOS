"use client";

import { useEffect, useState } from "react";
import {
  mockCoordinatorRequests,
  mockCoordinatorApplications,
} from "@/lib/mock-data";

export default function CoordinatorDashboard() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState(mockCoordinatorRequests);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // Pretend to fulfill a request: mark it as "fulfilled" right here in
  // the browser. Nothing is saved anywhere, so refreshing resets it.
  function handleFulfill(id: string) {
    setRequests((current) =>
      current.map((req) =>
        req.id === id ? { ...req, status: "fulfilled" } : req,
      ),
    );
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
      <div>
        <h2 className="text-lg font-semibold mb-3">
          E-cash requests from agents
        </h2>
        <div className="overflow-x-auto rounded-box border border-base-300 bg-base-100">
          <table className="table">
            <thead>
              <tr>
                <th>Agent</th>
                <th>Provider</th>
                <th>Amount</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.id}>
                  <td>{req.agent}</td>
                  <td>{req.provider}</td>
                  <td>৳{req.amount}</td>
                  <td>
                    <span className="badge badge-outline capitalize">
                      {req.status}
                    </span>
                  </td>
                  <td>
                    {req.status === "pending" && (
                      <button
                        onClick={() => handleFulfill(req.id)}
                        className="btn btn-primary btn-sm"
                      >
                        Fulfill
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">My provider applications</h2>
        <div className="flex flex-wrap gap-3">
          {mockCoordinatorApplications.map((app) => (
            <div key={app.id} className="badge badge-lg gap-2">
              {app.provider}
              <span className="opacity-60 capitalize">({app.status})</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
