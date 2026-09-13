"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginSchema } from "@/lib/validation";
import AuthIntro from "@/components/auth-intro";

export default function LoginPage() {
  const router = useRouter();

  // One object holds every field on the form, same as formData in class.
  const [formData, setFormData] = useState({
    login: "",
    password: "",
  });

  const [error, setError] = useState("");

  function handleChange(e: any) {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  }

  async function handleSubmit(e: any) {
    e.preventDefault();

    // Ask zod: "does this data follow the rules?"
    const result = loginSchema.safeParse(formData);

    if (!result.success) {
      // Just show the first problem it found.
      setError(result.error.issues[0].message);
      return;
    }

    try {
      // Ask the real backend to check the email/phone + password.
      // "/api/..." gets forwarded to the backend by next.config.ts.
      const response = await axios.post("/api/auth/login", {
        login: formData.login,
        password: formData.password,
      });

      // Just save the token and the user straight into localStorage,
      // plain and simple, no helper functions needed.
      localStorage.setItem("access_token", response.data.accessToken);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      setError("");
      router.push(`/dashboard/${response.data.user.role}`);
    } catch (err) {
      setError("Something went wrong, please try again");
    }
  }

  return (
    <main className="flex flex-1 items-center justify-center bg-gray-900 px-4 py-16">
      <div className="w-full max-w-4xl overflow-hidden rounded-lg shadow-xl">
        <div className="grid grid-cols-1 bg-gray-800 md:grid-cols-2">
          <AuthIntro />

          <div className="px-8 py-16">
            <h2 className="mb-2 text-center text-2xl font-semibold text-gray-100">
              Log in
            </h2>
            <p className="mb-4 text-center text-sm text-gray-400">
              Use the email or phone you registered with.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-300">
                  Email or phone
                </label>
                <input
                  type="text"
                  name="login"
                  value={formData.login}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full rounded-md border border-gray-600 bg-gray-900 px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-300">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="********"
                  className="w-full rounded-md border border-gray-600 bg-gray-900 px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {error && <p className="text-sm text-red-400">{error}</p>}

              <button
                type="submit"
                className="mt-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Log in
              </button>
            </form>

            <p className="mt-4 text-center text-sm text-gray-400">
              No account yet?{" "}
              <Link href="/register" className="text-blue-400 hover:underline">
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
