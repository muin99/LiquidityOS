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
    <main className="flex-1 flex items-center justify-center bg-base-200 px-4 py-16">
      <div className="card w-full max-w-4xl shadow-xl overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 bg-base-100">
          <AuthIntro />

          <div className="py-16 px-8">
            <h2 className="text-2xl font-semibold mb-2 text-center">Log in</h2>
            <p className="text-sm text-base-content/60 text-center mb-4">
              Use the email or phone you registered with.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <fieldset className="fieldset">
                <label className="label">Email or phone</label>
                <input
                  type="text"
                  name="login"
                  value={formData.login}
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
                  placeholder="********"
                  className="input w-full"
                />
              </fieldset>

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
      </div>
    </main>
  );
}
