"use client";

import { useEffect, useState } from "react";
import { mockAdminPendingUsers } from "@/lib/mock-data";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [pendingUsers, setPendingUsers] = useState(mockAdminPendingUsers);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // Approving just removes the person from the "pending" list on screen.
  function approveUser(id: string) {
    setPendingUsers((current) => current.filter((user) => user.id !== id));
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
        <h2 className="text-lg font-semibold mb-3">Pending registrations</h2>
        <p className="text-sm text-base-content/60 -mt-2 mb-3">
          Agents, coordinators, and providers all start here — coordinator
          join requests to a specific provider are decided by that
          provider, not by admin.
        </p>
        {pendingUsers.length === 0 ? (
          <p className="text-base-content/60">Nothing waiting for approval.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {pendingUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between bg-base-100 border border-base-300 px-4 py-3 rounded-box"
              >
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-base-content/60 capitalize">{user.role}</p>
                </div>
                <button onClick={() => approveUser(user.id)} className="btn btn-success btn-sm">
                  Approve
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
