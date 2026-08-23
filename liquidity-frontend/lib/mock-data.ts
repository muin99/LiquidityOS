// Fake data so the dashboards have something to show.
// In the real app this would come from the backend API instead.

export const mockAreas = [
  { id: "area-1", name: "Dhaka North" },
  { id: "area-2", name: "Dhaka South" },
  { id: "area-3", name: "Chittagong Port" },
];

export const mockAgentDrawer = { balance: 15250 };

export const mockAgentWallets = [
  { provider: "bKash", balance: 8200 },
  { provider: "Nagad", balance: 4100 },
];

export const mockAgentRequests = [
  { id: "req-1", provider: "bKash", amount: 5000, status: "pending" },
  { id: "req-2", provider: "Rocket", amount: 2000, status: "fulfilled" },
];

export const mockCoordinatorRequests = [
  { id: "req-3", agent: "Karim Ahmed", provider: "bKash", amount: 3000, status: "pending" },
  { id: "req-4", agent: "Fatima Begum", provider: "Nagad", amount: 1500, status: "pending" },
  { id: "req-5", agent: "Rahim Uddin", provider: "bKash", amount: 2200, status: "fulfilled" },
];

export const mockCoordinatorApplications = [
  { id: "app-1", provider: "bKash", status: "approved" },
  { id: "app-2", provider: "Rocket", status: "pending" },
];

export const mockAdminPendingUsers = [
  { id: "user-1", name: "Karim Ahmed", role: "agent" },
  { id: "user-2", name: "Fatima Begum", role: "coordinator" },
  { id: "user-3", name: "Jasim Uddin", role: "agent" },
];

export const mockAdminPendingApplications = [
  { id: "app-3", coordinator: "Rahim Uddin", provider: "Nagad" },
];
