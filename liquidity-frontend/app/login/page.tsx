"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginSchema } from "@/lib/validation";
import { mockProviders } from "@/lib/mock-data";

export default function LoginPage() {
  const router = useRouter();

  // One object holds every field on the form, same as formData in class.
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "agent",
    provider: mockProviders[0], // only used when role is "provider"
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

    // Ask zod: "does this data follow the rules?"
    const result = loginSchema.safeParse(formData);

    if (!result.success) {
      // Just show the first problem it found.
      setError(result.error.issues[0].message);
      return;
    }

    setError("");

    // There is no backend here yet, so we just pretend the login worked
    // and send the user to the dashboard for the role they picked.
    // A provider also needs to say WHICH provider they are, so that
    // gets tacked on as a query param.
    if (formData.role === "provider") {
      router.push(`/dashboard/provider?provider=${formData.provider}`);
    } else {
      router.push(`/dashboard/${formData.role}`);
    }
  }

  return (
    <main className="flex-1 flex items-center justify-center bg-base-200 px-4 py-16">
      <div className="card w-full max-w-sm bg-base-100 shadow-xl">
        <div className="card-body">
          <h1 className="card-title">Log in</h1>
          <p className="text-sm text-base-content/60">
            Demo mode — no real account needed, just pick a role.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3 mt-2">
            <fieldset className="fieldset">
              <label className="label">Email</label>
              <input
                type="text"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="input w-full"
              />
            </fieldset>

            <fieldset className="fieldset">
              <label className="label">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="input w-full"
              />
            </fieldset>

            <fieldset className="fieldset">
              <label className="label">Log in as</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="select w-full"
              >
                <option value="agent">Agent</option>
                <option value="coordinator">Coordinator</option>
                <option value="provider">Provider</option>
                <option value="admin">Admin</option>
              </select>
            </fieldset>

            {formData.role === "provider" && (
              <fieldset className="fieldset">
                <label className="label">Which provider are you</label>
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
            )}

            {error && <p className="text-error text-sm">{error}</p>}

            <button type="submit" className="btn btn-primary mt-2">
              Log in
            </button>
          </form>

          <p className="text-sm text-center mt-4">
            No account yet?{" "}
            <Link href="/register" className="link link-primary">
              Register
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
