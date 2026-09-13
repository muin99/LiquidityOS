"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerSchema } from "@/lib/validation";
import AuthIntro from "@/components/auth-intro";

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
    providerId: "",
  });

  // These start empty and get filled in from the real backend once
  // the page loads. Then we use them to build the dropdowns below.
  const [areas, setAreas] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // As soon as the page opens, go ask the backend for the list of
  // areas and providers, so the dropdowns below have real options.
  useEffect(() => {
    async function getData() {
      const areasResponse = await axios.get("/api/areas");
      setAreas(areasResponse.data);

      const providersResponse = await axios.get("/api/providers");
      setProviders(providersResponse.data);
    }

    getData();
  }, []);

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

  async function handleSubmit(e: any) {
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

    // A provider account has to say WHICH provider they represent.
    // Everyone else has to say which area they work in.
    if (formData.role === "provider" && !formData.providerId) {
      setError("Please pick which provider you are");
      return;
    }
    if (formData.role !== "provider" && !formData.areaId) {
      setError("Please pick your area");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      const response = await axios.post("/api/auth/register", {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        areaId: formData.role === "provider" ? undefined : formData.areaId,
        providerId:
          formData.role === "provider" ? formData.providerId : undefined,
      });

      setSuccessMessage(response.data.message);
      setSubmitted(true);
    } catch (err) {
      setError("Something went wrong, please try again");
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <main className="flex-1 flex items-center justify-center bg-base-200 px-4 py-16">
        <div className="alert alert-success max-w-sm">
          <span>{successMessage} Redirecting you to the login page…</span>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 flex items-center justify-center bg-base-200 px-4 py-16">
      <div className="card w-full max-w-4xl shadow-xl overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 bg-base-100">
          <AuthIntro />

          <div className="py-16 px-8">
            <h2 className="text-2xl font-semibold mb-2 text-center">
              Create an account
            </h2>
            <p className="text-sm text-base-content/60 text-center mb-4">
              Sign up as an agent, a coordinator, or a provider. An admin has
              to approve your account before you can log in.
            </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
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
                <option value="provider">Provider</option>
              </select>
            </fieldset>

            {formData.role !== "provider" && (
              <fieldset className="fieldset">
                <label className="label">Area</label>
                <select
                  name="areaId"
                  value={formData.areaId}
                  onChange={handleChange}
                  className="select w-full"
                >
                  <option value="">Pick your area</option>
                  {areas.map((area) => (
                    <option key={area.id} value={area.id}>
                      {area.name}
                    </option>
                  ))}
                </select>
              </fieldset>
            )}

            {formData.role === "provider" && (
              <fieldset className="fieldset">
                <label className="label">Which provider are you</label>
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
            )}

            {error && <p className="text-error text-sm">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary mt-2"
            >
              {submitting ? "Registering..." : "Register"}
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
      </div>
    </main>
  );
}
