"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerSchema } from "@/lib/validation";
import { mockAreas } from "@/lib/mock-data";

export default function RegisterPage() {
  const router = useRouter();

  // One object holds every field on the form, same as formData in class.
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "agent",
    areaId: "",
  });

  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // After a successful registration, wait a bit and then send the
  // user to the login page — like a little "redirecting..." moment.
  useEffect(() => {
    if (!submitted) return;

    const timer = setTimeout(() => {
      router.push("/login");
    }, 2000);

    // Cleanup: if this page closes before the timer finishes, cancel it.
    return () => clearTimeout(timer);
  }, [submitted, router]);

  function handleChange(e: any) {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  }

  function handleSubmit(e: any) {
    e.preventDefault();

    // Check the passwords match ourselves before even asking zod.
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Ask zod: "does this data follow the rules?"
    const result = registerSchema.safeParse(formData);

    if (!result.success) {
      // Just show the first problem it found.
      setError(result.error.issues[0].message);
      return;
    }

    // No backend yet — just show a success message and redirect.
    setError("");
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <main className="flex-1 flex items-center justify-center bg-base-200 px-4 py-16">
        <div className="alert alert-success max-w-sm">
          <span>Registered! Redirecting you to the login page…</span>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 flex items-center justify-center bg-base-200 px-4 py-16">
      <div className="card w-full max-w-sm bg-base-100 shadow-xl">
        <div className="card-body">
          <h1 className="card-title">Create an account</h1>
          <p className="text-sm text-base-content/60">
            Sign up as an agent or a coordinator.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3 mt-2">
            <fieldset className="fieldset">
              <label className="label">Full name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="input w-full"
                placeholder="Karim Ahmed"
              />
            </fieldset>

            <fieldset className="fieldset">
              <label className="label">Email</label>
              <input
                type="text"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input w-full"
                placeholder="you@example.com"
              />
            </fieldset>

            <fieldset className="fieldset">
              <label className="label">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input w-full"
                placeholder="••••••••"
              />
            </fieldset>

            <fieldset className="fieldset">
              <label className="label">Confirm password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="input w-full"
                placeholder="••••••••"
              />
            </fieldset>

            <fieldset className="fieldset">
              <label className="label">I am a</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="select w-full"
              >
                <option value="agent">Agent</option>
                <option value="coordinator">Coordinator</option>
              </select>
            </fieldset>

            <fieldset className="fieldset">
              <label className="label">Area</label>
              <select
                name="areaId"
                value={formData.areaId}
                onChange={handleChange}
                className="select w-full"
              >
                <option value="">Pick your area</option>
                {mockAreas.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.name}
                  </option>
                ))}
              </select>
            </fieldset>

            {error && <p className="text-error text-sm">{error}</p>}

            <button type="submit" className="btn btn-primary mt-2">
              Register
            </button>
          </form>

          <p className="text-sm text-center mt-4">
            Already have an account?{" "}
            <Link href="/login" className="link link-primary">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
