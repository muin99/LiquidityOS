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
      try {
        const [areasResponse, providersResponse] = await Promise.all([
          axios.get("/api/areas"),
          axios.get("/api/providers"),
        ]);
        setAreas(areasResponse.data);
        setProviders(providersResponse.data);
      } catch {
        setError(
          "Registration options could not be loaded. Make sure the backend is running.",
        );
      }
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
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.message;
        setError(
          Array.isArray(message)
            ? message.join(", ")
            : message || "Something went wrong, please try again",
        );
      } else {
        setError("Something went wrong, please try again");
      }
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <main className="flex flex-1 items-center justify-center bg-gray-100 px-4 py-16">
        <div className="max-w-sm rounded-lg border border-green-200 bg-green-50 p-4 text-green-800">
          {successMessage} Redirecting you to the login page…
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 items-center justify-center bg-gray-100 px-4 py-16">
      <div className="w-full max-w-4xl overflow-hidden rounded-lg shadow-xl">
        <div className="grid grid-cols-1 bg-white md:grid-cols-2">
          <AuthIntro />

          <div className="px-8 py-16">
            <h2 className="mb-2 text-center text-2xl font-semibold text-gray-900">
              Create an account
            </h2>
            <p className="mb-4 text-center text-sm text-gray-500">
              Sign up as an agent, a coordinator, or a provider. An admin has
              to approve your account before you can log in.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Full name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Karim Ahmed"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="text"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Confirm password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  I am a
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="agent">Agent</option>
                  <option value="coordinator">Coordinator</option>
                  <option value="provider">Provider</option>
                </select>
              </div>

              {formData.role !== "provider" && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Area
                  </label>
                  <select
                    name="areaId"
                    value={formData.areaId}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Pick your area</option>
                    {areas.map((area) => (
                      <option key={area.id} value={area.id}>
                        {area.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {formData.role === "provider" && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Which provider are you
                  </label>
                  <select
                    name="providerId"
                    value={formData.providerId}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Pick a provider</option>
                    {providers.map((provider) => (
                      <option key={provider.id} value={provider.id}>
                        {provider.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="mt-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? "Registering..." : "Register"}
              </button>
            </form>

            <p className="mt-4 text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-600 hover:underline">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
